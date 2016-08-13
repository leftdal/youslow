package com.testyoutube;
 
import java.io.BufferedReader;
import java.io.ByteArrayOutputStream;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader; 
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Scanner;

import android.webkit.JavascriptInterface;

import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.HttpResponse;

import com.testyoutube.R;   

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Context;
import android.location.Location;
import android.location.LocationManager;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.os.AsyncTask;
import android.os.Bundle;
import android.os.Handler; 
import android.util.Log;
import android.view.KeyEvent;
import android.view.View;
import android.webkit.ConsoleMessage;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceResponse;
import android.webkit.WebView; 
import android.webkit.WebViewClient; 
import android.widget.LinearLayout;
import android.widget.TextView;



/**
 * To do
 * add skip function
 *
 */



@SuppressWarnings("deprecation")
@SuppressLint("AddJavascriptInterface")
public class WebplayerActivity extends Activity {
	// UI variables
	private LinearLayout linearLayout = null;
	private LinearLayout subLayout = null;
	private WebView webView = null;
	private WebChromeClient chromeClient = null;
	private View myView = null;
	private WebChromeClient.CustomViewCallback myCallBack = null; 
	private TextView r1c2 = null;
	private TextView r2c2 = null;
	private TextView r3c2 = null;
	private TextView r4c2 = null;
	private TextView r5c2 = null;
	private TextView r6c2 = null;
	private TextView r7c2 = null;
	private TextView r7_2c2 = null;
	private TextView r8c2 = null;
	private TextView r9c2 = null;
	private TextView r10c2 = null;

	
	
	final Handler myHandler = new Handler();
	
	// Parameter related variables
	protected String webVideoId;
	protected boolean buffering = false;
	protected int bufferinitial = 0;
	protected int countbuffer = 0;
	protected int countresol = 0;
	protected String countbufferwithtime="";
	protected String countresolwithtime="";
	protected int totalBuffertime;
	protected String totalResolchange="";
	protected LocationManager locationManager; 
	protected int lastreturnedstate = -1;
	protected int abandonment = -1;
	protected double lat = 0;
    protected double lon = 0;
    protected String cityname = "";
    protected String countryname = "";
    protected String regionname = "";
    protected String org = "";
    protected String version = "Android1.0.0";
    protected String inibuffertime = "";
    protected String loadedfrac = "";
    protected String timelength = "0";
    protected String allquality = "";
    protected String playerStatus = "";
    private Boolean windowFlag; // Flag is true if we are in base web view, false if in full screen mode	
    
    private String videoDuration="";
    private Handler mUpdateHandler = new Handler();
	private String getDuration="";
	private String getCurrentTime="";
	private String getCurrentQuality="";

    /**
     * To do
     * Check all measurements
     * 	- add skip function
     * Line chart check
     *	- add last 10 result 
     */
	
    @SuppressLint({ "SetJavaScriptEnabled", "NewApi" })
	@Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);                        
        webVideoId = getIntent().getStringExtra("VIDEO_ID"); 
        
        setContentView(R.layout.activity_player);        
        webView = (WebView)findViewById(R.id.webview);
		linearLayout = (LinearLayout)findViewById(R.id.linearlayout);
		subLayout = (LinearLayout)findViewById(R.id.linear1);
//		textView = (TextView)findViewById(R.id.textView);

		r1c2 = (TextView)findViewById(R.id.r1c2);
		r2c2 = (TextView)findViewById(R.id.r2c2);
		r3c2 = (TextView)findViewById(R.id.r3c2);
		r4c2 = (TextView)findViewById(R.id.r4c2);
		r5c2 = (TextView)findViewById(R.id.r5c2);
		r6c2 = (TextView)findViewById(R.id.r6c2);
		r7c2 = (TextView)findViewById(R.id.r7c2);
		r7_2c2 = (TextView)findViewById(R.id.r7_2c2);
		r8c2 = (TextView)findViewById(R.id.r8c2);
		r9c2 = (TextView)findViewById(R.id.r9c2);
		r10c2 = (TextView)findViewById(R.id.r10c2);

		
