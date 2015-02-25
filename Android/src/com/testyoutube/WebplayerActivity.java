package com.testyoutube;

import com.testyoutube.R; 
import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Context;
import android.os.Bundle;
import android.os.Handler;
import android.util.Log;
import android.webkit.WebView;
import android.widget.TextView;
import android.widget.Toast;


public class WebplayerActivity extends Activity {
	private WebView myWebView;
	private TextView myTextView;	
	final Handler myHandler = new Handler();
	public String webVideoId;
       
	
    /** Called when the activity is first created. */
    @SuppressLint("SetJavaScriptEnabled")
	@Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
       
        webVideoId = getIntent().getStringExtra("VIDEO_ID"); 
        setContentView(R.layout.activity_player);
        myWebView = (WebView)findViewById(R.id.webview);
        myTextView = (TextView)findViewById(R.id.textView);        
        final JavaScriptInterface myJavaScriptInterface
     	= new JavaScriptInterface(this);    	 
    	  
        myWebView.getSettings().setJavaScriptEnabled(true);
        myWebView.addJavascriptInterface(myJavaScriptInterface, "AndroidFunction");
        myWebView.loadUrl("file:///android_asset/test.html"); 
        
    }
    
    public class JavaScriptInterface {
		Context mContext;

	    JavaScriptInterface(Context c) {
	        mContext = c;
	    }
	    
	    public void showToast(String webMessage){	    	
	    	final String msgToast = webMessage;	    	
	    	myHandler.post(new Runnable() {
	             @Override
	             public void run() {
	                 // This gets executed on the UI thread so it can safely modify Views
	                 myTextView.setText(msgToast);
	                 // Log is for test
	                 Log.v("OUTTEST", msgToast);        
	             }
	         });

	       Toast.makeText(mContext, msgToast, Toast.LENGTH_SHORT).show(); 
	    }
	    
	    public String getVideoid(){	    	
	    	return webVideoId;
	    }
    }
    
}