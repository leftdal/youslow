var player;
var IP ='';
var bufferingDuration=0;
var isReported = false;
var hostname = 'none';
var city = 'none';
var region = 'none';
var country = 'none';
var loc = 'none';
var org = 'none';
var startBufferingTime =0;
var isBuffering = false;
var isloaded=false;
var NumOfResolutionChanges=1;
var requestedResolutions = '';
var startTime=null;
var endTime=null;
var elapsedTime=0;
var isMainVideoStarted=false;
var initialBufferingStartTime=null;
var initialBufferingEndTime=null;
var elapsedinitialBufferingTime=0;
var isInitialBuffering = false;
var bufferingStatusUpdateValue="";
var previouslyAbandonedDuetoBuffering = 0;
var avglatency="";
var timeReport =null;
var AllAdsLength="";
var isPlayingAds=false;
var isPlayingMainVideo=false;
var AdsStartTime=0;
var AdsEndTime=0;
var resultsFromContentScript="";

var T_AllAdsLength="";
var T_localtime=null;
var T_hostname=null;
var T_city=null;
var T_region=null;
var T_country=null;	
var T_loc=null;
var T_org=null;
var T_bufferduration=null;
var T_resolutionchanges=null;
var T_requestedresolutions=null;
var T_timelength=null;
var T_initialbufferingtime=null;
var T_abandonment=null;
var T_bufferflag=null;
var T_avglatency=null;
var T_requestedresolutionswithtime='';
var T_numofrebufferings=0;
var T_bufferdurationwithtime='';
var T_fraction=0;
var T_available_video_quality='';
var T_previouslyAbandonedDuetoBuffering = 0;


var video_url=null;
var current_video_url=null;
var requestedresolutionswithtime='';
var numofrebufferings=0;
var bufferdurationwithtime='';
var available_video_quality='';
var fraction=0;
var stop_video_url_change_report=false;
var PlaybackQualityChange_before='';
var bufferdurationwithtime_start_elapsedTime='';

var previouslyAbandonedDuetoBuffering_one_second_ago=0;
var fraction_one_second_ago=0;
var avglatency_one_second_ago=0;
var bufferdurationwithtime_one_second_ago='';
var elapsedinitialBufferingTime_one_second_ago=0;


var version='Chrome 1.2.6';




function onYouTubePlayerReady(playerId) {
	
	if(!isloaded){
		isloaded = true;
		console.log("YouSlow: New video session started!");

		/*
		 * Locally obtain client IP address and geo-location information
		 */
		IP = getIP();
		getUserInfo();		
	}
	

	player = document.getElementById("movie_player");

	
	/*
	 * In case that, fail to detect video players in Chrome browsers
	 */
	if(player == null)
		player = document.getElementById("ytPlayer");
	if(player == null)
		player = document.getElementById("myytplayer");
	
	
	
	/*
	 * Go through abandonment check
	 * This is caused when a client stopped watching a video due to the buffer stalling previously
	 * The information is locally save on client's device.
	 * When a client watches the video again or new video, it checks if it needs to report the abandonment to monitoring server.
	 */
	report_previously_closed_events();
	
	
	
	/*
	 * Save default playbackQuality
	 */
	requestedResolutions = player.getPlaybackQuality()+":";
	PlaybackQualityChange_before=player.getPlaybackQuality();
	requestedresolutionswithtime='0?'+player.getPlaybackQuality()+":";
	
	
	/*
	 * addEventListener
	 */
	player.addEventListener("onStateChange", "state");
	player.addEventListener("onPlaybackQualityChange", "PlaybackQualityChange");
	

	
	
	/*
	 * check initial bufferingTime after player loaded
	 * This prevents from being too late to get initial player status, in order to measure initial buffering time
	 * Initial buffering time: from the instant the video player has been loaded to it is actually playing the video
	*/
	var initialState = player.getPlayerState();
	if(initialState==-1){
		isInitialBuffering = true;
		initialBufferingStartTime = new Date();
	}
		

	
	
	
	/*
	 * Gather all available bitrates of the video
	 */
	available_video_quality = '';
	var quality_list = player.getAvailableQualityLevels();
	for (var prop in quality_list) {
		  if (quality_list.hasOwnProperty(prop)) {
			  available_video_quality = available_video_quality+quality_list[prop]+":";
		  }
	}

	
	
	

	/* Instead,
	 * automatically increases elapsedTime by 1
	 */
	setInterval(function(){
		
		/*
		 * For safety check
		 * We save temp parameter that are used to report data
		 * It prevents from being reported with newly replaced data
		 */
		previouslyAbandonedDuetoBuffering_one_second_ago=previouslyAbandonedDuetoBuffering;
		fraction_one_second_ago=fraction;
		avglatency_one_second_ago=avglatency;
		bufferdurationwithtime_one_second_ago=bufferdurationwithtime;
		elapsedinitialBufferingTime_one_second_ago=elapsedinitialBufferingTime;

		
		/*
		 * Monitor video url changes every second, since version 1.2.0
		 */
		checkVideoURLchange();

		
		var currentState=player.getPlayerState();
		
		
		/*
		 * update current video loaded fraction
		 * During video Ads, video fraction is always ZERO
		 * During video Ads, player status is 3
		 * Except cases video CUED and PAUSED
		 * When CUED and PAUSED it returns ZERO
		 */
		if(currentState!=2 && currentState!=5){
			fraction = player.getVideoLoadedFraction();
		}
		
		/*
		 * Every second, we check buffering flag
		 * In case that, when refreshing browser, the state listener may NOT catch the pre-roll Ads
		 * To prevent this, we check it every second
		 */
		if(currentState==3){
			
			/*
			 * Turn on rebuffering flag for the case where client closes video before rebuffering ends
			 */
			previouslyAbandonedDuetoBuffering=1;
			
			if(!isBuffering){
				
				startBufferingTime = Math.ceil(new Date().getTime() / 1000);
				isBuffering = true;
				
				/*
				 * BufferStalling status update
				 */
				bufferingStatusUpdateValue = "UP";
				bufferdurationwithtime_start_elapsedTime=elapsedTime.toString();
				bufferdurationwithtime = bufferdurationwithtime+bufferdurationwithtime_start_elapsedTime+'?';
				bufferingStatusUpdate();
				
				/*
				 * Pre-roll Ads contained initial buffering time
				 * So, initial buffering time include pre-roll ads and rebuffering at the beginning
				 */
				if(elapsedTime<=1){
					isInitialBuffering = true;
					initialBufferingStartTime = new Date();

					/*
					 * In case that this is due to pre-roll ads
					 * We also turn on the ads flag for pre-roll ads
					 */
					AdsStartTime = new Date().getTime() / 1000;
				}
				
			}
		}
		
		
		/*
		 * We do not increase elapsed time when current state is PAUSED and CUED
		 */
		if(currentState!=2 && currentState!=5){
			elapsedTime = elapsedTime+1;
		}

		
		if(currentState==1){
			
			/*
			 * Change flag to the case closed by clients
			 * For the case where clients close during video playback
			 */
			previouslyAbandonedDuetoBuffering=2;
			bufferingStatusUpdateValue = "DOWN(PLAYING)";
			
			
			/*
			 * We chack initial buffering status every second
			 */
			if(isInitialBuffering){
				isInitialBuffering = false;
				initialBufferingEndTime = new Date();
				var timeDiff = initialBufferingEndTime - initialBufferingStartTime;
				elapsedinitialBufferingTime = timeDiff;
				console.log("YouSlow: elapsedinitialBufferingTime: "+elapsedinitialBufferingTime);				
			}
			
			
			/*
			 * We chack buffering status every second
			 */
			if(isBuffering){
				isBuffering = false;
				var endBufferingTime = Math.ceil(new Date().getTime() / 1000);
				var timeDiff = endBufferingTime - startBufferingTime;

				/*
				 * Sometimes buffering length == 0
				 * We round up
				 */
				if(timeDiff==0)
					timeDiff=1;
				
				numofrebufferings = numofrebufferings+1;
				bufferingDuration = bufferingDuration+timeDiff;
				bufferdurationwithtime = bufferdurationwithtime+timeDiff.toString()+':';
				bufferdurationwithtime_start_elapsedTime='';
			}
			
			
			/*
			 * We are currently playing the main video
			 */
			isPlayingMainVideo=true;
			if(isPlayingAds){

				/*
				 * Ads length update
				 */
				AdsEndTime = new Date().getTime() / 1000;
	    		var tmp_videoAdsLength=AdsEndTime-AdsStartTime;
	    		var tmp_rounded_videoAdsLength=Math.round(tmp_videoAdsLength);
	    		AllAdsLength = AllAdsLength+tmp_rounded_videoAdsLength.toString()+":";
				isPlayingAds=false;
				
			}
		}
		
		
		/*
		console.log("=============================================================");
		console.log("YouSlow status: "+currentState);
		console.log("YouSlow elapsed time: "+elapsedTime);
		console.log("YouSlow fraction: "+fraction);
		console.log("YouSlow isBuffering: "+isBuffering);
		console.log("YouSlow isPlayingAds: "+isPlayingAds);
		console.log("YouSlow bufferingStatusUpdateValue: "+bufferingStatusUpdateValue);
		console.log("YouSlow previouslyAbandonedDuetoBuffering: "+previouslyAbandonedDuetoBuffering);
		console.log("YouSlow AllAdsLength: "+AllAdsLength);
		console.log("YouSlow avglatency: "+avglatency);
		console.log("YouSlow elapsedinitialBufferingTime: "+elapsedinitialBufferingTime);
		console.log("YouSlow bufferdurationwithtime: "+bufferdurationwithtime);
		console.log("YouSlow bufferdurationwithtime_one_second_ago: "+bufferdurationwithtime_one_second_ago);
		*/
		

	},1000);
	
	
	
	
	
	/*
	 * Locally saved every 5seconds and every time player's status changes
	 * Quota limits 10 per a minute for sync
	 * This is for the case where client closes browser without reporting data
	 * The old measurement will be reported when the client watches video again
	 */
	setInterval(function(){
		
		var initialState = player.getPlayerState();
        if(initialState==1){ // Video playing
			bufferingStatusUpdateValue = "DOWN(PLAYING)";
			bufferingStatusUpdate();
		}else if(initialState==-1){ // Video not started
			bufferingStatusUpdateValue = "NOT STARTED";
			bufferingStatusUpdate();
		}else if(initialState==0){ // Video ended
			/*
			 * Do not update buffering status since it automatically reports when video ends
			 */
			bufferingStatusUpdateValue = "DOWN(END)";
		}else if(initialState==3){ // Video rebuffering
			bufferingStatusUpdateValue = "UP";
			bufferingStatusUpdate();
		}
        
         
	},5000);
	
	
	
	

    


}




