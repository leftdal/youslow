                                                                                                                                         //
//  YTPlayerView.swift
//  Demo
//
//  Created by to0 on 2/1/15.
//  Copyright (c) 2015 to0. All rights reserved.
//

import UIKit

protocol YTPlayerDelegate {
//    func playerHadIframeApiReady(playerView: YTPlayerView)
    func playerDidBecomeReady(playerView: YTPlayerView)
    func playerDidChangeToState(playerView: YTPlayerView, state: YTPlayerState)
    func playerDidChangeToQuality(playerView: YTPlayerView, quality: YTPlayerQuality)
}

class YTPlayerView: UIView, UIWebViewDelegate {
    
    let originalUrl = "about:blank"
    var videoId = ""
    var delegate: YTPlayerDelegate?
     var webView: UIWebView?

    required init(coder aDecoder: NSCoder) {
        super.init(coder: aDecoder)
//        loadPlayerWithOptions(nil)
    }
    override init(frame: CGRect) {
        super.init(frame: frame)
//        loadPlayerWithOptions(nil)
    }

    /*
    // Only override drawRect: if you perform custom drawing.
    // An empty implementation adversely affects performance during animation.
    override func drawRect(rect: CGRect) {
        // Drawing code
    }
    */
    
    func loadVideoById(id: String) {
        var js = "player.loadVideoById('\(id)', 0, 'medium');"
        self.evaluateJavaScript(js)
    }
    
    func loadPlayerWithOptions(id: String) -> Bool {
        let bundle = NSBundle.mainBundle();
        let path = NSBundle.mainBundle().pathForResource("YTPlayerIframeTemplate", ofType: "html")
        if path == nil {
            return false
        }
        var err: NSError?
        let template = NSString(contentsOfFile: path!, encoding: NSUTF8StringEncoding, error: &err) as! String
        let iframe = template.stringByReplacingOccurrencesOfString("{{VIDEO_ID}}", withString: id, options: NSStringCompareOptions.allZeros, range: nil)
        if err != nil {
            return false
        }
        newWebView()
        webView?.loadHTMLString(iframe, baseURL: NSURL(string: originalUrl))
        webView?.delegate = self
//        self.webView?.allowsInlineMediaPlayback = true
//        self.webView?.mediaPlaybackRequiresUserAction = false
        return true
    }
    
    func playVideo() {
        evaluateJavaScript("player.playVideo();")
    }
    
    func destroyPlayer() {
        evaluateJavaScript("player.destroy();")
    }
    
    func getVideoDuration() -> String? {
        return evaluateJavaScript("player.getDuration().toString();")
    }
    
    func getVideoLoadedFraction() -> String? {
        return evaluateJavaScript("player.getVideoLoadedFraction().toString();")
    }
    
    func getAvailableQualityLevelsString() -> String? {
        return evaluateJavaScript("player.getAvailableQualityLevels().toString();")
    }
    
    private func evaluateJavaScript(js: String) -> String? {
        return self.webView?.stringByEvaluatingJavaScriptFromString(js)
    }
    
    func webView(webView: UIWebView, didFailLoadWithError error: NSError) {
        println(error)
    }
    func webView(webView: UIWebView, shouldStartLoadWithRequest request: NSURLRequest, navigationType: UIWebViewNavigationType) -> Bool {
        let url: NSURL
        
        if request.URL == nil {
            return false
        }
        url = request.URL!
        if url.host == originalUrl {
            return true
        }
        else if url.scheme == "http" || url.scheme == "https" {
            return shouldNavigateToUrl(url)
        }
        
        if url.scheme == "ytplayer" {
            delegateEvents(url)
            return false
        }
        return true
    }
    func webViewDidStartLoad(webView: UIWebView) {
        println(webView.request?.URL)
    }
    private func shouldNavigateToUrl(url: NSURL) -> Bool {
        return true
    }
    /**
    * Private method to handle "navigation" to a callback URL of the format
    * ytplayer://action?data=someData
    */
    private func delegateEvents(event: NSURL) {
        let action: String = event.host!
        let callback: YTPlayerCallback? = YTPlayerCallback(rawValue: action)
        let query = event.query
        let data = query?.substringFromIndex(advance(query!.startIndex, 5))
        if callback == nil {
            return
        }
        switch callback! {
        case .OnYouTubeIframeAPIReady:
            println("api ready")
//            delegate?.playerHadIframeApiReady(self)
        case .OnReady:
            delegate?.playerDidBecomeReady(self)
        case .OnStateChange:
            if let state = YTPlayerState(rawValue: data!) {
                delegate?.playerDidChangeToState(self, state: state)
            }
        case .OnPlaybackQualityChange:
            if let quality = YTPlayerQuality(rawValue: data!) {
                delegate?.playerDidChangeToQuality(self, quality: quality)
            }
        default:
            println("error: \(data)")
        }
    }
    
    // add and remove webview
    private func newWebView() {
        removeWebView()
        let newWebView = UIWebView(frame: self.bounds)
        newWebView.autoresizingMask = UIViewAutoresizing.FlexibleHeight | UIViewAutoresizing.FlexibleWidth
        newWebView.scrollView.scrollEnabled = false
        newWebView.scrollView.bounces = false
        newWebView.allowsInlineMediaPlayback = true
        newWebView.mediaPlaybackRequiresUserAction = false
        newWebView.setTranslatesAutoresizingMaskIntoConstraints(false)
        webView = newWebView
        addSubview(self.webView!)
    }
    func removeWebView() {
        destroyPlayer()
        webView?.loadHTMLString("", baseURL: NSURL(string: originalUrl))
        webView?.stopLoading()
        webView?.delegate = nil
        
        webView?.removeFromSuperview()
        webView = nil
    }
    
    
}