//		textView.setMovementMethod(new ScrollingMovementMethod());
		// Developer key
	    final String KEY = "AIzaSyBx8NE1C1VFreZgI4CP4tf2EeTx6TbHtDM";
	    // Setting content to textView
	    String httpRequest ="https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&textFormat=plainText&videoId="+webVideoId+"&key="+KEY;
		new HttpAsyncTask().execute(httpRequest);
		
		Log.i("httpRequest: ",httpRequest);
		
		
//		String videoInfo="https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id="+webVideoId+"&key="+KEY;
//		new HttpAsyncTask().execute(videoInfo);
		
        AppLocationService appLocationService = new AppLocationService(WebplayerActivity.this);
        Location location = appLocationService.getLocation(LocationManager.NETWORK_PROVIDER);
		if (location != null) {
			lat = location.getLatitude();
            lon = location.getLongitude();
		}else{
			Location gpsLocation = appLocationService.getLocation(LocationManager.GPS_PROVIDER);
			if (gpsLocation != null) {
				lat = gpsLocation.getLatitude();
	            lon = gpsLocation.getLongitude();
			}
		}
		String locLat = String.valueOf(lat)+","+String.valueOf(lon);
        Log.i("locLatNET: ",locLat);
		
        
        
                
        // Getting android version
//        String release = Build.VERSION.RELEASE;
//        version = "Android " + release;        
 
        // Setting web view
        webView.getSettings().setJavaScriptEnabled(true);
		webView.getSettings().setJavaScriptCanOpenWindowsAutomatically(true);		
		
		webView.setWebViewClient(new MyWebviewCient());		
		chromeClient = new MyChromeClient();		
		webView.setWebChromeClient(chromeClient);
		
