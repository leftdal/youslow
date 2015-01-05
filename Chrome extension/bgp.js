
var videoURL = "";
var fullURL = "";
var findvideoURL = false;
var previous_time = 0.0;
var after_time = 0.0;

var previous_requestId = 0;
var after_requestId = 0;

var sum_all_time = 0.0;
var count_events = 0;
var avg_latency =0;


chrome.webRequest.onHeadersReceived.addListener(
	    function(details) {
	    	
	    	if(findvideoURL){
	    		
	    		if (fullURL.indexOf("videoplayback?") > -1 ) {
	    			
	    			after_requestId = details.requestId;
	    			
	    			if(previous_requestId == after_requestId){
//	    				console.log( "Response requestId: "+details.requestId);
//		    			console.log( "Response timeStamp: "+details.timeStamp);
		    			after_time = parseInt(details.timeStamp);
		    			var gap = after_time - previous_time;
		    			sum_all_time = sum_all_time + gap;
		    			count_events = count_events +1;
		    			var avg = sum_all_time/count_events;
		    			avg_latency = Math.round(avg);
//		    			console.log( "Response gap on average: "+Math.round(avg));
		    			previous_requestId = -1;

	    			}
	    			
	    		}
	    		
	    	}
	    	
	    },
	    {urls: ["<all_urls>"]},
	    ["blocking", "responseHeaders"]
);



/*
 * Receive and send messages to content script
 */

chrome.runtime.onMessage.addListener(function(message2,sender2,sendResponse2){
	  sendResponse2({getvideoURL: videoURL, getavglatency: avg_latency});
});


chrome.webRequest.onBeforeSendHeaders.addListener(
	    function(details) {
//	    	var headers = details.requestHeaders;
//	    	console.log(details.url);
	    	var detectedURL = details.url;
	    	if (detectedURL.indexOf('videoplayback?') > -1 ) {
	    		
	    		fullURL = details.url;
	    		previous_requestId = details.requestId;
//	    		console.log( "Request requestId: "+details.requestId);
	    		previous_time = parseInt(details.timeStamp);
//	    		console.log( "tabID1: "+details.tabId);
	    		findvideoURL = true;

	    		/*
	    		 * We only catch YouTube video
	    		 */
	    		var res = detectedURL.split("videoplayback");
	    		if (res[0].indexOf(videoURL) > -1 ) {

	    			// Maintain videoURL
	    			videoURL = res[0];
//	    			console.log( "Current URL found: "+videoURL);
	    		}else{
	    			// Update recent videoURL
	    			videoURL = res[0];
	    			console.log("New URL dectected: "+videoURL);
	    		}
	    	} else {
	    	}
	    	
	        return {requestHeaders: details.requestHeaders};
	    },
	    {urls: ["<all_urls>"]},
//	    {urls: ["http://*.youtube.com/","https://*.youtube.com/"]},
	    ["requestHeaders", "blocking"]
	);
