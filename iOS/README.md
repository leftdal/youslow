VideoPlayerQoS
==============

iOS YouTube Video Player Measuring and Collecting QoS data in a scientific approach.

Dedicated to generating a data-demonstrated solution to improve quality of service.

Tasks
-----

-	[ ] YouTube Video Playback
	-	[x] play list
	-	[ ] play selected item
	-	[ ] UIWebView memory, now leak ~5M
-	[ ] YouSlow measurements
	-	[x] localtime
	-	[x] city, region, country, loc
	-	[x] org
	-	[x] numofrebufferings, bufferduration, bufferdurationwithtime
	-	[x] resolutionchanges, requestedresolutions, requestedresolutionswithtime
	-	[x] timelength, abandonment, allquality
	-	[ ] initialbufferingtime
	-	[x] version
	-	[x] report to server when video ended
-	[ ] YouSlow demo
	-	[ ] charts show history data

References
----------

-	YouSlow Project: https://dyswis.cs.columbia.edu/youslow/
-	YouSlow Chrome extension: https://chrome.google.com/webstore/detail/youtube-too-slow-youslow/agpnjngphbdlfoeoglcamjgabcocpobi
-	YouTube Data API: https://developers.google.com/youtube/v3/
-	YouTube iFrame API: https://developers.google.com/youtube/iframe_api_reference
-	PNChart: https://github.com/kevinzhow/PNChart
-	YouTubeView: https://github.com/to0/YouTubeView