//		webView.getSettings().setCacheMode(WebSettings.LOAD_NO_CACHE);
//		webView.getSettings().setLayoutAlgorithm(WebSettings.LayoutAlgorithm.NARROW_COLUMNS);
		webView.setHorizontalScrollBarEnabled(false);
		webView.setVerticalScrollBarEnabled(false);			 
		webView.getSettings().setSupportZoom(false);      
		webView.getSettings().setLoadWithOverviewMode(true);
		webView.getSettings().setJavaScriptEnabled(true);
		
		// Providing interface to interact with JavaScript
		final JavaScriptInterface myJavaScriptInterface = new JavaScriptInterface(this); 
		webView.addJavascriptInterface(myJavaScriptInterface, "AndroidFunction");
		
		webView.loadUrl("file:///android_asset/test.html"); 
		Log.i("loadURL: ","file:///android_asset/test.html");
		windowFlag = true; 
		
		if(savedInstanceState != null){
			webView.restoreState(savedInstanceState);
		}
		
		// Using third party API to get ISP information
		new HttpAsyncTask().execute("http://ip-api.com/line");
		
		
		/**
         * Update textview
         */
		mUpdateHandler.postDelayed(mUpdateStatus, 1000);
		
}
    
    
    
    
    private final Runnable mUpdateStatus = new Runnable() {
       	public void run() {
       		
//       		-1 – unstarted
//       		0 – ended
//       		1 – playing
//       		2 – paused
//       		3 – buffering
//       		5 – video cued
       		
   			String tmp="";
   			if(playerStatus.equals("-1")){
   				tmp="unstarted";
   			}else if(playerStatus.equals("0")){
   				tmp="ended";
   			}else if(playerStatus.equals("1")){
   				tmp="playing";
   			}else if(playerStatus.equals("2")){
   				tmp="paused";
   			}else if(playerStatus.equals("3")){
   				tmp="buffering";
   			}else if(playerStatus.equals("5")){
   				tmp="video cued";
   			}
   			
   			/**
   			 * Video duration update
   			 */
   			videoDuration=getDuration;
   			
   			r1c2.setText(tmp);
   			
       		r2c2.setText(getCurrentTime+"s / "+getDuration+"s");
       		
        	r3c2.setText(timelength+"s");
        	
           	r4c2.setText(inibuffertime+"s");
           	
           	r5c2.setText(Integer.toString(countbuffer));
           	
        	r6c2.setText(Integer.toString(totalBuffertime)+"s");
        	
        	double d=(double)(Math.ceil(((double)totalBuffertime/(double)(Integer.parseInt(timelength)))*100)/100);
        	r7c2.setText(Double.toString(d));
        	
        	r7_2c2.setText(getCurrentQuality);
        	
        	tmp=countresolwithtime;
        	tmp=tmp.replace("?","s(");
        	tmp=tmp.replace(":",") ");
        	r8c2.setText(tmp);
        	
        	r9c2.setText(loadedfrac);
        	
        	tmp=allquality.replaceAll(":"," ");
        	if(tmp.equals("")){
        		tmp="Not available";
        	}

        	
        	r10c2.setText(tmp);
        	
//            textView.setText(printinfo);
       		
       		/**
       		 * Repeat every second
       		 */
       		mUpdateHandler.postDelayed(mUpdateStatus, 1000);
       	}
       };
       
       
    
    // Close the video when return
    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event)
    {
        if(keyCode == KeyEvent.KEYCODE_BACK && windowFlag){ 
        	webView.loadUrl("about:blank"); 
        	webView.stopLoading();
			if(abandonment == -1){
				if(lastreturnedstate == 3){
					abandonment = 1;
				}else{
					abandonment = 2;
				}
			} 
			Log.i("YouSlow Report: ","trying to report");
			sendParameters();  
        }
        return super.onKeyDown(keyCode, event);       			  
    }
    
	@Override
	public void onBackPressed() {
		if(myView == null){
			super.onBackPressed();
		}
		else{
			chromeClient.onHideCustomView();
		}
	}
	
	@Override
	protected void onSaveInstanceState(Bundle outState) {
		webView.saveState(outState);
	}
	
	public void addJavaScriptMap(Object obj, String objName){
		webView.addJavascriptInterface(obj, objName);
	}
	
	public class MyWebviewCient extends WebViewClient{ 
		@Override
		public WebResourceResponse shouldInterceptRequest(WebView view,
				String url) {
			WebResourceResponse response = null;
			response = super.shouldInterceptRequest(view, url);
			return response;
		}
	}
	
	public class MyChromeClient extends WebChromeClient{		
		@Override
		public void onShowCustomView(View view, CustomViewCallback callback) {
			if(myView != null){
				callback.onCustomViewHidden();
				return;
			}
			linearLayout.removeView(webView);
			linearLayout.removeView(subLayout);
			windowFlag = false;
			linearLayout.addView(view);
			myView = view;
			myCallBack = callback;
		}
		
		@Override
		public void onHideCustomView() {
			if(myView == null){
				return;
			}
			linearLayout.removeView(myView);
			myView = null;
			linearLayout.addView(webView);
			linearLayout.addView(subLayout);
			windowFlag = true;
			myCallBack.onCustomViewHidden();
		}
		
		@Override
		public boolean onConsoleMessage(ConsoleMessage consoleMessage) {
			return super.onConsoleMessage(consoleMessage);
		}
	}	    
    
	// Sending parameters to server
    @SuppressLint("SimpleDateFormat")
	private void sendParameters() {
		 String message = "";
		 Date localtime = new Date();
		 SimpleDateFormat format=new SimpleDateFormat("yyyy-MM-dd%20hh:mm:ss");
		 
		 
		 /**
		  * From Chrome
		  * 	    var URLparameters = "localtime="+timeReport	
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
	    					+"&adslength="+AllAdsLength
							+"&videochunks="+num_of_video_chunks
							+"&videobytes="+total_video_bytes
	    					+"&videoduration="+videoduration
	    					+"&adblock="+isAdblockDetected
	    					+"&numofskips="+num_of_skips;
		  */
		 
		 String url = "http://dyswis.cs.columbia.edu/youslow/dbupdatesecured12.php?";
		 message += "localtime=" + format.format(localtime);
		 message += "&hostname=" + "NoHostname";
		 message += "&city=" + cityname;
		 message += "&region=" + regionname;
		 message += "&country=" + countryname;
		 message += "&loc=" + lat + "," + lon;
		 message += "&org=" + org;
		 message += "&numofrebufferings=" + countbuffer;
		 message += "&bufferduration=" + totalBuffertime;
		 message += "&bufferdurationwithtime=" + countbufferwithtime;
		 message += "&resolutionchanges=" + countresol;
		 message += "&requestedresolutions=" + totalResolchange;
		 message += "&requestedresolutionswithtime=" + countresolwithtime;
		 message += "&timelength=" + timelength;
		 message += "&initialbufferingtime=" + inibuffertime;
		 message += "&abandonment=" + abandonment + ":" + loadedfrac;
		 message += "&avglatency=" + "";
		 message += "&allquality=" + allquality;
		 message += "&version=" + version.replace(" ", "");
		 message += "&adslength=" + "";
		 message += "&videochunks=" + "";
		 message += "&videobytes=" + "";
		 message += "&videoduration=" + videoDuration;
		 message += "&adblock=" + "";
		 message += "&numofskips=" + "";
		 
		 new HttpAsyncTask().execute(url + message);
		 saveInfo(message);
		 
		 Log.i("reported: ",message);
	}
    
    // Storing parameters history in phone
    public void saveInfo(String text)
    {

           try {
        	   // Reading history and combine with the new record
        	   FileInputStream inStream=this.openFileInput("recentrecords.txt");
               ByteArrayOutputStream stream=new ByteArrayOutputStream();
               byte[] buffer=new byte[1024];
               int length = -1;
               while((length=inStream.read(buffer))!=-1)   {
                   stream.write(buffer,0,length);
               } 
               
               String records = stream.toString();
               stream.close();
               inStream.close();   
               
               Scanner src = new Scanner(records);  
       	       src.useDelimiter("/");
       	       int count = 0;
       	       while(src.hasNext() && count < 1000){
       	    	   count++;
       	    	   text += "/" + src.next();
       	       }
       	       src.close();
               
       	       // Storing
               FileOutputStream outStream=this.openFileOutput("recentrecords.txt",Context.MODE_PRIVATE);
               outStream.write(text.getBytes());
               outStream.close();
                
           }catch (FileNotFoundException e) {
        	   // If no record exists, create a new one
        	   try{
	        	   FileOutputStream outStream=this.openFileOutput("recentrecords.txt",Context.MODE_PRIVATE);
	               outStream.write(text.getBytes());
	               outStream.close();
        	   }catch (FileNotFoundException ew){
        		   Log.e("error: ",ew.toString());
        		   return;
        	   }
        	   catch(IOException ew){
        		   Log.e("error: ",ew.toString());
        		   return;
        	   }
               return;
           }
           catch (IOException e){
    		   Log.e("error: ",e.toString());
               return ;
           }
    } 
    
    // Interacting with JavaScript(iFrame)
    public class JavaScriptInterface {
    			 

    	Context mContext;

	    JavaScriptInterface(Context c) {
	        mContext = c;
	    }
	    
	    // Getting statistic parameters
	    @JavascriptInterface
	    public void showToast(String webMessage, String tagMessage){	 
	    	final String msgToast = webMessage; 
	    	final String msgTag = tagMessage;
	    	myHandler.post(new Runnable() {
	             @Override
	             public void run() {      
	            	 // This gets executed on the UI thread so it can safely modify Views
	            	 if(msgTag.equals("loadedfrac")){
	            		 if (msgToast != null){
	            			 loadedfrac = msgToast;
	            		 }else{
	            			 loadedfrac = "1";
	            		 }
	            	 }else if(msgTag.equals("timelength")){
	            		 timelength = msgToast;
	            	 }else if(msgTag.equals("inibuffer")){
	            		 int tmp=Integer.parseInt(msgToast);
	            		 tmp=tmp*1000;
	            		 inibuffertime = Integer.toString(tmp);
	            	 }else if(msgTag.equals("allquality")){
	            		 allquality = msgToast;
	            	 }else if(msgTag.equals("status")){
	            		 playerStatus = msgToast;
	            	 }else if(msgTag.equals("getCurrentTime")){
	            		 getCurrentTime = msgToast;
	            	 }else if(msgTag.equals("getDuration")){
	            		 getDuration = msgToast;
	            	 }else if(msgTag.equals("currentQuality")){
	            		 getCurrentQuality = msgToast;
	            	 }
	            	 
	             }
	         }); 
	    }
	    
	    // Sending playing state changing information
	    @JavascriptInterface
	    public void showToastState(String webMessage, int timeMessage){	    	
	    	final String msgToast = webMessage; 
	    	final int msgTime = timeMessage;
	    	myHandler.post(new Runnable() {
	             @Override
	             public void run() {      
	            	 // This gets executed on the UI thread so it can safely modify Views
	            	 if (msgToast.charAt(0) == '3'){
	            		 countbuffer++;
	            		 buffering = true;
	            		 bufferinitial = msgTime;
	            	 }	            	 
	            	 else if(buffering){
	            		 buffering = false;
	            		 totalBuffertime += (msgTime - bufferinitial);
	            		 countbufferwithtime += bufferinitial +"?"+ (msgTime - bufferinitial)+":";
	            	 }
	            	 if (msgToast.charAt(0) == '0'){
	            		 abandonment = 0;
	            	 }
	            	 
	            	lastreturnedstate = Integer.parseInt(msgToast);
	             }
	         });
	    }
	    
	    // Sending playback quality changing information
	    @JavascriptInterface
	 	public void showToastResolution(String webMessage, int timeMessage){	    	
	    	final String msgToast = webMessage;		  
	    	final int msgTime = timeMessage;
	    	myHandler.post(new Runnable() {
	             @Override
	             public void run() {      
	            	 // This gets executed on the UI thread so it can safely modify Views
	            	 countresol++;
	            	 totalResolchange += msgToast+":";
	            	 countresolwithtime += msgTime+"?"+msgToast+":";
	            	 
	             }
	         });
	    }
	
	 	// Sending video id to JavaScript
	    @JavascriptInterface
	    public String getVideoid(){	    	
	    	return webVideoId;
	    }
	    
	    // Player size is set according to phone size
	    @JavascriptInterface
	    public int getWidth(){  	    	 
	    	int x = webView.getWidth();
	    	return x; 
	    }
	    
	    @JavascriptInterface
	    public int getHeight(){	    		    	
	    	int y = webView.getHeight();
	    	return y;	    	
	    }	    	      	    
    }
	 
    public static String GET(String url){
        InputStream inputStream = null;
        String result = "";
        Log.i("GET request: ",url);
        try {
            @SuppressWarnings({ "resource" })
			HttpClient httpclient = new DefaultHttpClient();
            HttpGet request = new HttpGet(url);
            HttpResponse httpResponse = httpclient.execute(request);
            
            int responseCode = httpResponse.getStatusLine().getStatusCode();
            Log.i("responseCode:", Integer.toString(responseCode));
            
            inputStream = httpResponse.getEntity().getContent();
            if(inputStream != null)
                result = convertInputStreamToString(inputStream);
            else
                result = "Did not work!";
            
        } catch (Exception e) { 
        	Log.e("error: ",e.toString());
        }        
 
        return result;
    }
 
    private static String convertInputStreamToString(InputStream inputStream) throws IOException{
        BufferedReader br = new BufferedReader( new InputStreamReader(inputStream));
        String line = "";
        String result = "";
        
        line = br.readLine();
        if(line.equals("success")){
        	result = "ipapi";
        	br.readLine();
        	result += " " + br.readLine().replace(" ", "");
        	result += " " + br.readLine().replace(" ", "");
        	br.readLine();
        	result += " " + br.readLine().replace(" ", "");
        	br.readLine(); br.readLine();
        	br.readLine(); br.readLine(); 
        	br.readLine(); br.readLine();
        	result += " " + br.readLine().replace(" ", "");        	
        }        
        else{
        	result = line;
        	while((line = br.readLine()) != null){        	
        		result += " "+ line;
        	}
        }           
 
        inputStream.close();
        return result;
 
    }
 
    @SuppressWarnings("static-access")
	public boolean isConnected(){
        ConnectivityManager connMgr = (ConnectivityManager) getSystemService(this.CONNECTIVITY_SERVICE);
            NetworkInfo networkInfo = connMgr.getActiveNetworkInfo();
            if (networkInfo != null && networkInfo.isConnected()) 
                return true;
            else
                return false;   
    }
    
    private class HttpAsyncTask extends AsyncTask<String, Void, String> {
        @Override
        protected String doInBackground(String... urls) {
 
            return GET(urls[0]);
        }
        
        // onPostExecute displays the results of the AsyncTask.
        @Override
        protected void onPostExecute(String result) {
                        
            String Head ="";   
                     
            Scanner sc = new Scanner(result);  
            Head = sc.next();
            if(Head.equals("ipapi")){
    	    	countryname = sc.next();
    	    	regionname = sc.next();
            	cityname = sc.next();
    	    	org = sc.next();
            	sc.close();
            	return;
            }
            
            if(Head.equals("Not")){
            	sc.close();
            	return;
            }
            
            sc.close();
            
            // Analyzing result from youtube comments api
            result = result.replace("\"", "");
            result = result.replace("\\n", " ");
            Scanner src = new Scanner(result);  
    	   
    	    String splitter;
    	    String Temp;
    	    int indexMax=20;
    	    String[] author= new String[indexMax], comment = new String[indexMax];
    	   
    	    // Extracting authors and comments
    	    int n = 0;
    	    while (src.hasNext()) {	
    	    	splitter = src.next();
//    	    	Log.i("splitter: ",splitter);
    	    	if(splitter.equals("textDisplay:")){
    	    		Temp =  src.next(); 
    	    		while(!Temp.substring(Temp.length()-1, Temp.length()).equals(",")){
    	    			Temp += " " + src.next();
    	    		}
    	    		
    	    		if(n>indexMax-1) continue;
    	    		
    	    		if(Temp.length()>7){
//    	    			Log.i("Temp: ",Temp);
        	    		comment[n] = Temp.substring(0,Temp.length()-7);
    	    		}else{
        	    		comment[n] = Temp.substring(0, Temp.length()-1);
    	    		}
    	    		
    	    	}
    	    	if(splitter.equals("authorDisplayName:")){
    	    		Temp =  src.next(); 
    	    		while(!Temp.substring(Temp.length()-1, Temp.length()).equals(",")){
    	    			Temp += " " + src.next();
    	    		}
    	    		author[n] = Temp.substring(0, Temp.length()-1);
    	    		n++;
    	    	}
    	    }
    	    src.close();
    	    
    	    
    	    /**
    	     * Setting comments to textview
    	     */
    	    
    	    /*
    	    Spannable CommentTitle = new SpannableString("COMMENTS\n");    
    	    CommentTitle.setSpan(new ForegroundColorSpan(Color.rgb(170, 170, 220)), 0, CommentTitle.length(), Spannable.SPAN_EXCLUSIVE_EXCLUSIVE);
    	    CommentTitle.setSpan(new StyleSpan(Typeface.BOLD), 0, CommentTitle.length(), Spannable.SPAN_EXCLUSIVE_EXCLUSIVE);
    	    textView.setText(CommentTitle);
    	   
    	    
    	   	for(int i = 0; i < n; i++){       		
        	    Spannable Author = new SpannableString(author[i]+":\n");    
        	    Author.setSpan(new ForegroundColorSpan(Color.rgb(100, 180, 230)), 0, Author.length(), Spannable.SPAN_EXCLUSIVE_EXCLUSIVE);
        	    Author.setSpan(new StyleSpan(Typeface.BOLD), 0, Author.length(), Spannable.SPAN_EXCLUSIVE_EXCLUSIVE);
        	    textView.append(Author);
        	    
        	    Spannable Comment = new SpannableString(comment[i]+"\n\n");    
        	    Comment.setSpan(new ForegroundColorSpan(Color.BLACK), 0, Comment.length(), Spannable.SPAN_EXCLUSIVE_EXCLUSIVE);
        	    textView.append(Comment);    	   		
    	   	}
    	   	*/
    	    
    	    return;
            
       }
    }
 
}