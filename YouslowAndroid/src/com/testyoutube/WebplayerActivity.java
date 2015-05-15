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

import org.apache.http.HttpResponse;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.DefaultHttpClient;

import com.testyoutube.R;   

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Context;
import android.graphics.Color;
import android.graphics.Typeface;
import android.location.Location;
import android.location.LocationManager;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.os.AsyncTask;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler; 
import android.text.Spannable;
import android.text.SpannableString;
import android.text.method.ScrollingMovementMethod;
import android.text.style.ForegroundColorSpan;
import android.text.style.StyleSpan;
import android.view.KeyEvent;
import android.view.View;
import android.webkit.ConsoleMessage;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView; 
import android.webkit.WebViewClient; 
import android.widget.LinearLayout;
import android.widget.TextView;



public class WebplayerActivity extends Activity {

	// UI variables
	private LinearLayout linearLayout = null;
	private LinearLayout subLayout = null;
	private WebView webView = null;
	private WebChromeClient chromeClient = null;
	private View myView = null;
	private WebChromeClient.CustomViewCallback myCallBack = null; 
	private TextView textView = null;

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
    protected String version = "";
    protected String inibuffertime = "";
    protected String loadedfrac = "";
    protected String timelength = "0";
    protected String allquality = "";
    private Boolean windowFlag; // Flag is true if we are in base web view, false if in full screen mode	
    