function checkVideoURLchange() {
	current_video_url = player.getVideoUrl();
	var tmp_video_url = current_video_url.split("v=");
	// If it contains video URL
	if(current_video_url.indexOf('v=') > -1 && video_url!=null){
		if(video_url != tmp_video_url[1]){
			if(video_url=="ALREADY REPORTED"){
				console.log("YouSlow: Video ended and already reported!");
				stop_video_url_change_report=true;
			}else{
				if(!stop_video_url_change_report){
					console.log("YouSlow: video url changed!!");

					
					/*
		        	 * Call locally saved event data and report for the video URL change events
		        	 */
					safe_previouslyAbandonedDuetoBuffering=previouslyAbandonedDuetoBuffering;
		        	call_data_for_video_url_change_event();

				
				}
				stop_video_url_change_report=false;
			}
		}
	}
	video_url=tmp_video_url[1];
}



/*
 * Obtaion client IP locally
 */
function getIP() {
	if (window.XMLHttpRequest) xmlhttp = new XMLHttpRequest();
    else xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
	console.log("YouSlow: We use api.ipify.info to find a host IP address.");
    xmlhttp.open("GET","https://api.ipify.org/",false);
    xmlhttp.send();
    hostipInfo = xmlhttp.responseText.trim();
    if(hostipInfo.length>3)
    	return hostipInfo;
    return false;
}



function getUserInfo(){
	
	/*
	 * Request Dyswis server to find the geolocation info.
	 * We implemented this system in case that Chrome Web browser prevents HTTP GET request
	 */
	var userInfoURL = "https://dyswis.cs.columbia.edu/youslow/getinfo.php?"+IP.trim();
	console.log("YouSlow: We use ipinfo.io to find an approximate location");
	
	var xhr = new XMLHttpRequest();
	xhr.open("GET", userInfoURL, true);
	xhr.onreadystatechange = function() {
	  if (xhr.readyState == 4) {
		  
		var resp = xhr.responseText;
	    var obj = JSON.parse(resp);

	    
	    /*
	     console.log("YouSlow obj: "+resp);
	     console.log("YouSlow 1: "+obj.ip);
	     console.log("YouSlow 2: "+obj.hostname);
	     console.log("YouSlow 3: "+obj.city);
	     console.log("YouSlow 4: "+obj.region);
	     console.log("YouSlow 5: "+obj.country);
	     console.log("YouSlow 6: "+obj.loc);
	     console.log("YouSlow 7: "+obj.org);
	     */

	    
	    hostname = obj.hostname;
	    city = obj.city;
	    region = obj.region;
	    country = obj.country;
	    loc = obj.loc;
	    org = obj.org;
	    
	    if(hostname != null){
	    	hostname = hostname.trim();
	    }
	    if(city != null){
	    	city = city.trim();
	    }
	    if(region != null){
	    	region = region.trim();
	    }
	    if(country != null){
	    	country = country.trim();
	    }
	    if(loc != null){
	    	loc = loc.trim();
	    }
	    if(org != null){
	    	org = org.trim();
	    }

	  }
	}
	xhr.send();

	
	
	/* There is quota limit
	 * If TOO many request happen
	 * We take alternative solutions
	 */
	if(country == 'none'){
		
		/*
		 * We use ip-api.com
		 */
		var userInfoURL = "https://dyswis.cs.columbia.edu/youslow/getinfo_ip_api.php?"+IP.trim();
		var xhr3 = new XMLHttpRequest();
		xhr3.open("GET", userInfoURL, true);
		xhr3.onreadystatechange = function() {

			if (xhr3.readyState == 4) {
				
				var resp = xhr3.responseText;
			    var obj = JSON.parse(resp);			    
			    city = obj.city;
			    region = obj.regionName;
			    country = obj.country;
			    var lat=obj.lat;
			    var lon=obj.lon;
			    loc =lat+","+lon;
			    org = obj.isp;
			    
			    if(hostname != null){
			    	hostname = hostname.trim();
			    }
			    if(city != null){
			    	city = city.trim();
			    }
			    if(region != null){
			    	region = region.trim();
			    }
			    if(country != null){
			    	country = country.trim();
			    }
			    if(loc != null){
			    	loc = loc.trim();
			    }
			    if(org != null){
			    	org = org.trim();
			    }
			    
			    /*
			    console.log("YouSlow hostname: "+hostname);
			    console.log("YouSlow city: "+city);
			    console.log("YouSlow region: "+region);
			    console.log("YouSlow country: "+country);
			    console.log("YouSlow loc: "+loc);
			    console.log("YouSlow org: "+org);
				*/
			}
		}
		
		xhr3.send();

		
		
		/*
		 * If we failed for both cases due to quota limit,
		 * We try to get the GeoInfo from the Client's side.
		 * Wait for 1second until geo-location data updated.
		 */
		setTimeout(function(){
			GetGeoInfoClientSide();
		},1000);
	
		
		
	}
	

	
}




