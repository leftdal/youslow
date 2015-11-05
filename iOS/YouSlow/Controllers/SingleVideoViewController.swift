//
//  SingleVideoViewController.swift
//  Demo
//
//  Created by to0 on 2/1/15.
//  Copyright (c) 2015 to0. All rights reserved.
//
import Foundation
import UIKit





class SingleVideoViewController: UIViewController, MeasurementsDelegate{

    @IBOutlet var playerView: YTPlayerView!
    
    var measurements = Measurements()
    var videoId = ""
    
    

    @IBOutlet weak var output: UILabel!

    var timer:NSTimer? = nil;
    
    
    override func viewDidLoad() {
        super.viewDidLoad()
        playerView.loadPlayerWithOptions(videoId)
        playerView.delegate = measurements
        self.automaticallyAdjustsScrollViewInsets = false
        
        
        timer = NSTimer.scheduledTimerWithTimeInterval(1.0, target: self, selector: Selector("sayOutput"), userInfo: nil, repeats: true)
        
    }
   
    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    override func viewWillDisappear(animated: Bool) {
        if let fraction = playerView.getVideoLoadedFraction() {
            measurements.endMeasuring(fraction)
            measurements.reportMeasurements()
        }
        playerView.removeWebView()
    }
    
    
    
    // Every second update
    func sayOutput()
    {
        let requestedResolutions: String = measurements.qos.requestedResolutions
        let newString = requestedResolutions.stringByReplacingOccurrencesOfString(":", withString: "", options: NSStringCompareOptions.LiteralSearch, range: nil)
        let resolutionChanges: String = String(measurements.qos.resolutionChanges);
        let durationOfBufferings: String = String(measurements.qos.durationOfBufferings);
        let results: String = "Current resolution: "+newString+"\n"+"Total resolution switches: "+resolutionChanges+"\n"+"Total duration of rebufferings: "+durationOfBufferings;
        self.output.text=results;

    }
    
    
    
    func didChangeIsp(isp: String) {
//        ispLabel.text = "ISP: \(isp)"
    }
    func didChangeBuffering(bufferings: String) {
//        bufferingLabel.text = "Number of Rebufferings: \(bufferings)"
    }
    func didChangeToQuality(quality: String) {
//        videoQualityLabel.text = "Video Quality: \(quality)"
//        print(quality);
  
    }
    func didChangeToState(state: String) {
//        videoStateLabel.text = "Video State: \(state)"
    }
    func didChangeLocation(location: String) {
//        locationLabel.text = "Location: \(location)"
    }
    
    func didChangecity_ip_based(city_ip_based: String){}
    func didChangeregion_ip_based(region_ip_based: String){}
    func didChangecountry_ip_based(country_ip_based: String){}
    func didChangecoordinates_ip_based(coordinates_ip_based: String){}
    
    func didChangelat_ip_based(lat_ip_based: String){}
    func didChangelon_ip_based(lon_ip_based: String){}
    

    
}

