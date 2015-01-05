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

var initialBufferingStartTime=null;
var initialBufferingEndTime=null;
var elapsedinitialBufferingTime=0;
var isInitialBuffering = false;

var bufferingStatusUpdateValue="";
var previouslyAbandonedDuetoBuffering = 0;
var avglatency="";
var timeReport =null;

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
var T_initialbufferingStatusUpdate=true;

var video_url=null;
var current_video_url=null;


function onYouTubePlayerReady(playerId) {
	
	if(!isloaded){
		isloaded = true;
		console.log("YouSlow: New video session started!");
		IP = getIP();
		//console.log("Public IP: "+IP);
		getUserInfo();
				
	}
	
	player = document.getElementById("movie_player");
	
	if(player == null)
		player = document.getElementById("ytPlayer");
	
	if(player == null)
		player = document.getElementById("myytplayer");
	
	requestedResolutions = player.getPlaybackQuality()+":";
	
	/*
	 * addEventListener
	 */
	player.addEventListener("onStateChange", "state");
	player.addEventListener("onPlaybackQualityChange", "PlaybackQualityChange");
	player.addEventListener("onPlaybackRateChange", "PlaybackRateChange");
	
	/*
		check initial bufferingTime after player loaded
		This prevents from being too late to get initial player status, in order to measure initial buffering time
		Initial buffering time: from the instant the video player has been loaded to it is actually playing the video
	*/
	isInitialBuffering = true;
	initialBufferingStartTime = new Date();
	
	var initialState = player.getPlayerState();

	
	/*
	-1 – unstarted
	0 – ended
	1 – playing
	2 – paused
	3 – buffering
	5 – video cued
	*/
	
	if(initialState==1){
		
		startTime = new Date();
		
		if(isInitialBuffering){
			isInitialBuffering = false;
			initialBufferingEndTime = new Date();
			var timeDiff = initialBufferingEndTime - initialBufferingStartTime;
			elapsedinitialBufferingTime = timeDiff;
			console.log("YouSlow: elapsedinitialBufferingTimeSincePlayerLoaded: "+elapsedinitialBufferingTime+" milliseconds");
			initialBufferingStartTime=null;
			initialBufferingEndTime=null;
		}
		
	}
	
	
	
	/*
	 * Go through abandonment check
	 * This is caused when a client stopped watching a video due to the buffer stalling previously
	 * The information is locally save on client's device.
	 * When a client watches the video again or new video, it checks if it needs to report the abandonment.
	 * Wait for just 1 second until it gets IP and basic ISP information
	 */
	setTimeout(function(){
		bufferingStatusUpdateValue = "InitialCheck";
		video_url = player.getVideoUrl();
		bufferingStatusUpdate();
	},1000)

	
	/*
	 * BufferStalling status update every 5 seconds
	 * Quota limits 10 per a minute for sync
	 */
	setInterval(function(){
		
		//printout
		//printout_all_T_paramters();
		//printout_all_paramters();
		
		var initialState = player.getPlayerState();
		
		if(startTime != null){
			endTime = new Date();
			var timeDiff = endTime - startTime;
			var timeDiff = timeDiff/1000;
			var seconds = Math.round(timeDiff);
			elapsedTime = elapsedTime + seconds;
			startTime = null;
		}

		current_video_url = player.getVideoUrl();
		
        if(video_url != current_video_url){
        	
        	console.log("YouSlow: Movie changed!");
        	video_url = current_video_url;
        	
        	/*
        	 * Call locally saved event data and report for the video URL change events
        	 */
        	call_data_for_video_url_change_event();
        	
            // initiate all Data
        	initialData_T();
        	initialData();
    		
//        	bufferingStatusUpdateValue = "DOWN(PLAYING)";
//    		bufferingStatusUpdate();
    		
        }else if(initialState==1){
			startTime = new Date();
			bufferingStatusUpdateValue = "DOWN(PLAYING)";
			bufferingStatusUpdate();
		}else if(initialState==-1){
			bufferingStatusUpdateValue = "NOT STARTED";
			bufferingStatusUpdate();
		}else if(initialState==0){
			bufferingStatusUpdateValue = "DOWN(END)";
		}else if(initialState==3){
			bufferingStatusUpdateValue = "UP";
			bufferingStatusUpdate();
		}
	},5000);
    
}



