
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
var detectedURL="";
var isVideoAds=false;
var traffic_monitoring='';
var traffic_total_bytes=0;
var send_request_video_playback={url1: 100, url2: 200};



/*
 * Background page
 * 	: Exchange messages to contentscripts (contentscript.js)
 *  : Use Chrome WebRequest APIs to monitor video URLs and measure HTTP latency
 */


/*
 * since version 1.2.1,
 * we use OnComplete listener

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
//		    			console.log( "Response timeStamp gap: "+gap);
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

*/


chrome.webRequest.onBeforeSendHeaders.addListener(
	    function(details) {
	    	
	    	/*
	    	 * Obtain header information
	    	 * var headers = details.requestHeaders;
	    	 */

	    	detectedURL = details.url;

	    	/*
	    	 * We only catch video url that contains mime=video parameter
	    	 * NOT audio url that contains mime=audio parameter
	    	 */
	    	if (detectedURL.indexOf('videoplayback?') > -1 && detectedURL.indexOf('mime=video') > -1 ) {
	    		
	    		/*
	    		 * is the current url for video ads?
	    		 * We found that YouTube Ads url contains ctier
	    		 * But it is only the case where the Ads video server has different URL compared the one for the main video
	    		 * We DON'T find the ctier parameters when the domains (for Ads and main content) are the same.
	    		 */
		    	if (detectedURL.indexOf('ctier=') > -1 ) {
		    		isVideoAds=true;
		    	}else{
		    		isVideoAds=false;
		    	}
		    	
	    		fullURL = details.url;
	    		previous_requestId = details.requestId;
	    		previous_time = parseInt(details.timeStamp);
	    		findvideoURL = true;
	    		
	    		var url_id=previous_requestId.toString();
	    		var url_time=previous_time.toString();
	    		
	    		/*
	    		 * Update tabId
	    		 */
	    		send_request_video_playback[url_id]=url_time;
	    		
	    		/*
	    		 * We only catch YouTube video
	    		 */
	    		var res = detectedURL.split("videoplayback");
	    		if (res[0].indexOf(videoURL) > -1 ) {
	    			// Maintain videoURL
	    			videoURL = res[0];
	    		}else{
	    			// Update recent videoURL
	    			videoURL = res[0];
	    			console.log("New URL dectected: "+videoURL);

	    			/*
	    			 * reset avg_latency when video url changes
	    			 */
	    			avg_latency=0;
	    		}
	    	} 
	    	
	        return {requestHeaders: details.requestHeaders};
	    },
	    {urls: ["<all_urls>"]},
	    ["requestHeaders", "blocking"]
	);



/*
 * HTTP request complete time
 * That indicates how long it takes to completely download video chunks
 */
chrome.webRequest.onCompleted.addListener(
	    function(details) {
			var tmp_after_requestId = details.requestId;
    		var milliseconds = (new Date).getTime();
			var tmp_after_time = parseInt(details.timeStamp);

			var url_id=tmp_after_requestId.toString();
    		if(send_request_video_playback[url_id]){
    			var prev_time=parseInt(send_request_video_playback[url_id]);
    			var time_gap=tmp_after_time-prev_time;
    			
    			/*
    			 * accumulated avg latency update
    			 */
    			sum_all_time = sum_all_time + time_gap;
    			count_events = count_events +1;
    			var avg = sum_all_time/count_events;
    			avg_latency = Math.round(avg);
    			    			
    			
    			var re = /&range=(\d+(\-\d+)*)/;
    			var inspect_url=details.url;
    			var found = inspect_url.match(re);
    			var found_split=found[1].split("-");
    			var end_byte=parseInt(found_split[1]);
    			var first_byte=parseInt(found_split[0]);
    			time_gap = time_gap/1000;
    			var total_byte=end_byte-first_byte+1;
    			var traffic=(total_byte)/time_gap;
    			traffic = Math.round(traffic/1024);
    			

    			/*
    			 * Accumulated traffic monitoring
    			 */
    			traffic_monitoring=traffic_monitoring+traffic+"&";

    			
    			/*
    			 * To calculate avg. traffic over last 5seconds in contentscript.js
    			 */
    			traffic_total_bytes=traffic_total_bytes+total_byte;

    			/*
    			 * Update tabId array
    			 */
    			delete send_request_video_playback[url_id];

    		}
    			
	    },
	    {urls: ["<all_urls>"]},
	    ["responseHeaders"]
);



/*
 * Receive and send messages to content script
 */
chrome.runtime.onMessage.addListener(function(message2,sender2,sendResponse2){
	
	
	  sendResponse2({getvideoURL: videoURL, getavglatency: avg_latency, detectedURL: detectedURL, isVideoAds: isVideoAds, traffic_total_bytes: traffic_total_bytes, traffic_monitoring: traffic_monitoring});
	  
	  /*
	   * reset every 5seconds
	   */
	  traffic_monitoring='';
	  traffic_total_bytes=0;
});