function GetGeoInfoClientSide() {

	
	/*
	 * If TOO many request happen
	 * We take alternative solutions
	 * Contain hardcoded implementation - not preferred
	 */
	
	if(country == 'none'){
		
		console.log("YouSlow: We take alternative method to get user information. ");
		
		var userInfoURL = "https://ipinfo.io/";
		
		var xhr2 = new XMLHttpRequest();
		xhr2.open("GET", userInfoURL, true);
		xhr2.onreadystatechange = function() {
			
			if (xhr2.readyState == 4) {
			  
			  var resp = xhr2.responseText;
			  var split_resp = resp.split("pre>");
			  var split_resp2 = resp.split("\n");			  
			  
			  var new_resp = split_resp[1];
			  
			  var new_resp2 = new_resp.replace(new RegExp(";,", 'g'), "@");
			  var new_resp3 = new_resp2.replace(new RegExp("&quot", 'g'), "");
			  var new_resp4 = new_resp3.replace(new RegExp(";", 'g'), "");
			  var new_resp5 = new_resp4.replace(new RegExp(" ", 'g'), ""); 
			  var split_new_resp = new_resp5.split("@");
			  
			  var index=0;
			  var targeted_index=0;

			  for (i=0;i<split_new_resp.length;i++){
				  if(split_new_resp[i].trim().length>1){
					  
					  /*
					   * This is hardcoded 
					   * Parsing web contents
					   * highly not preferred
					   */
					  var split_new_resp2 = split_new_resp[i].split(":");
					  
					  if (split_new_resp[i].indexOf("hostname") > -1){
						  hostname = split_new_resp2[1];
					  }else if (split_new_resp[i].indexOf("city") > -1){
						  city = split_new_resp2[1];
					  }else if (split_new_resp[i].indexOf("region") > -1){
						  region = split_new_resp2[1];
					  }else if (split_new_resp[i].indexOf("country") > -1){
						  country = split_new_resp2[1];
					  }else if (split_new_resp[i].indexOf("loc") > -1){
						  loc = split_new_resp2[1];
					  }else if (split_new_resp[i].indexOf("org") > -1){
						  org = split_new_resp2[1];
					  }
				  }
			  }
			  
			if(hostname != null){
		    	hostname = hostname.trim();
		    }
		    if(city != null){
		    	city = city.trim();
		    }
		    if(region != null){
		    	region = region.trim();
		    }
		    if(country != null){
		    	country = country.trim();
		    }
		    if(loc != null){
		    	loc = loc.trim();
		    }
		    if(org != null){
		    	org = org.trim();
		    }
		    
		  /*
		   * This is hardcoded 
		   * Parsing web contents
		   * highly not preferred
		   */
		    if(country=='none'){
				  for (i=0;i<split_resp2.length;i++){
					  if(split_resp2[i].indexOf("<td>Network</td>") > -1){
						  var temp=split_resp2[i+1];
						  var temp_split = temp.split("</a>");
						  var temp_hostname = temp_split[1];
						  temp_hostname = temp_hostname.replace("</td>", "");
						  org=temp_hostname.trim();
					  }else if(split_resp2[i].indexOf("<td>City</td>") > -1){
						  var temp=split_resp2[i+3];
						  var temp_split = temp.split(", ");
						  city = temp_split[0].trim();
						  region = temp_split[1].trim();
						  country = temp_split[2].trim();
					  }else if(split_resp2[i].indexOf("<td>Latitude/Longitude</td>") > -1){
						  var temp=split_resp2[i+1];
						  var temp_split = temp.split("\"");
						  loc = temp_split[1].trim();
					  }
				  }		    	
		    }
		    
		    /*
		    console.log("YouSlow hostname: "+hostname);
		    console.log("YouSlow city: "+city);
		    console.log("YouSlow region: "+region);
		    console.log("YouSlow country: "+country);
		    console.log("YouSlow loc: "+loc);
		    console.log("YouSlow org: "+org);
		     */
	
		  }
		}
		xhr2.send();
	
	}

}










/*
 * Event listener for PlaybackQualityChange
 */
function PlaybackQualityChange() { 
	var currentState = player.getPlaybackQuality();
	if(PlaybackQualityChange_before != currentState){
		requestedResolutions = requestedResolutions+currentState+":";
		requestedresolutionswithtime = requestedresolutionswithtime+elapsedTime.toString()+"?"+currentState+":";
		console.log("YouSlow: PlaybackQualityChange- "+currentState);
		NumOfResolutionChanges = NumOfResolutionChanges+1;
	}
	PlaybackQualityChange_before=currentState;
}











/*
 * Event listener for player status change
 * 
 * YouTube player status
 * -1 (unstarted)
 * 0 (ended)
 * 1 (playing)
 * 2 (paused)
 * 3 (buffering)
 * 5 (video cued)
 */

function state() { 
	
	var currentState = player.getPlayerState();
//	console.log("YouSlow: video player currentState = "+currentState);
	
	if(currentState==3){
		
		
		bufferingStatusUpdateValue = "UP";
		bufferingStatusUpdate();
		
		/*
		 * Since version 1.2.2
		 * We check buffering or Ads case every second
		 */
		
	}else if(currentState==0){
		
		/*
		 * We monitor URL every second 
		 * The following flag prevents reporting data twice
		 */
		video_url="ALREADY REPORTED";
		report();	
		
	}else if(currentState==-1){
		
		/*
		 * Turn on initial buffering measurements
		 */
		isInitialBuffering = true;
		initialBufferingStartTime = new Date();

		
	}else{
		
		if(currentState==1){

			if(!isMainVideoStarted){
        		isMainVideoStarted=true;
        	}
			
						
			/*
			 * BufferStalling status update
			 */
			bufferingStatusUpdateValue = "DOWN(PLAYING)";
			bufferingStatusUpdate();
			
		}
		
		if(currentState==2){
			
			/*
			 * BufferStalling status update
			 */
			bufferingStatusUpdateValue = "DOWN(PAUSED)";
			bufferingStatusUpdate();
		}
		
	}
	
}



/*
 * initialize all parameters
 */
function initialData(){
	isBuffering = false;
	bufferingDuration = 0;
	NumOfResolutionChanges = 1;
	requestedResolutions = player.getPlaybackQuality()+":";
	elapsedTime = 0;
	startTime = null;
	initialBufferingStartTime=null;
	initialBufferingEndTime=null;
//	elapsedinitialBufferingTime=0;
	isInitialBuffering = false;
	previouslyAbandonedDuetoBuffering = 0;
	avglantecy="";
	requestedresolutionswithtime='0?'+player.getPlaybackQuality()+":";
	numofrebufferings=0;
	bufferdurationwithtime='';
	available_video_quality='';
	fraction=0;
	isPlayingAds=false;
	isPlayingMainVideo=false;
	AllAdsLength="";
	isMainVideoStarted=false;
}




