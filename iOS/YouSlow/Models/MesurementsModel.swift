//
//  MesurementsModel.swift
//  YouSlow
//
//  Created by to0 on 2/28/15.
//  Copyright (c) 2015 to0. All rights reserved.
//

import Foundation
import CoreData

protocol MeasurementsDelegate {
//    func didGetAllQualities(result: String)
    func didChangeToState(state: String)
    func didChangeToQuality(quality: String)
    func didChangeLocation(location: String)
    func didChangeBuffering(bufferings: String)
    func didChangeIsp(isp: String)
}
class Measurements: YTPlayerDelegate, LocationDelegate, QualityDelegate{
    private var location = Location()
    private let qos = QualityOfService()
    private var token = dispatch_once_t()
    private var startTime: NSDate?
    private var lastState = YTPlayerState.Unstarted
    private var reportToken = dispatch_once_t()
    private var startToken = dispatch_once_t()
    let format = NSDateFormatter()
    
    let appDelegate = UIApplication.sharedApplication().delegate as! AppDelegate

    var delegate: MeasurementsDelegate?
    
    init() {
        location.delegate = self
        qos.delegate = self
    }
    func didEndBufferings(bufferings: String) {
        delegate?.didChangeBuffering(bufferings)
    }
    func didGetLocation(location: String) {
        delegate?.didChangeLocation(location)
    }
    func didGetIsp(isp: String) {
        delegate?.didChangeIsp(isp)
    }
    func startMeasuring() {
        startTime = NSDate()
    }
    func endMeasuring(fraction: String) {
        qos.loadedFraction = fraction
    }
    func reportMeasurements() {
        dispatch_once(&reportToken, {
            [unowned self] in

            if self.lastState == YTPlayerState.Ended {
                self.qos.abandonment = "0"
            }
            else if self.lastState == YTPlayerState.Buffering {
                self.qos.abandonment = "1"
            }
            else {
                self.qos.abandonment = "2"
            }
            var report = [String: String]()

            let time = NSDate()
            self.format.dateFormat = "yyyy-MM-dd%20HH:mm:ss"
            self.format.stringFromDate(time)
            report["localtime"] = self.format.stringFromDate(time)
            report["hostname"] = "none"
            report["city"] = self.location.city!
            report["region"] = self.location.region!
            report["country"] = self.location.country!
            report["loc"] = self.location.coordinates!
            report["org"] = self.location.org
            report["numofrebufferings"] = "\(self.qos.numOfBufferings)"
            report["bufferduration"] = "\(self.qos.durationOfBufferings)"
            report["bufferdurationwithtime"] = self.qos.bufferingsWithTime
            report["resolutionchanges"] = "\(self.qos.resolutionChanges)"
            report["requestedresolutions"] = self.qos.requestedResolutions
            report["requestedresolutionswithtime"] = self.qos.requestedResolutionsWithTime
            report["timelength"] = "\(self.qos.timeLength)"
            report["abandonment"] = "\(self.qos.abandonment):\(self.qos.loadedFraction)"
            report["allquality"] = self.qos.availableQualities
            report["initialbufferingtime"] = "125"
            report["avglatency"] = "234"
            report["version"] = "iOS1.0"
            
            let managedContext = self.appDelegate.managedObjectContext!
            var error: NSError?
            let newItem = NSEntityDescription.insertNewObjectForEntityForName("Measurement", inManagedObjectContext: managedContext) as! NSManagedObject
            newItem.setValue(report["localtime"], forKey: "localtime")
            newItem.setValue(report["loc"], forKey: "loc")
            newItem.setValue(report["numofrebufferings"], forKey: "numofrebufferings")
            newItem.setValue(report["requestedresolutions"], forKey: "requestedresolutions")
            managedContext.save(&error)
            
            DataApi.sharedInstance.postYouSlow(report, success: nil)
        })
    }
    // Delegates
    func playerHadIframeApiReady(playerView: YTPlayerView) {
//        println("api ready")
    }
    func playerDidBecomeReady(playerView: YTPlayerView) {
        
        qos.timeLength = playerView.getVideoDuration()!
    }
    func playerDidChangeToState(playerView: YTPlayerView, state: YTPlayerState) {
        if state != YTPlayerState.Unstarted {

            dispatch_once(&startToken, {
                [weak self] in
                self?.startMeasuring()
            })
            delegate?.didChangeToState("Unstarted")
        }
        if state == YTPlayerState.Buffering {
            delegate?.didChangeToState("Rebuffering")

            if startTime == nil {
                return
            }
            if lastState == YTPlayerState.Playing {
                let time = 0 - Int(startTime!.timeIntervalSinceNow)
                qos.startBuffering(time)
            }
        }
        else if state == YTPlayerState.Playing {
            delegate?.didChangeToState("Playing")

            if startTime == nil {
                return
            }
            if lastState == YTPlayerState.Buffering {
                let time = 0 - Int(startTime!.timeIntervalSinceNow)
                qos.endBuffering(time)
            }
        }
        lastState = state
        qos.availableQualities = playerView.getAvailableQualityLevelsString()!
        if state == YTPlayerState.Ended {
            delegate?.didChangeToState("Ended")
//            reportMeasurements()
        }
        if state == YTPlayerState.Paused {
            delegate?.didChangeToState("Paused")
        }
    }
    func playerDidChangeToQuality(playerView: YTPlayerView, quality: YTPlayerQuality) {
        delegate?.didChangeToQuality(quality.rawValue)
        if startTime == nil {
            return
        }
        let time = 0 - Int(startTime!.timeIntervalSinceNow)
        qos.changeToQuality(time, quality: quality.rawValue)
    }
}