function getIP() {
    
	if (window.XMLHttpRequest) xmlhttp = new XMLHttpRequest();
    else xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
		
	console.log("YouSlow: We use api.hostip.info to find a host IP address.");
	//    xmlhttp.open("GET","http://api.hostip.info/get_html.php",false);
    xmlhttp.open("GET","https://api.ipify.org/",false);
    
    xmlhttp.send();

    
    hostipInfo = xmlhttp.responseText.trim();
    
    if(hostipInfo.length>3)
    	return hostipInfo;
    
//    hostipInfo = xmlhttp.responseText.split("\n");
//    console.log("hostipInfo: "+hostipInfo);
//    for (i=0; hostipInfo.length >= i; i++) {
//        ipAddress = hostipInfo[i].split(":");
//        if ( ipAddress[0] == "IP" ) return ipAddress[1];
//    }

    return false;
}



function getUserInfo(){
	
	//	var videoInfoURL = "http://api.ipaddresslabs.com/iplocation/v1.7/locateip?key=demo&ip="+IP.trim()+"&format=XML";
	//	var userInfoURL = "http://ipinfo.io/"+IP.trim()+"/json";
	
	/*
	 * Request Dyswis server to find the geolocation info.
	 * We implemented this system because Chrome Web browser prevents HTTP GET request
	 */
	
	var userInfoURL = "https://dyswis.cs.columbia.edu/youslow/getinfo.php?"+IP.trim();
	console.log("YouSlow: We use ipinfo.io to find an approximate location");
	
	var xhr = new XMLHttpRequest();
	xhr.open("GET", userInfoURL, true);
	xhr.onreadystatechange = function() {
	  
//		console.log("YouSlow obj: "+xhr.readyState);
//		console.log("YouSlow obj: "+xhr.responseText);
		
	  if (xhr.readyState == 4) {
		  
		var resp = xhr.responseText;
	    var obj = JSON.parse(resp);
	    
//	     console.log("YouSlow obj: "+resp);
//	     console.log("YouSlow 1: "+obj.ip);
//	     console.log("YouSlow 2: "+obj.hostname);
//	     console.log("YouSlow 3: "+obj.city);
//	     console.log("YouSlow 4: "+obj.region);
//	     console.log("YouSlow 5: "+obj.country);
//	     console.log("YouSlow 6: "+obj.loc);
//	     console.log("YouSlow 7: "+obj.org);
	    
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
	
	
	
	/*
	 * If TOO many request happen
	 * We take alternative solutions
	 */
	if(hostname == 'none'){
		
		console.log("YouSlow: We take alternative method to get user information. ");
		
		var userInfoURL = "https://ipinfo.io/";
		
		var xhr2 = new XMLHttpRequest();
		xhr2.open("GET", userInfoURL, true);
		xhr2.onreadystatechange = function() {
		  
			
		  if (xhr2.readyState == 4) {
			  
			  var resp = xhr2.responseText;
			  var split_resp = resp.split("pre>");
			  
			  var new_resp = split_resp[1];
			  
			  var new_resp2 = new_resp.replace(new RegExp(";,", 'g'), "@");
			  var new_resp3 = new_resp2.replace(new RegExp("&quot", 'g'), "");
			  var new_resp4 = new_resp3.replace(new RegExp(";", 'g'), "");
			  var new_resp5 = new_resp4.replace(new RegExp(" ", 'g'), ""); 
			  
//			  var split_new_resp = new_resp.split("&quot");

			  var split_new_resp = new_resp5.split("@");
			  
			  var index=0;
			  var targeted_index=0;
			  
//			  console.log("all: "+new_resp5);
			  
			  for (i=0;i<split_new_resp.length;i++){
				  if(split_new_resp[i].trim().length>1){
					  
//					  console.log(i+":"+split_new_resp[i]);
					  
					  /*
					   * Hardcoded
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
//					  
//					  	if(i==7){
//					  		hostname = split_new_resp[i].replace(";","");
//					  	}else if(i==11){
//					  		city = split_new_resp[i].replace(";","");
//					  	}else if(i==15){
//					  		region = split_new_resp[i].replace(";","");
//					  	}else if(i==19){
//					  		country = split_new_resp[i].replace(";","");
//					  	}else if(i==23){
//					  		loc = split_new_resp[i].replace(";","");
//					  	}else if(i==27){
//					  		org = split_new_resp[i].replace(";","");
//					  	}
						
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
		    
		    
//		    console.log("YouSlow hostname: "+hostname);
//		    console.log("YouSlow city: "+city);
//		    console.log("YouSlow region: "+region);
//		    console.log("YouSlow country: "+country);
//		    console.log("YouSlow loc: "+loc);
//		    console.log("YouSlow org: "+org);
		    
	
		  }
		}
		xhr2.send();
	
	}

	
}


function PlaybackQualityChange() { 
	
	var currentState = player.getPlaybackQuality();
	requestedResolutions = requestedResolutions+currentState+":";
	console.log("YouSlow: PlaybackQualityChange- "+currentState);
	NumOfResolutionChanges = NumOfResolutionChanges+1;
	
}


function PlaybackRateChange() { 
	
	var currentState = player.getPlaybackRate();
	requestedResolutions = requestedResolutions+currentState+":";
	console.log("YouSlow: PlaybackRateChange- "+currentState);
	NumOfResolutionChanges = NumOfResolutionChanges+1;
	
}


/*
 * YouTube player API states
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
		
		if(!isBuffering){
			startBufferingTime = Math.ceil(new Date().getTime() / 1000);
			isBuffering = true;
			
			//BufferStalling status update
			bufferingStatusUpdateValue = "UP";
			bufferingStatusUpdate();
			
		}
		
		if(startTime != null){
			endTime = new Date();
			var timeDiff = endTime - startTime;
			var timeDiff = timeDiff/1000;
			var seconds = Math.round(timeDiff);
			elapsedTime = elapsedTime + seconds;
			startTime = null;
		}
		
	}else if(currentState==0){
		
		if(bufferingDuration>0){
			
			if(startTime != null){
				endTime = new Date();
				var timeDiff = endTime - startTime;
				var timeDiff = timeDiff/1000;
				var seconds = Math.round(timeDiff);
				elapsedTime = elapsedTime + seconds;
				startTime = null;
			}
			report();
			
		}else{
			
			// Initiates
			isBuffering = false;
			bufferingDuration = 0;
			NumOfResolutionChanges = 1;
			requestedResolutions = player.getPlaybackQuality()+":";
			elapsedTime = 0;
			startTime = null;
			initialBufferingStartTime=null;
			initialBufferingEndTime=null;
			elapsedinitialBufferingTime=0;
			isInitialBuffering = false;
			
			//BufferStalling status update
			bufferingStatusUpdateValue = "DOWN(END)";
			bufferingStatusUpdate();
			
		}
		
		
	}else if(currentState==-1){
		
		if(!isInitialBuffering){
			isInitialBuffering = true;
			initialBufferingStartTime = new Date();
		}
		
		if(bufferingDuration>0){
			
			if(startTime != null){
				endTime = new Date();
				var timeDiff = endTime - startTime;
				var timeDiff = timeDiff/1000;
				var seconds = Math.round(timeDiff);
				elapsedTime = elapsedTime + seconds;
				startTime = null;
				//console.log("elapsedTime: "+elapsedTime);
			}
			report();
			
		}else{
			
			// Initiates
			isBuffering = false;
			bufferingDuration = 0;
			NumOfResolutionChanges = 1;
			requestedResolutions = player.getPlaybackQuality()+":";
			elapsedTime = 0;
			startTime = null;
		}
		
		
	}else{
		
		if(currentState==1){
			
			if(startTime != null){
				endTime = new Date();
				var timeDiff = endTime - startTime;
				var timeDiff = timeDiff/1000;
				var seconds = Math.round(timeDiff);
				elapsedTime = elapsedTime + seconds;
			}
			
			startTime = new Date();
						
			if(isInitialBuffering){
				isInitialBuffering = false;
				initialBufferingEndTime = new Date();
				var timeDiff = initialBufferingEndTime - initialBufferingStartTime;
				elapsedinitialBufferingTime = timeDiff;
				console.log("YouSlow: elapsedinitialBufferingTime: "+elapsedinitialBufferingTime);
			}
			
			if(isBuffering){
				isBuffering = false;
				var endBufferingTime = Math.ceil(new Date().getTime() / 1000);
				var timeDiff = endBufferingTime - startBufferingTime;
				bufferingDuration = bufferingDuration+timeDiff;
				elapsedTime = elapsedTime+timeDiff;
//				console.log("YouSlow: accumulated buffering- "+bufferingDuration+" seconds.");
//				console.log("YouSlow: elapsedTime- "+elapsedTime+" seconds.");
			}
			
			//BufferStalling status update
			bufferingStatusUpdateValue = "DOWN(PLAYING)";
			bufferingStatusUpdate();
			
			
		}
		
		if(currentState==2){
			
			if(startTime != null){
				endTime = new Date();
				var timeDiff = endTime - startTime;
				var timeDiff = timeDiff/1000;
				var seconds = Math.round(timeDiff);
				elapsedTime = elapsedTime + seconds;
				startTime = null;
			}
			
			
			if(isBuffering){
				isBuffering = false;
				var endBufferingTime = Math.ceil(new Date().getTime() / 1000);
				var timeDiff = endBufferingTime - startBufferingTime;
				bufferingDuration = bufferingDuration+timeDiff;
				elapsedTime = elapsedTime+timeDiff;
//				console.log("YouSlow: accumulated buffering- "+bufferingDuration+" seconds.");
//				console.log("YouSlow: elapsedTime- "+elapsedTime+" seconds.");
			}
			
			//BufferStalling status update
			bufferingStatusUpdateValue = "DOWN";
			bufferingStatusUpdate();
			
		}
		
		
		
	}
	
}


function initialData(){
	
	// Initiates
	isBuffering = false;
	bufferingDuration = 0;
	NumOfResolutionChanges = 1;
	requestedResolutions = player.getPlaybackQuality()+":";
	elapsedTime = 0;
	startTime = null;
	initialBufferingStartTime=null;
	initialBufferingEndTime=null;
	elapsedinitialBufferingTime=0;
	isInitialBuffering = false;
	previouslyAbandonedDuetoBuffering = 0;
	avglantecy="";
}


function initialData_T(){
	
	// Initiates
	// initialData
	T_isBuffering = false;
	T_bufferingDuration = 0;
	T_NumOfResolutionChanges = 1;
	T_requestedResolutions = player.getPlaybackQuality()+":";
	T_elapsedTime = 0;
	T_startTime = null;
	T_initialBufferingStartTime=null;
	T_initialBufferingEndTime=null;
	T_elapsedinitialBufferingTime=0;
	T_isInitialBuffering = false;
	T_previouslyAbandonedDuetoBuffering = 0;
	T_avglantecy="none";
}

function call_data_for_video_url_change_event(){
	
	/*
	 * Retrieve all locally saved data and report
	 */
	var localTime = new Date();
    var year= localTime.getFullYear()+'';
    var month= (localTime.getMonth()+1)+'';
    var date = localTime.getDate()+'';
    var hours = localTime.getHours()+'';
    var minutes = localTime.getMinutes()+'';
    var seconds = localTime.getSeconds()+'';    
    timeReport = year+"-"+month+"-"+date+" "+hours+":"+minutes+":"+seconds;
    
    /*
     * video url changed because of user activity
     */
    previouslyAbandonedDuetoBuffering=2;

	if(city != null){    
		city = convert(city);
	}
	if(region != null){
    	region = convert(region);
    }
    
	org = org.replace("&","");
	
	var isGood = true;
	
	if( country==null || country.length < 1)
		isGood = false;
	
	if(bufferingDuration>elapsedTime)
		isGood = false;

	if(elapsedTime<1)
		isGood = false;

	if(isGood){
	    var URLparameters = "localtime="+timeReport	
							+"&hostname="+window.localStorage.getItem("hostname")
							+"&city="+window.localStorage.getItem("city")
							+"&region="+window.localStorage.getItem("region")
							+"&country="+window.localStorage.getItem("country")
							+"&loc="+window.localStorage.getItem("loc")
							+"&org="+window.localStorage.getItem("org")
							+"&bufferduration="+window.localStorage.getItem("bufferduration")
							+"&resolutionchanges="+window.localStorage.getItem("resolutionchanges")
							+"&requestedresolutions="+window.localStorage.getItem("requestedresolutions")
	    					+"&timelength="+window.localStorage.getItem("timelength")
							+"&initialbufferingtime="+window.localStorage.getItem("initialbufferingtime")
							+"&abandonment="+previouslyAbandonedDuetoBuffering.toString()
							+"&avglatency="+T_avglatency.toString();
	    		
	    var videoInfoURL = "https://dyswis.cs.columbia.edu/youslow/dbupdatesecured6.php?"+(URLparameters);
	    
	    console.log("YouSlow: reported URLparameters - "+URLparameters);
	    					
		var xhr = new XMLHttpRequest();
		xhr.open("GET", videoInfoURL, true);
		xhr.onreadystatechange = function() {
		  //console.log("HTTP STATE: "+xhr.readyState);
		  if (xhr.readyState == 4) {
		    console.log("YouSlow: buffering events reported for video URL changes...");
		  }
		}
		xhr.send();
		
	}
}



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
     * This is only for report data due to video URL changes
     * To prevent from reporting data after the new data is replaced
     * Therefore wait for 4 seconds, during the time, report data for video URL change events
     */
    
    window.localStorage.removeItem("initialbufferingtime");      // <-- Local storage!
    window.localStorage.setItem("initialbufferingtime", elapsedinitialBufferingTime.toString());  // <-- Local storage!

    
    if(elapsedTime>4){

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
	    window.localStorage.setItem("avglatency", avglatency.toString());  // <-- Local storage!
	    

    }
    
    var eventDetail = {
    		"localtime": timeReport,	
    		"hostname": hostname,
    		"city": city,
    		"region": region,
    		"country": country,
    		"loc": loc,
    		"org": org,
    		"bufferduration": bufferingDuration.toString(),
    		"resolutionchanges": NumOfResolutionChanges.toString(),
    		"requestedresolutions": requestedResolutions,
    		"timelength": elapsedTime.toString(),
    		"initialbufferingtime": elapsedinitialBufferingTime.toString(),
    		"abandonment": previouslyAbandonedDuetoBuffering.toString(),
    		"bufferflag": bufferingStatusUpdateValue,
    		"avglatency": avglatency.toString()
    		/*
    		 * avglatency updated in contentscript.js page
    		 */
    		
    };
    
	document.dispatchEvent(new CustomEvent('BufferingStatus', {
		"detail": eventDetail
	}));
	
	

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
        
//        console.log("YouSlow: LocalStatus referesh - "+T_localtime+"&"+T_hostname+"&"+T_city+"&"+T_region+"&"+T_country+"&"+T_loc+"&"+T_org+"&"+T_bufferduration+"&"+T_resolutionchanges+"&"+T_requestedresolutions+"&"+T_timelength+"&"+T_initialbufferingtime+"&"+T_abandonment+"&"+T_bufferflag+"&"+T_avglatency);
        
        /*
         * Abandonment
         * 0 : Video ended
         * 1 : Previously Stopped by BufferStalling
         * 2 : Previously Stopped by Clients
         */
        if(T_bufferflag=="UP"){
    		console.log("YouSlow: PreviouslyStoppedbyAdandonmentByBufferStalling!");
    		previouslyAbandonedDuetoBuffering=1;
    		reportWithPreviousData();
    		
    		initialData();
    		initialData_T();
    		
    	}else if(T_bufferflag=="DOWN" || T_bufferflag==null){
//    		console.log("YouSlow: Previously--NOT--stoppedbyAdandonmentDuetoBufferStalling!");
    		previouslyAbandonedDuetoBuffering=0;
    		
    		initialData();
    		initialData_T();
    		
    	}else if(T_bufferflag=="DOWN(PLAYING)"){
    		console.log("YouSlow: PreviouslyStoppedbyAdandonmentByClients!");
    		previouslyAbandonedDuetoBuffering=2;
    		reportWithPreviousData();

    		initialData();
    		initialData_T();
    		
    	}
        document.removeEventListener('fetchResponse', respListener);
        
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
	
	if( T_country==null || T_country.length < 1)
		isGood = false;
	
	if(parseInt(T_timelength)<1)
		isGood = false;
	
	if(parseInt(T_bufferduration)>parseInt(T_timelength))
		isGood = false;
	
	if(isGood){
	    var URLparameters = "localtime="+T_localtime	
							+"&hostname="+T_hostname
							+"&city="+T_city
							+"&region="+T_region
							+"&country="+T_country
							+"&loc="+T_loc
							+"&org="+T_org
							+"&bufferduration="+T_bufferduration
							+"&resolutionchanges="+T_resolutionchanges
							+"&requestedresolutions="+T_requestedresolutions
	    					+"&timelength="+T_timelength.toString()
							+"&initialbufferingtime="+T_initialbufferingtime.toString()
							+"&abandonment="+previouslyAbandonedDuetoBuffering.toString()
							+"&avglatency="+T_avglatency.toString();
							
		
	    var videoInfoURL = "https://dyswis.cs.columbia.edu/youslow/dbupdatesecured6.php?"+(URLparameters);
	    
	    console.log("YouSlow: reported URLparameters - "+URLparameters);
	    					
		var xhr = new XMLHttpRequest();
		xhr.open("GET", videoInfoURL, true);
		xhr.onreadystatechange = function() {
		  //console.log("HTTP STATE: "+xhr.readyState);
		  if (xhr.readyState == 4) {
		    console.log("YouSlow: buffering events reported...");
		    previouslyAbandonedDuetoBuffering = 0;
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
	+"&bufferduration="+T_bufferduration
	+"&resolutionchanges="+T_resolutionchanges
	+"&requestedresolutions="+T_requestedresolutions
	+"&timelength="+T_timelength.toString()
	+"&initialbufferingtime="+T_initialbufferingtime.toString()
	+"&abandonment="+previouslyAbandonedDuetoBuffering.toString();
	+"&avglatency="+T_avglatency.toString();
	
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
	+"&bufferduration="+bufferingDuration
	+"&resolutionchanges="+NumOfResolutionChanges
	+"&requestedresolutions="+requestedResolutions
	+"&timelength="+elapsedTime.toString()
	+"&initialbufferingtime="+elapsedinitialBufferingTime.toString()
	+"&abandonment="+previouslyAbandonedDuetoBuffering.toString()
	+"&avglatency="+T_avglatency.toString();
	
	
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

	if(city != null){    
		city = convert(city);
	}
	if(region != null){
    	region = convert(region);
    }
    
	org = org.replace("&","");
	
	var isGood = true;
	
	if( country==null || country.length < 1)
		isGood = false;
	
	if(bufferingDuration>elapsedTime)
		isGood = false;
	
	if(isGood){
	    var URLparameters = "localtime="+timeReport	
							+"&hostname="+hostname
							+"&city="+city
							+"&region="+region
							+"&country="+country
							+"&loc="+loc
							+"&org="+org
							+"&bufferduration="+bufferingDuration
							+"&resolutionchanges="+NumOfResolutionChanges
							+"&requestedresolutions="+requestedResolutions
	    					+"&timelength="+elapsedTime.toString()
							+"&initialbufferingtime="+elapsedinitialBufferingTime.toString()
							+"&abandonment="+previouslyAbandonedDuetoBuffering.toString()
	    					+"&avglatency="+T_avglatency.toString();
		
	    var videoInfoURL = "https://dyswis.cs.columbia.edu/youslow/dbupdatesecured6.php?"+(URLparameters);
	    
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








function rot13(s)
{
   return (s ? s : this).split('').map(function(_)
    {
       if (!_.match(/[A-za-z]/)) return _;
       c = Math.floor(_.charCodeAt(0) / 97);
       k = (_.toLowerCase().charCodeAt(0) - 83) % 26 || 26;
       return String.fromCharCode(k + ((c == 0) ? 64 : 96));
    }).join('');
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
	t = t.replace('Ñ', 'h');
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