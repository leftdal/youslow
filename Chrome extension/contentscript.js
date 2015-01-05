var s = document.createElement('script');
s.src = chrome.extension.getURL('script.js');
(document.head||document.documentElement).appendChild(s);
s.onload = function() {
    s.parentNode.removeChild(s);
};




/*
 * Event listener - access to local storage
 * Save current buffering state locally. 
 * Necessary when a client stops (or changes) a video in middle of experiencing buffer stalling
 */

var currentURL;
var avglatency;


document.addEventListener('BufferingStatus', function(e) {
	
	if(e.detail.bufferflag=="InitialCheck"){
		
		chrome.storage.local.get('detail', function (retVal) {
			var fetchResponse = new CustomEvent('fetchResponse', {
				"detail": retVal.detail
		});
		    document.dispatchEvent(fetchResponse);
		});
		
	}else{
		
		/*
		 * Try to exchange messages to background script
		 */
		SendMessageToBackgroundPage("Update current video URL and avg latency from background page");
		
    	/*
    	 * Average latency update
    	 */
		e.detail.avglatency = avglatency;
		
		chrome.storage.local.set({
			"detail": e.detail
		}, function(items) {
			try {
		        if (chrome.runtime.lastError) {
		            console.warn(chrome.runtime.lastError.message);
		        } else {
//		        	console.log("YouSlow bufferStalling staus updated All: "+e.detail.localtime+"&"+e.detail.hostname+"&"+e.detail.city+"&"+e.detail.region+"&"+e.detail.country+"&"+e.detail.loc+"&"+e.detail.org+"&"+e.detail.bufferduration+"&"+e.detail.resolutionchanges+"&"+e.detail.requestedresolutions+"&"+e.detail.timelength+"&"+e.detail.initialbufferingtime+"&"+e.detail.abandonment+"&"+e.detail.bufferflag+"&"+e.detail.avglatency);
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
	 * However, we cannot use IP to geolocation database since all IPs are marked on Mountain view, CA
	 * We can measure HTTP response time using chrome.webRequest.onHeadersReceived.addListener(function callback)
	 */
	chrome.runtime.sendMessage({greeting: "getvideoURL"}, function(response2) {
//		  console.log("URL: "+response2.getvideoURL+", Avg_latency: "+response2.getavglatency+" ms");
		  currentURL=response2.getvideoURL;
		  avglatency=response2.getavglatency;
	});
		
}