/*
 * initialize all locally saved parameters
 */
function initialData_T(){
	T_isBuffering = false;
	T_bufferingDuration = 0;
	T_NumOfResolutionChanges = 1;
	T_requestedResolutions = player.getPlaybackQuality()+":";
	T_elapsedTime = 0;
	T_startTime = null;
	T_initialBufferingStartTime=null;
	T_initialBufferingEndTime=null;
//	T_elapsedinitialBufferingTime=0;
	T_isInitialBuffering = false;
	T_previouslyAbandonedDuetoBuffering = 0;
	T_avglantecy="none";
	T_requestedresolutionswithtime='0?'+player.getPlaybackQuality()+":";
	T_numofrebufferings=0;
	T_bufferdurationwithtime='';
	T_available_video_quality='';
	T_fraction=0;
	T_AllAdsLength="";
	
}



function call_data_for_video_url_change_event(){
	
	var localTime = new Date();
    var year= localTime.getFullYear()+'';
    var month= (localTime.getMonth()+1)+'';
    var date = localTime.getDate()+'';
    var hours = localTime.getHours()+'';
    var minutes = localTime.getMinutes()+'';
    var seconds = localTime.getSeconds()+'';    
    timeReport = year+"-"+month+"-"+date+" "+hours+":"+minutes+":"+seconds;
    

	if(city != null){    
		city = convert(city);
	}
	if(region != null){
    	region = convert(region);
    }
    
	org = org.replace("&","");
	
	var isGood = true;
		
	if( country==null || country.length < 1 || country=='none' || country==''){
		isGood = false;
	}
	
	/*
	 * Total timelength should also count bufferingDuration
	 */
	if(bufferingDuration>elapsedTime)
		isGood = false;
	
	
	/*
	 * The below msg appears if no good, No-good msg prevents the unnecssarry report when the url changes 
	 */
	if(!isGood){
		
		console.log('No good at call_data_for_video_url_change_event');
		console.log("YouSlow: Decline report request!");

		/*
		 * Initialized all data
		 */
		initialData();
		
		available_video_quality = '';
		var quality_list = player.getAvailableQualityLevels();
		for (var prop in quality_list) {
			  if (quality_list.hasOwnProperty(prop)) {
				  available_video_quality = available_video_quality+quality_list[prop]+":";
			  }
		}
		
		
	}

	
	
	
    /*
     * Update available quality for the just closed video
     */
	available_video_quality = '';
	var quality_list = player.getAvailableQualityLevels();
	for (var prop in quality_list) {
		  if (quality_list.hasOwnProperty(prop)) {
			  available_video_quality = available_video_quality+quality_list[prop]+":";
		  }
	}
	
	
	/*
	 * For safety check
	 * if last char of bufferdurationwithtime is '?'
	 * We consider this abandonment
	 */
	var lastChar = bufferdurationwithtime_one_second_ago.substr(bufferdurationwithtime_one_second_ago.length-1);
	if(lastChar=='?')
		previouslyAbandonedDuetoBuffering_one_second_ago=1;
	else
		previouslyAbandonedDuetoBuffering_one_second_ago=2;

	
	/*
	 * It is NOT possible timelength is zero
	 */
	if(elapsedTime==0)
		isGood=false;
	
	
	if(isGood){
	    var URLparameters = "localtime="+timeReport	
							+"&hostname="+hostname
							+"&city="+city
							+"&region="+region
							+"&country="+country
							+"&loc="+loc
							+"&org="+org
							+"&numofrebufferings="+numofrebufferings.toString()
							+"&bufferduration="+bufferingDuration
							+"&bufferdurationwithtime="+bufferdurationwithtime
							+"&resolutionchanges="+NumOfResolutionChanges
							+"&requestedresolutions="+requestedResolutions
							+"&requestedresolutionswithtime="+requestedresolutionswithtime
							+"&timelength="+elapsedTime.toString()
							+"&initialbufferingtime="+elapsedinitialBufferingTime_one_second_ago.toString()
							+"&abandonment="+previouslyAbandonedDuetoBuffering_one_second_ago.toString()+":"+fraction_one_second_ago.toString()
	    					+"&avglatency="+avglatency_one_second_ago //Need to check
	    					+"&allquality="+available_video_quality
	    					+"&version="+version
	    					+"&adslength="+AllAdsLength;
		
	    var videoInfoURL = "https://dyswis.cs.columbia.edu/youslow/dbupdatesecured10.php?"+(URLparameters);
	    
	    
	    console.log("YouSlow: reported URLparameters - "+URLparameters);
	    
		var xhr = new XMLHttpRequest();
		xhr.open("GET", videoInfoURL, true);
		xhr.onreadystatechange = function() {
		  //console.log("HTTP STATE: "+xhr.readyState);
		  if (xhr.readyState == 4) {
		    console.log("YouSlow: buffering events reported...");
		    initialData();
		  }
		}
		xhr.send();
		
	}
	
	
	
	
	
	
	
	
	
	
//	
	/*
	 * Report measurements for previouly closed video based on the locally saved measurements
	 */
//	if(isGood){
//	    var URLparameters = "localtime="+timeReport	
//							+"&hostname="+window.localStorage.getItem("hostname")
//							+"&city="+window.localStorage.getItem("city")
//							+"&region="+window.localStorage.getItem("region")
//							+"&country="+window.localStorage.getItem("country")
//							+"&loc="+window.localStorage.getItem("loc")
//							+"&org="+window.localStorage.getItem("org")
//							+"&numofrebufferings="+window.localStorage.getItem("numofrebufferings")
//							+"&bufferduration="+window.localStorage.getItem("bufferduration")
//							+"&bufferdurationwithtime="+window.localStorage.getItem("bufferdurationwithtime")
//							+"&resolutionchanges="+window.localStorage.getItem("resolutionchanges")
//							+"&requestedresolutions="+window.localStorage.getItem("requestedresolutions")
//							+"&requestedresolutionswithtime="+window.localStorage.getItem("requestedresolutionswithtime")
//							+"&timelength="+window.localStorage.getItem("timelength")
//							+"&initialbufferingtime="+tmp_elapsedinitialBufferingTime.toString()
//							+"&abandonment="+window.localStorage.getItem("abandonment")+":"+window.localStorage.getItem("fraction")
//							+"&avglatency="+T_avglatency //Should get T_avglatency
//							+"&allquality="+window.localStorage.getItem("allquality")
//	    					+"&version="+version
//	    					+"&adslength="+T_AllAdsLength;
//	    
//	    
//	    		
//	    var videoInfoURL = "https://dyswis.cs.columbia.edu/youslow/dbupdatesecured10.php?"+(URLparameters);
//	    
//	    console.log("YouSlow: reported URLparameters - "+URLparameters);
//	    					
//		var xhr = new XMLHttpRequest();
//		xhr.open("GET", videoInfoURL, true);
//		xhr.onreadystatechange = function() {
//		  if (xhr.readyState == 4) {
//		    console.log("YouSlow: buffering events reported for video URL changes...");
//		    previouslyAbandonedDuetoBuffering=0;
//		    
//		    initialData();
//		    
//		    /*
//		     * update all bitrates for the current video
//		     */
//			available_video_quality = '';
//			var quality_list = player.getAvailableQualityLevels();
//			for (var prop in quality_list) {
//				  if (quality_list.hasOwnProperty(prop)) {
//					  available_video_quality = available_video_quality+quality_list[prop]+":";
//				  }
//			}
//			
//		    
//		  }
//		}
//		xhr.send();
//		
//	}
	
	
	
	
}



