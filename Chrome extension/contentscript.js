var s = document.createElement('script');
s.src = chrome.extension.getURL('script.js');
(document.head||document.documentElement).appendChild(s);
s.onload = function() {
    s.parentNode.removeChild(s);
};


/*
 * ContentScripts
 * 	: Exchange messages to Backgroundpage (bgp.js)
 *  : Update real-time messages and share with extensions (Script.js)
 */


/*
 * Event listener - access to local storage
 * Save current buffering state locally. 
 * Necessary when a client stops (or changes) a video in middle of experiencing buffer stalling
 */

var currentURL;
var previousURL=null;
var urlChangeCounter=0;
var avglatency;
var detectedURL;
var isVideoAds;
var resetParameters=false;

var num_of_video_chunks=0;
var num_of_video_bytes=0;

var videoDuration=0;

 
function sendDataToExtension() {
	
	/*
	 * Update avg_lagtency and video Ads flag measure in background page
	 */
	var dataObj = String(avglatency)+"&"+String(isVideoAds)+"&"+String(num_of_video_chunks)+"&"+String(num_of_video_bytes)+"&"+String(videoDuration);
    var storeEvent = new CustomEvent('getFromContentScript', {"detail":dataObj});
    document.dispatchEvent(storeEvent);
}



/*
 * BufferingStatus called every 5seconds from extension
 * It saves data locally and obtains information from background page
 */
document.addEventListener('BufferingStatus', function(e) {
	
	if(e.detail.bufferflag=="InitialCheck"){


		chrome.storage.local.get('detail', function (retVal) {
			var fetchResponse = new CustomEvent('fetchResponse', {
				"detail": retVal.detail
		});
		    document.dispatchEvent(fetchResponse);
		});
		
		resetParameters=true;
		/*
		 * Video duration reset
		 * other parameters (avglatency,videoChunks,videoBytes) reset in bgp.js
		 */
		videoDuration=0;
		SendMessageToBackgroundPage("Reset parameters in background page");
		
		

		e.detail.avglatency = avglatency;
		e.detail.videoChunks = num_of_video_chunks;
		e.detail.videoBytes = num_of_video_bytes;
		e.detail.videoDuration = videoDuration;
		
		chrome.storage.local.set({
			"detail": e.detail
		}, function(items) {
			try {
		        if (chrome.runtime.lastError) {
		            console.warn(chrome.runtime.lastError.message);
		        } else {
//		        	console.log("YouSlow bufferStalling staus updated All: "+e.detail.localtime+"&"+e.detail.hostname+"&"+e.detail.city+"&"+e.detail.region+"&"+e.detail.country+"&"+e.detail.loc+"&"+e.detail.org+"&"+e.detail.bufferduration+"&"+e.detail.resolutionchanges+"&"+e.detail.requestedresolutions+"&"+e.detail.timelength+"&"+e.detail.initialbufferingtime+"&"+e.detail.abandonment+"&"+e.detail.bufferflag+"&"+e.detail.avglatency+"&"+e.detail.allquality+"&"+e.detail.fraction);
		        }
		    } catch (exception) {
		        console.warn((new Date()).toJSON(), "exception.stack:", exception.stack);
		    }
		});
		
		
	}else{
		
		resetParameters=false;
		/*
		 * Try to exchange messages to background script
		 */
		SendMessageToBackgroundPage("Update current video URL and avg latency from background page");
		
    	/*
    	 * Average latency update
    	 */
		e.detail.avglatency = avglatency;
		e.detail.videoChunks = num_of_video_chunks;
		e.detail.videoBytes = num_of_video_bytes;
		e.detail.videoDuration = videoDuration;
		
		
		chrome.storage.local.set({
			"detail": e.detail
		}, function(items) {
			try {
		        if (chrome.runtime.lastError) {
		            console.warn(chrome.runtime.lastError.message);
		        } else {
//		        	console.log("YouSlow bufferStalling staus updated All: "+e.detail.localtime+"&"+e.detail.hostname+"&"+e.detail.city+"&"+e.detail.region+"&"+e.detail.country+"&"+e.detail.loc+"&"+e.detail.org+"&"+e.detail.bufferduration+"&"+e.detail.resolutionchanges+"&"+e.detail.requestedresolutions+"&"+e.detail.timelength+"&"+e.detail.initialbufferingtime+"&"+e.detail.abandonment+"&"+e.detail.bufferflag+"&"+e.detail.avglatency+"&"+e.detail.allquality+"&"+e.detail.fraction);
		        }
		    } catch (exception) {
		        console.warn((new Date()).toJSON(), "exception.stack:", exception.stack);
		    }
		});
		
	}
	
});




function SendMessageToBackgroundPage(data)
{

	
	/*
	 * Sending a request from a content script to background page:
	 */
//	chrome.runtime.sendMessage({greeting: "getvideoURL"}, function(response2) 

	chrome.runtime.sendMessage({resetParameters: resetParameters}, function(response2) {

		  currentURL=response2.getvideoURL;
		  avglatency=response2.getavglatency;
		  detectedURL=response2.detectedURL;
		  isVideoAds=response2.isVideoAds;
		  var traffic_total_bytes=response2.traffic_total_bytes
		  var seconds = new Date().getTime() / 1000;
		  var traffic_monitoring=response2.traffic_monitoring;
		  var traffic_monitoring_split=traffic_monitoring.split("&");
		  var traffic_monitoring_length=traffic_monitoring_split.length-1;
		  var avg_traffic_over_last_5s=traffic_total_bytes/1024;
		  avg_traffic_over_last_5s=Math.round(avg_traffic_over_last_5s/5);
		  
		  var videoURL_all=response2.videoURL_all;
		  
		  
//		  console.log("detectedURL: "+detectedURL);
		  var resetParameters=response2.resetParameters;
		  if(resetParameters){
			  console.log("YouSlow: initialized background information");
		  }

		  /*
		   * Video chunks and bytes update
		   */
		  num_of_video_chunks=traffic_monitoring_length;
		  num_of_video_bytes=traffic_total_bytes;

		  var temp_videoURL_all=videoURL_all.split("dur=");
		  var temp_d=temp_videoURL_all[1].split("&");
		  videoDuration=Math.round(parseInt(temp_d[0]));

			
		  
		  /*
		   * For experimental testbed,
		   * Printout number of chunks and avg download rate every 5seconds
		   */
//		  console.log(seconds+") num of chunks: "+traffic_monitoring_length+", avg_traffic_over_last_5s: "+avg_traffic_over_last_5s+"KB/s, download rate in by chunk KB/s: "+traffic_monitoring);
//		  console.log("currentURL: "+currentURL);
//		  console.log(seconds+") num of chunks: "+num_of_video_chunks+", traffic_total_bytes: "+traffic_total_bytes+" kbytes");

//		  console.log(videoURL_all);
//		  console.log("isVideoAds: "+isVideoAds);
//		  console.log("num_of_video_chunks: "+num_of_video_chunks);
//		  console.log("traffic_total_bytes: "+traffic_total_bytes+" kbytes");
//		  console.log("Total video duration: "+videoDuration+" s");
//		  console.log("===========");
		  
	});

	
	/*
	 * Update data messages back to extension
	 */
	 sendDataToExtension();

		
}




