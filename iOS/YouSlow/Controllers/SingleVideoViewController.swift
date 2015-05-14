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
    
    override func viewDidLoad() {
        super.viewDidLoad()
        playerView.loadPlayerWithOptions(videoId)
        playerView.delegate = measurements
        self.automaticallyAdjustsScrollViewInsets = false

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
    func didChangeIsp(isp: String) {
//        ispLabel.text = "ISP: \(isp)"
    }
    func didChangeBuffering(bufferings: String) {
//        bufferingLabel.text = "Number of Rebufferings: \(bufferings)"
    }
    func didChangeToQuality(quality: String) {
//        videoQualityLabel.text = "Video Quality: \(quality)"
    }
    func didChangeToState(state: String) {
//        videoStateLabel.text = "Video State: \(state)"
    }
    func didChangeLocation(location: String) {
//        locationLabel.text = "Location: \(location)"
    }
}