function report_previously_closed_events(){

	console.log("YouSlow: Page reloaded..checking previously unreported data!");
	
	/*
	 * Only call when refresh the webpage
	 */
	bufferingStatusUpdateValue = "InitialCheck";
	bufferingStatusUpdate();
	
	
	document.addEventListener('fetchResponse', function respListener(event) {
		
		T_localtime = event.detail.localtime;	
        T_hostname = event.detail.hostname;
        T_city = event.detail.city;
        T_region = event.detail.region;
        T_country = event.detail.country;
        T_loc = event.detail.loc;
        T_org = event.detail.org;
        T_bufferduration = event.detail.bufferduration;
        T_resolutionchanges = event.detail.resolutionchanges;
        T_requestedresolutions = event.detail.requestedresolutions;
        T_timelength = event.detail.timelength;
        T_initialbufferingtime = event.detail.initialbufferingtime;
        T_abandonment = event.detail.abandonment;
        T_bufferflag = event.detail.bufferflag;
        T_avglatency = event.detail.avglatency;
        T_numofrebufferings = event.detail.numofrebufferings;
        T_bufferdurationwithtime = event.detail.bufferdurationwithtime;
        T_requestedresolutionswithtime = event.detail.requestedresolutionswithtime;
        T_available_video_quality = event.detail.allquality;
        T_fraction = event.detail.fraction;
        T_AllAdsLength=event.detail.AllAdsLength;
        
        
    	/*
    	 * For safety check
    	 * if last char of bufferdurationwithtime is '?'
    	 * We consider this abandonment
    	 */
    	var lastChar = T_bufferdurationwithtime.substr(T_bufferdurationwithtime.length - 1);
    	if(lastChar=='?')
    		T_bufferflag="UP";

    	
    	
    	
        /*
         * Report Abandonment in case that video session closes before reporting data
         * 0 : Video ended
         * 1 : Previously Stopped by BufferStalling
         * 2 : Previously Stopped by Clients
         */
        if(T_bufferflag=="UP"){
    		console.log("YouSlow: PreviouslyStoppedbyAdandonmentByBufferStalling!");
    		T_abandonment=1;
    		reportWithPreviousData();
    		
    	}else if(T_bufferflag=="DOWN" || T_bufferflag==null){
    		console.log("YouSlow: Previously--NOT--stoppedbyAdandonmentDuetoBufferStalling!");
    		T_abandonment=0;
    		
    	}else if(T_bufferflag=="DOWN(PLAYING)"){
    		console.log("YouSlow: PreviouslyStoppedbyAdandonmentByClients!");
    		T_abandonment=2;
    		reportWithPreviousData();
    	}
        document.removeEventListener('fetchResponse', respListener);
        
    });
		
}



/*
 * Every 5 seconds, we save data locally
 */
function bufferingStatusUpdate(){
	
	var localTime = new Date();
    var year= localTime.getFullYear()+'';
    var month= (localTime.getMonth()+1)+'';
    var date = localTime.getDate()+'';
    var hours = localTime.getHours()+'';
    var minutes = localTime.getMinutes()+'';
    var seconds = localTime.getSeconds()+'';    
    timeReport = year+"-"+month+"-"+date+" "+hours+":"+minutes+":"+seconds;

    /*
     * To prevent from reporting data after the new data is replaced
     * Therefore wait for 4 seconds, during the time, report data for video URL change events
     */
    if(elapsedTime>4){

    	
    	window.localStorage.removeItem("initialbufferingtime");      // <-- Local storage!
        window.localStorage.setItem("initialbufferingtime", elapsedinitialBufferingTime.toString());  // <-- Local storage!

    	window.localStorage.removeItem("localtime");      // <-- Local storage!
	    window.localStorage.setItem("localtime", timeReport);  // <-- Local storage!
	    
	    window.localStorage.removeItem("hostname");      // <-- Local storage!
	    window.localStorage.setItem("hostname", hostname);  // <-- Local storage!
	    
	    window.localStorage.removeItem("city");      // <-- Local storage!
	    window.localStorage.setItem("city", city);  // <-- Local storage!
	    
	    window.localStorage.removeItem("region");      // <-- Local storage!
	    window.localStorage.setItem("region", region);  // <-- Local storage!

	    window.localStorage.removeItem("country");      // <-- Local storage!
	    window.localStorage.setItem("country", country);  // <-- Local storage!

	    window.localStorage.removeItem("loc");      // <-- Local storage!
	    window.localStorage.setItem("loc", loc);  // <-- Local storage!

	    window.localStorage.removeItem("org");      // <-- Local storage!
	    window.localStorage.setItem("org", org);  // <-- Local storage!

	    window.localStorage.removeItem("bufferduration");      // <-- Local storage!
	    window.localStorage.setItem("bufferduration", bufferingDuration.toString());  // <-- Local storage!

	    window.localStorage.removeItem("resolutionchanges");      // <-- Local storage!
	    window.localStorage.setItem("resolutionchanges", NumOfResolutionChanges.toString());  // <-- Local storage!

	    window.localStorage.removeItem("requestedresolutions");      // <-- Local storage!
	    window.localStorage.setItem("requestedresolutions", requestedResolutions);  // <-- Local storage!

	    window.localStorage.removeItem("timelength");      // <-- Local storage!
	    window.localStorage.setItem("timelength", elapsedTime.toString());  // <-- Local storage!
	    
	    window.localStorage.removeItem("abandonment");      // <-- Local storage!
	    window.localStorage.setItem("abandonment", previouslyAbandonedDuetoBuffering.toString());  // <-- Local storage!

	    window.localStorage.removeItem("bufferflag");      // <-- Local storage!
	    window.localStorage.setItem("bufferflag", bufferingStatusUpdateValue);  // <-- Local storage!
	    
	    window.localStorage.removeItem("avglatency");      // <-- Local storage!
	    window.localStorage.setItem("avglatency", avglatency);  // <-- Local storage!

	    window.localStorage.removeItem("requestedresolutionswithtime");      // <-- Local storage!
	    window.localStorage.setItem("requestedresolutionswithtime", requestedresolutionswithtime);  // <-- Local storage!

	    window.localStorage.removeItem("numofrebufferings");      // <-- Local storage!
	    window.localStorage.setItem("numofrebufferings", numofrebufferings.toString());  // <-- Local storage!

	    window.localStorage.removeItem("bufferdurationwithtime");      // <-- Local storage!
	    window.localStorage.setItem("bufferdurationwithtime", bufferdurationwithtime);  // <-- Local storage!
	    
	    window.localStorage.removeItem("fraction");      // <-- Local storage!
	    window.localStorage.setItem("fraction", fraction.toString());  // <-- Local storage!
	    
	    window.localStorage.removeItem("AllAdsLength");      // <-- Local storage!
	    window.localStorage.setItem("AllAdsLength", AllAdsLength);  // <-- Local storage!
	    
	    	    
	    
		available_video_quality = '';
		var quality_list = player.getAvailableQualityLevels();
		for (var prop in quality_list) {
			  if (quality_list.hasOwnProperty(prop)) {
				  available_video_quality = available_video_quality+quality_list[prop]+":";
			  }
		}
		
	    window.localStorage.removeItem("allquality");      // <-- Local storage!
	    window.localStorage.setItem("allquality", available_video_quality);  // <-- Local storage!
	    


    }
    
    var eventDetail = {
    		"localtime": timeReport,	
    		"hostname": hostname,
    		"city": city,
    		"region": region,
    		"country": country,
    		"loc": loc,
    		"org": org,
    		"numofrebufferings": numofrebufferings.toString(),
    		"bufferduration": bufferingDuration.toString(),
    		"bufferdurationwithtime": bufferdurationwithtime,
    		"resolutionchanges": NumOfResolutionChanges.toString(),
    		"requestedresolutions": requestedResolutions,
    		"requestedresolutionswithtime": requestedresolutionswithtime,
    		"timelength": elapsedTime.toString(),
    		"initialbufferingtime": elapsedinitialBufferingTime.toString(),
    		"abandonment": previouslyAbandonedDuetoBuffering.toString(),
    		"bufferflag": bufferingStatusUpdateValue,
    		"avglatency": avglatency,
    		"allquality": available_video_quality,
    		"fraction": fraction.toString(),
    		"AllAdsLength": AllAdsLength
    		

    		/*
    		 * avglatency updated in contentscript.js page
    		 */
    		
    };
    
	document.dispatchEvent(new CustomEvent('BufferingStatus', {
		"detail": eventDetail
	}));
	
	

	
	
	
	/*
	 * event listener for getFromContentScript
	 */
	document.addEventListener('getFromContentScript', function(event) {
	    var dataFromPage = event.detail;
	    resultsFromContentScript=dataFromPage;
	    
	    
	    var tmp_split=resultsFromContentScript.split("&");
	    var tmp_avglatency=tmp_split[0];
	    var tmp_isvideoAds=tmp_split[1];

	    avglatency=tmp_avglatency;
	    
	    /*
	     * We only enable video ads flag
	     * when we found certain Ads url parameter in GET urls
	     */
	    if(tmp_isvideoAds=="true"){

	    	if(!isPlayingAds){
	    		
	    		AdsStartTime = new Date().getTime() / 1000;
	    		var CurrentStartTime=elapsedTime.toString();

    			/*
    			 * We only catch pre-roll ads
    			 * later we catch mid-roll ads
    			 */
	    		if(isInitialBuffering || CurrentStartTime<=1){
	    			var CurrentStartTime="0";
	    			AllAdsLength = CurrentStartTime+"?";
	    	    	isPlayingAds=true;
	    	    	isPlayingMainVideo=false;
	    		}else{
		    		//AllAdsLength = AllAdsLength+CurrentStartTime+"?";
	    		}
	    		
	    	}
	    }
	});
	
	
}

