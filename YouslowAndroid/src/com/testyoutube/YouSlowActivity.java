package com.testyoutube;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.os.Bundle;
import android.view.KeyEvent;
import android.webkit.WebChromeClient;
import android.webkit.WebView;
import android.webkit.WebViewClient;

@SuppressLint("SetJavaScriptEnabled")
public class YouSlowActivity extends Activity  {
	
	private WebView webView = null;
	@Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);          
        getActionBar().setTitle("YouSlow monitoring site");
        setContentView(R.layout.activity_youslow);
        
        webView = (WebView)findViewById(R.id.webviewYouSlow);
        webView.setWebChromeClient(new WebChromeClient());
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                view.loadUrl(url);
                return false;
            }
        });

        webView.getSettings().setJavaScriptEnabled(true);
        webView.getSettings().setBuiltInZoomControls(true);
        webView.setVerticalScrollBarEnabled(true);
        webView.getSettings().setJavaScriptCanOpenWindowsAutomatically(true);		
        
        webView.getSettings().setUseWideViewPort(true);
        webView.getSettings().setSupportMultipleWindows(true);
        webView.getSettings().setLoadsImagesAutomatically(true);
        webView.getSettings().setDomStorageEnabled(true);
        webView.getSettings().setLoadWithOverviewMode(true);
	   	
		String loadURL="http://dyswis.cs.columbia.edu/youslow/";
	   	webView.loadUrl(loadURL); 
                

	}
	
	@Override
	public boolean onKeyDown(int keyCode, KeyEvent event) {
	    if (event.getAction() == KeyEvent.ACTION_DOWN) {
	        switch (keyCode) {
	            case KeyEvent.KEYCODE_BACK:
	                if (webView.canGoBack()) {
	                	webView.goBack();
	                } else {
	                    finish();
	                }
	                return true;
	        }

	    }
	    return super.onKeyDown(keyCode, event);
	}
	
	
	
}