    // Result show in text view, only use in demo
    // private String RebufPrint = "";
    // private String ResolPrint = "";
    
	
    @SuppressLint("SetJavaScriptEnabled")
	@Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);                        
        webVideoId = getIntent().getStringExtra("VIDEO_ID"); 
        
        setContentView(R.layout.activity_player);        
        webView = (WebView)findViewById(R.id.webview);
		linearLayout = (LinearLayout)findViewById(R.id.linearlayout);
		subLayout = (LinearLayout)findViewById(R.id.linear1);
		textView = (TextView)findViewById(R.id.textView);
		 
		textView.setMovementMethod(new ScrollingMovementMethod());
		// Developer key
	    final String KEY = "AIzaSyBx8NE1C1VFreZgI4CP4tf2EeTx6TbHtDM";
	    // Setting content to textView
		new HttpAsyncTask().execute("https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&textFormat=plainText&videoId="+webVideoId+"&key="+KEY);

		
		// Getting location information: latitude and longitude
        locationManager = (LocationManager) getSystemService(Context.LOCATION_SERVICE);
        boolean isNetworkEnabled = locationManager.isProviderEnabled(LocationManager.NETWORK_PROVIDER);
        boolean isGPSEnabled = locationManager.isProviderEnabled(LocationManager.GPS_PROVIDER);
        String locationProvider = "";     
        if(isNetworkEnabled){
            locationProvider = LocationManager.NETWORK_PROVIDER;
            Location location = locationManager.getLastKnownLocation(locationProvider);    
            lat = location.getLatitude();
            lon = location.getLongitude();
        }
        else if(isGPSEnabled){
        	locationProvider = LocationManager.GPS_PROVIDER;
            Location location = locationManager.getLastKnownLocation(locationProvider);     
            lat = location.getLatitude();
            lon = location.getLongitude();
        }
         
        // Getting android version
        String release = Build.VERSION.RELEASE;
        version = "Android " + release;        
 
        // Setting web view
        webView.getSettings().setJavaScriptEnabled(true);
		webView.getSettings().setJavaScriptCanOpenWindowsAutomatically(true);		
		
		webView.setWebViewClient(new MyWebviewCient());		
		chromeClient = new MyChromeClient();		
		webView.setWebChromeClient(chromeClient);
		
		webView.getSettings().setCacheMode(WebSettings.LOAD_NO_CACHE);
		webView.getSettings().setLayoutAlgorithm(WebSettings.LayoutAlgorithm.NARROW_COLUMNS);
		webView.setHorizontalScrollBarEnabled(false);
		webView.setVerticalScrollBarEnabled(false);			 
		webView.getSettings().setSupportZoom(false);      
		webView.getSettings().setLoadWithOverviewMode(true);
		
		// Providing interface to interact with JavaScript
		final JavaScriptInterface myJavaScriptInterface = new JavaScriptInterface(this); 
		webView.addJavascriptInterface(myJavaScriptInterface, "AndroidFunction");
		
		webView.loadUrl("file:///android_asset/test.html"); 
		windowFlag = true; 
		
		if(savedInstanceState != null){
			webView.restoreState(savedInstanceState);
		}
		
		// Using third party API to get ISP information
		new HttpAsyncTask().execute("http://ip-api.com/line");
		
}
    
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
				}
				else{
					abandonment = 2;
				}
			} 
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
		 
		 String url = "http://dyswis.cs.columbia.edu/youslow/dbupdatesecured9.php?";
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
		 message += "&avglatency=" + "0";
		 message += "&allquality=" + allquality;
		 message += "&version=" + version.replace(" ", "");
		 
		 new HttpAsyncTask().execute(url + message);
		 saveInfo(message);
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
       	       while(src.hasNext() && count < 10){
       	    	   count++;
       	    	   text += "/" + src.next();
       	       }
       	       src.close();
               
       	       // Storing
               FileOutputStream outStream=this.openFileOutput("recentrecords.txt",Context.MODE_PRIVATE);
               outStream.write(text.getBytes());
               outStream.close();
                
           } catch (FileNotFoundException e) {
        	   // If no record exists, create a new one
        	   try{
	        	   FileOutputStream outStream=this.openFileOutput("recentrecords.txt",Context.MODE_PRIVATE);
	               outStream.write(text.getBytes());
	               outStream.close();
        	   }catch (FileNotFoundException ew){
        		   return;
        	   }
        	   catch(IOException ew){
        		   return;
        	   }
               return;
           }
           catch (IOException e){
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
	            		 }
	            		 else{
	            			 loadedfrac = "1";
	            		 }
	            	 }
	            	 else if(msgTag.equals("timelength")){
	            		 timelength = msgToast;
	            	 }
	            	 else if(msgTag.equals("inibuffer")){
	            		 inibuffertime = msgToast;
	            	 }
	            	 else if(msgTag.equals("allquality")){
	            		 allquality = msgToast;
	            	 }
	            		 
	             }
	         }); 
	    }
	    
	    // Sending playing state changing information 
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
	            	 
	            	// Result show in text view, only use in demo
	            	/*
	            	 String printinfo ="Num of rebufferings: " + countbuffer+"\n";
	            	 printinfo +="Rebuffering duration: " + totalBuffertime+"\n";	            	 
	            	 RebufPrint = printinfo;
	                 textView.setText(RebufPrint+ResolPrint); 
	                */
	                 
	            	 lastreturnedstate = Integer.parseInt(msgToast);
	             }
	         });
	    }
	    
	    // Sending playback quality changing information
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
	            	 
	            	// Result show in text view, only use in demo
	            	/*
	            	 String printinfo = "Resolution changes: " + totalResolchange.substring(0, totalResolchange.length()-1)+"\n";            	 
	            	 ResolPrint = printinfo;	            	 
	                 textView.setText(RebufPrint+ResolPrint);	 
	                */	            	        
	             }
	         });
	    }
	
	 	// Sending video id to JavaScript
	    public String getVideoid(){	    	
	    	return webVideoId;
	    }
	    
	    // Player size is set according to phone size 
	    public int getWidth(){  	    	 
	    	int x = webView.getWidth();
	    	return x; 
	    }
	    
	    public int getHeight(){	    		    	
	    	int y = webView.getHeight();
	    	return y;	    	
	    }	    	      	    
    }
	 
    public static String GET(String url){
        InputStream inputStream = null;
        String result = "";
        try {
            HttpClient httpclient = new DefaultHttpClient();
            HttpResponse httpResponse = httpclient.execute(new HttpGet(url));
            inputStream = httpResponse.getEntity().getContent();
            if(inputStream != null)
                result = convertInputStreamToString(inputStream);
            else
                result = "Did not work!";
 
        } catch (Exception e) { 
        	
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
    	    String[] author= new String[20], comment = new String[20];
    	   
    	    // Extracting authors and comments
    	    int n = 0;
    	    while (src.hasNext()) {	
    	    	splitter = src.next();
    	    	if(splitter.equals("textDisplay:")){
    	    		Temp =  src.next(); 
    	    		while(!Temp.substring(Temp.length()-1, Temp.length()).equals(",")){
    	    			Temp += " " + src.next();
    	    		}
    	    		if(Temp.length()>7){
        	    		comment[n] = Temp.substring(0, Temp.length()-7);
    	    		}
    	    		else{
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
    	    
    	    // Setting comments to textview
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
    	    
    	    return;
            
       }
    }
 
}