function reportWithPreviousData(){
	
	if(T_city != null){    
		T_city = convert(T_city);
	}
	if(T_region != null){
		T_region = convert(T_region);
    }
    
	T_org = T_org.replace("&","");
	
	var isGood = true;
	
	if( T_country==null || T_country.length < 1 || T_country=='none' || T_country==''){
		isGood = false;
	}
		
	/*
	 * Totaltimelength should also count bufferingDuration
	 */
	if(T_bufferduration>T_timelength)
		isGood = false;
	
	/*
	 * We set it false for abandonment is 2:0 
	 */
	var safety_check=T_abandonment.toString()+":"+T_fraction.toString();
	if(safety_check=='2:0' && T_timelength=='0'){
		isGood=false;
//		console.log("safety_check: "+safety_check);
	}
	
	/*
	 * Playback length > 0 but fraction is 0
	 */
	if(T_fraction=='0' && parseInt(T_timelength) > 0){
		isGood=false;
//		console.log("safety_check: T_fraction "+T_fraction+", but T_timelength "+T_timelength);
	}
	
	/*
	 * It is NOT possible timelength is zero
	 */
	if(parseInt(T_timelength)==0)
		isGood=false;
	
	
	if(!isGood)
		console.log("YouSlow: Decline report request!");

	
	if(isGood){
	    var URLparameters = "localtime="+T_localtime	
							+"&hostname="+T_hostname
							+"&city="+T_city
							+"&region="+T_region
							+"&country="+T_country
							+"&loc="+T_loc
							+"&org="+T_org
							+"&numofrebufferings="+T_numofrebufferings.toString()
							+"&bufferduration="+T_bufferduration
							+"&bufferdurationwithtime="+T_bufferdurationwithtime
							+"&resolutionchanges="+T_resolutionchanges
							+"&requestedresolutions="+T_requestedresolutions
							+"&requestedresolutionswithtime="+T_requestedresolutionswithtime
							+"&timelength="+T_timelength.toString()
							+"&initialbufferingtime="+T_initialbufferingtime.toString()
							+"&abandonment="+T_abandonment.toString()+":"+T_fraction.toString()
							+"&avglatency="+T_avglatency //Should get T_avglatency
							+"&allquality="+T_available_video_quality
	    					+"&version="+version
	    					+"&adslength="+T_AllAdsLength;
	    
	    

	    var videoInfoURL = "https://dyswis.cs.columbia.edu/youslow/dbupdatesecured10.php?"+(URLparameters);
	    
	    console.log("YouSlow: reported URLparameters - "+URLparameters);
	    
		var xhr = new XMLHttpRequest();
		xhr.open("GET", videoInfoURL, true);
		xhr.onreadystatechange = function() {
		  if (xhr.readyState == 4) {
		    console.log("YouSlow: buffering events reported...");
		    previouslyAbandonedDuetoBuffering = 0;
		    initialData();
		  }
		}
		xhr.send();
		
	}
	

}


function printout_all_T_paramters(){

    
	var URLparameters = "localtime="+T_localtime	
	+"&hostname="+T_hostname
	+"&city="+T_city
	+"&region="+T_region
	+"&country="+T_country
	+"&loc="+T_loc
	+"&org="+T_org
	+"&numofrebufferings="+T_numofrebufferings
	+"&bufferduration="+T_bufferduration
	+"&bufferdurationwithtime="+T_bufferdurationwithtime
	+"&resolutionchanges="+T_resolutionchanges
	+"&requestedresolutions="+T_requestedresolutions
	+"&requestedresolutionswithtime="+T_requestedresolutionswithtime
	+"&timelength="+T_timelength.toString()
	+"&initialbufferingtime="+T_initialbufferingtime.toString()
	+"&abandonment="+previouslyAbandonedDuetoBuffering.toString()
	+"&avglatency="+T_avglatency
	+"&allquality="+T_available_video_quality
	+"&fraction="+T_fraction
	+"&AllAdsLength="+T_AllAdsLength;
	
	console.log("YouSlow: T_All - "+URLparameters);

}

function printout_all_paramters(){

    var URLparameters = "localtime="+timeReport	
	+"&hostname="+hostname
	+"&city="+city
	+"&region="+region
	+"&country="+country
	+"&loc="+loc
	+"&org="+org
	+"&numofrebufferings="+numofrebufferings
	+"&bufferduration="+bufferingDuration
	+"&bufferdurationwithtime="+bufferdurationwithtime
	+"&resolutionchanges="+NumOfResolutionChanges
	+"&requestedresolutions="+requestedResolutions
	+"&requestedresolutionswithtime="+requestedresolutionswithtime
	+"&timelength="+elapsedTime.toString()
	+"&initialbufferingtime="+elapsedinitialBufferingTime.toString()
	+"&abandonment="+previouslyAbandonedDuetoBuffering.toString()
	+"&avglatency="+avglatency
	+"&allquality="+available_video_quality
	+"&fraction="+fraction
    +"&AllAdsLength="+AllAdsLength;
	
	
	console.log("YouSlow: All - "+URLparameters);
}


function report(){

	var localTime = new Date();
    var year= localTime.getFullYear()+'';
    var month= (localTime.getMonth()+1)+'';
    var date = localTime.getDate()+'';
    var hours = localTime.getHours()+'';
    var minutes = localTime.getMinutes()+'';
    var seconds = localTime.getSeconds()+'';    
    timeReport = year+"-"+month+"-"+date+" "+hours+":"+minutes+":"+seconds;
    
    
    /*
     * Update available quality for the just closed video
     */
	available_video_quality = '';
	var quality_list = player.getAvailableQualityLevels();
	for (var prop in quality_list) {
		  if (quality_list.hasOwnProperty(prop)) {
			  available_video_quality = available_video_quality+quality_list[prop]+":";
		  }
	}
	
	
	/*
	 * Always when completely being watched video
	 * and the fraction is 1
	 */
    previouslyAbandonedDuetoBuffering=0;
    
	if(city != null){    
		city = convert(city);
	}
	if(region != null){
    	region = convert(region);
    }
    
	org = org.replace("&","");
	
	var isGood = true;
	
	if( country==null || country.length < 1 || country=='none' || country==''){
		isGood = false;
	}

	/*
	 * Totaltimelength should also count bufferingDuration
	 */
	if(bufferingDuration>elapsedTime)
		isGood = false;
	
	/*
	 * It is NOT possible timelength is zero
	 */
	if(elapsedTime==0)
		isGood=false;
	
	
	if(!isGood)
		console.log("YouSlow: Decline report request!");

	
	if(isGood){
	    var URLparameters = "localtime="+timeReport	
							+"&hostname="+hostname
							+"&city="+city
							+"&region="+region
							+"&country="+country
							+"&loc="+loc
							+"&org="+org
							+"&numofrebufferings="+numofrebufferings.toString()
							+"&bufferduration="+bufferingDuration
							+"&bufferdurationwithtime="+bufferdurationwithtime
							+"&resolutionchanges="+NumOfResolutionChanges
							+"&requestedresolutions="+requestedResolutions
							+"&requestedresolutionswithtime="+requestedresolutionswithtime
							+"&timelength="+elapsedTime.toString()
							+"&initialbufferingtime="+elapsedinitialBufferingTime.toString()
							+"&abandonment="+"0:1"
	    					+"&avglatency="+avglatency //Need to check
	    					+"&allquality="+available_video_quality
	    					+"&version="+version
	    					+"&adslength="+AllAdsLength;
		
	    var videoInfoURL = "https://dyswis.cs.columbia.edu/youslow/dbupdatesecured10.php?"+(URLparameters);
	    
	    
	    console.log("YouSlow: reported URLparameters - "+URLparameters);
	    
		var xhr = new XMLHttpRequest();
		xhr.open("GET", videoInfoURL, true);
		xhr.onreadystatechange = function() {
		  //console.log("HTTP STATE: "+xhr.readyState);
		  if (xhr.readyState == 4) {
		    console.log("YouSlow: buffering events reported...");
		    initialData();
		  }
		}
		xhr.send();
		
	}
	
	
	
}






function convert(t)
{
	t = t.replace('Ã¡', 'a');
	t = t.replace('Ã', 'A');
	t = t.replace('Ã ', 'a');
	t = t.replace('Ã', 'A');
	t = t.replace('Ä', 'a');
	t = t.replace('Ä', 'A');
	t = t.replace('Ã¢', 'a');
	t = t.replace('Ã', 'A');
	t = t.replace('Ã¥', 'a');
	t = t.replace('Ã', 'A');
	t = t.replace('Ã£', 'a');
	t = t.replace('Ã', 'A');
	t = t.replace('Ä', 'a');
	t = t.replace('Ä', 'A');
	t = t.replace('Ä', 'a');
	t = t.replace('Ä', 'A');
	t = t.replace('Ã¤', 'a');
	t = t.replace('Ã', 'A');
	t = t.replace('Ã¦', 'ae');
	t = t.replace('Ã', 'AE');
	t = t.replace('á¸', 'b');
	t = t.replace('á¸', 'B');
	t = t.replace('Ä', 'c');
	t = t.replace('Ä', 'C');
	t = t.replace('Ä', 'c');
	t = t.replace('Ä', 'C');
	t = t.replace('Ä', 'c');
	t = t.replace('Ä', 'C');
	t = t.replace('Ä', 'c');
	t = t.replace('Ä', 'C');
	t = t.replace('Ã§', 'c');
	t = t.replace('Ã', 'C');
	t = t.replace('Ä', 'd');
	t = t.replace('Ä', 'D');
	t = t.replace('á¸', 'd');
	t = t.replace('á¸', 'D');
	t = t.replace('Ä', 'd');
	t = t.replace('Ä', 'D');
	t = t.replace('Ã°', 'dh');
	t = t.replace('Ã', 'Dh');
	t = t.replace('Ã©', 'e');
	t = t.replace('Ã', 'E');
	t = t.replace('Ã¨', 'e');
	t = t.replace('Ã', 'E');
	t = t.replace('Ä', 'e');
	t = t.replace('Ä', 'E');
	t = t.replace('Ãª', 'e');
	t = t.replace('Ã', 'E');
	t = t.replace('Ä', 'e');
	t = t.replace('Ä', 'E');
	t = t.replace('Ã«', 'e');
	t = t.replace('Ã', 'E');
	t = t.replace('Ä', 'e');
	t = t.replace('Ä', 'E');
	t = t.replace('Ä', 'e');
	t = t.replace('Ä', 'E');
	t = t.replace('Ä', 'e');
	t = t.replace('Ä', 'E');
	t = t.replace('á¸', 'f');
	t = t.replace('á¸', 'F');
	t = t.replace('Æ', 'f');
	t = t.replace('Æ', 'F');
	t = t.replace('Ä', 'g');
	t = t.replace('Ä', 'G');
	t = t.replace('Ä', 'g');
	t = t.replace('Ä', 'G');
	t = t.replace('Ä¡', 'g');
	t = t.replace('Ä ', 'G');
	t = t.replace('Ä£', 'g');
	t = t.replace('Ä¢', 'G');
	t = t.replace('Ä¥', 'h');
	t = t.replace('Ä¤', 'H');
	t = t.replace('Ä§', 'h');
	t = t.replace('Ä¦', 'H');
	t = t.replace('Ã­', 'i');
	t = t.replace('Ã', 'I');
	t = t.replace('Ã¬', 'i');
	t = t.replace('Ã', 'I');
	t = t.replace('Ã®', 'i');
	t = t.replace('Ã', 'I');
	t = t.replace('Ã¯', 'i');
	t = t.replace('Ã', 'I');
	t = t.replace('Ä©', 'i');
	t = t.replace('Ä¨', 'I');
	t = t.replace('Ä¯', 'i');
	t = t.replace('Ä®', 'I');
	t = t.replace('Ä«', 'i');
	t = t.replace('Äª', 'I');
	t = t.replace('Äµ', 'j');
	t = t.replace('Ä´', 'J');
	t = t.replace('Ä·', 'k');
	t = t.replace('Ä¶', 'K');
	t = t.replace('Äº', 'l');
	t = t.replace('Ä¹', 'L');
	t = t.replace('Ä¾', 'l');
	t = t.replace('Ä½', 'L');
	t = t.replace('Ä¼', 'l');
	t = t.replace('Ä»', 'L');
	t = t.replace('Å', 'l');
	t = t.replace('Å', 'L');
	t = t.replace('á¹', 'm');
	t = t.replace('á¹', 'M');
	t = t.replace('Å', 'n');
	t = t.replace('Å', 'N');
	t = t.replace('Å', 'n');
	t = t.replace('Å', 'N');
	t = t.replace('Ã±', 'n');
	t = t.replace('Ã', 'N');
	t = t.replace('Å', 'n');
	t = t.replace('Å', 'N');
	t = t.replace('Ã³', 'o');
	t = t.replace('Ã', 'O');
	t = t.replace('Ã²', 'o');
	t = t.replace('Ã', 'O');
	t = t.replace('Ã´', 'o');
	t = t.replace('Ã', 'O');
	t = t.replace('Å', 'o');
	t = t.replace('Å', 'O');
	t = t.replace('Ãµ', 'o');
	t = t.replace('Ã', 'O');
	t = t.replace('Ã¸', 'oe');
	t = t.replace('Ã', 'OE');
	t = t.replace('Å', 'o');
	t = t.replace('Å', 'O');
	t = t.replace('Æ¡', 'o');
	t = t.replace('Æ ', 'O');
	t = t.replace('Ã¶', 'o');
	t = t.replace('Ã', 'O');
	t = t.replace('á¹', 'p');
	t = t.replace('á¹', 'P');
	t = t.replace('Å', 'r');
	t = t.replace('Å', 'R');
	t = t.replace('Å', 'r');
	t = t.replace('Å', 'R');
	t = t.replace('Å', 'r');
	t = t.replace('Å', 'R');
	t = t.replace('Å', 's');
	t = t.replace('Å', 'S');
	t = t.replace('Å', 's');
	t = t.replace('Å', 'S');
	t = t.replace('Å¡', 's');
	t = t.replace('Å ', 'S');
	t = t.replace('á¹¡', 's');
	t = t.replace('á¹ ', 'S');
	t = t.replace('Å', 's');
	t = t.replace('Å', 'S');
	t = t.replace('È', 's');
	t = t.replace('È', 'S');
	t = t.replace('Ã', 'SS');
	t = t.replace('Å¥', 't');
	t = t.replace('Å¤', 'T');
	t = t.replace('á¹«', 't');
	t = t.replace('á¹ª', 'T');
	t = t.replace('Å£', 't');
	t = t.replace('Å¢', 'T');
	t = t.replace('È', 't');
	t = t.replace('È', 'T');
	t = t.replace('Å§', 't');
	t = t.replace('Å¦', 'T');
	t = t.replace('Ãº', 'u');
	t = t.replace('Ã', 'U');
	t = t.replace('Ã¹', 'u');
	t = t.replace('Ã', 'U');
	t = t.replace('Å­', 'u');
	t = t.replace('Å¬', 'U');
	t = t.replace('Ã»', 'u');
	t = t.replace('Ã', 'U');
	t = t.replace('Å¯', 'u');
	t = t.replace('Å®', 'U');
	t = t.replace('Å±', 'u');
	t = t.replace('Å°', 'U');
	t = t.replace('Å©', 'u');
	t = t.replace('Å¨', 'U');
	t = t.replace('Å³', 'u');
	t = t.replace('Å²', 'U');
	t = t.replace('Å«', 'u');
	t = t.replace('Åª', 'U');
	t = t.replace('Æ°', 'u');
	t = t.replace('Æ¯', 'U');
	t = t.replace('Ã¼', 'u');
	t = t.replace('Ã', 'U');
	t = t.replace('áº', 'w');
	t = t.replace('áº', 'W');
	t = t.replace('áº', 'w');
	t = t.replace('áº', 'W');
	t = t.replace('Åµ', 'w');
	t = t.replace('Å´', 'W');
	t = t.replace('áº', 'w');
	t = t.replace('áº', 'W');
	t = t.replace('Ã½', 'y');
	t = t.replace('Ã', 'Y');
	t = t.replace('á»³', 'y');
	t = t.replace('á»²', 'Y');
	t = t.replace('Å·', 'y');
	t = t.replace('Å¶', 'Y');
	t = t.replace('Ã¿', 'y');
	t = t.replace('Å¸', 'Y');
	t = t.replace('Åº', 'z');
	t = t.replace('Å¹', 'Z');
	t = t.replace('Å¾', 'z');
	t = t.replace('Å½', 'Z');
	t = t.replace('Å¼', 'z');
	t = t.replace('Å»', 'Z');
	t = t.replace('Ã¾', 'th');
	t = t.replace('Ã', 'Th');
	t = t.replace('Âµ', 'u');
	t = t.replace('Ð°', 'a');
	t = t.replace('Ð', 'a');
	t = t.replace('Ð±', 'b');
	t = t.replace('Ð', 'b');
	t = t.replace('Ð²', 'v');
	t = t.replace('Ð', 'v');
	t = t.replace('Ð³', 'g');
	t = t.replace('Ð', 'g');
	t = t.replace('Ð´', 'd');
	t = t.replace('Ð', 'd');
	t = t.replace('Ðµ', 'e');
	t = t.replace('Ð', 'e');
	t = t.replace('Ñ', 'e');
	t = t.replace('Ð', 'e');
	t = t.replace('Ð¶', 'zh');
	t = t.replace('Ð', 'zh');
	t = t.replace('Ð·', 'z');
	t = t.replace('Ð', 'z');
	t = t.replace('Ð¸', 'i');
	t = t.replace('Ð', 'i');
	t = t.replace('Ð¹', 'j');
	t = t.replace('Ð', 'j');
	t = t.replace('Ðº', 'k');
	t = t.replace('Ð', 'k');
	t = t.replace('Ð»', 'l');
	t = t.replace('Ð', 'l');
	t = t.replace('Ð¼', 'm');
	t = t.replace('Ð', 'm');
	t = t.replace('Ð½', 'n');
	t = t.replace('Ð', 'n');
	t = t.replace('Ð¾', 'o');
	t = t.replace('Ð', 'o');
	t = t.replace('Ð¿', 'p');
	t = t.replace('Ð', 'p');
	t = t.replace('Ñ', 'r');
	t = t.replace('Ð ', 'r');
	t = t.replace('Ñ', 's');
	t = t.replace('Ð¡', 's');
	t = t.replace('Ñ', 't');
	t = t.replace('Ð¢', 't');
	t = t.replace('Ñ', 'u');
	t = t.replace('Ð£', 'u');
	t = t.replace('Ñ', 'f');
	t = t.replace('Ð¤', 'f');
	t = t.replace('Ñ', 'h');
	t = t.replace('Ð¥', 'h');
	t = t.replace('Ñ', 'c');
	t = t.replace('Ð¦', 'c');
	t = t.replace('Ñ', 'ch');
	t = t.replace('Ð§', 'ch');
	t = t.replace('Ñ', 'sh');
	t = t.replace('Ð¨', 'sh');
	t = t.replace('Ñ', 'sch');
	t = t.replace('Ð©', 'sch');
	t = t.replace('Ñ', 'b');
	t = t.replace('Ðª', 'b');
	t = t.replace('Ñ', 'y');
	t = t.replace('Ð«', 'y');
	t = t.replace('Ñ', 'b');
	t = t.replace('Ð¬', 'b');
	t = t.replace('Ñ', 'e');
	t = t.replace('Ð­', 'e');
	t = t.replace('Ñ', 'ju');
	t = t.replace('Ð®', 'ju');
	t = t.replace('Ñ', 'ja');
	t = t.replace('Ð¯', 'ja');
	return t;
}