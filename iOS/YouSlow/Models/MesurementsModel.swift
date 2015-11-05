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

    func didChangecity_ip_based(city_ip_based: String)
    func didChangeregion_ip_based(region_ip_based: String)
    func didChangecountry_ip_based(country_ip_based: String)
    func didChangecoordinates_ip_based(coordinates_ip_based: String)

    func didChangelat_ip_based(lat_ip_based: String)
    func didChangelon_ip_based(lon_ip_based: String)
    
}

class Measurements: YTPlayerDelegate, LocationDelegate, QualityDelegate{
    var location = Location()
    let qos = QualityOfService()
    var token = dispatch_once_t()
    var startTime: NSDate?
    var lastState = YTPlayerState.Unstarted
    var reportToken = dispatch_once_t()
    var startToken = dispatch_once_t()
    
    
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
    
    
    func didGetcity_ip_based(city_ip_based: String) {
        delegate?.didChangecity_ip_based(city_ip_based)
    }
    func didGetregion_ip_based(region_ip_based: String) {
        delegate?.didChangeregion_ip_based(region_ip_based)
    }
    func didGetcountry_ip_based(country_ip_based: String) {
        delegate?.didChangecountry_ip_based(country_ip_based)
    }
    func didGetcoordinates_ip_based(coordinates_ip_based: String) {
        delegate?.didChangecoordinates_ip_based(coordinates_ip_based)
    }
    func didGetlat_ip_based(lat_ip_based: String) {
        delegate?.didChangelat_ip_based(lat_ip_based)
    }
    func didGetlon_ip_based(lon_ip_based: String) {
        delegate?.didChangelon_ip_based(lon_ip_based)
    }
    
    
    //    func didGetcity_ip_based(city_ip_based: String)
    //    func didGetregion_ip_based(region_ip_based: String)
    //    func didGetcountry_ip_based(country_ip_based: String)
    //    func didGetcoordinates_ip_based(coordinates_ip_based: String)
    
    
    
    
    
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
            
            var isCity = true;
            var isRegion = true;
            var isCountry = true;
            var isCoornidate = true;
            var isOrg = true;

            
            
            // Check first location information
            
//            report["city"] = self.location.city!
            if let test=self.location.city{
                report["city"] = self.location.city!
            }else{
                isCity = false;
            }
            
//            report["region"] = self.location.region!
            if let test=self.location.region{
                report["region"] = self.location.region!
            }else{
                isRegion = false;
            }

//            report["country"] = self.location.country!
            if let test=self.location.country{
                report["country"] = self.location.country!
            }else{
                isCountry = false;
            }

//            report["loc"] = self.location.coordinates!
            if let test=self.location.coordinates{
                report["loc"] = self.location.coordinates!
            }else{
                isCoornidate = false;
            }

//            report["org"] = self.location.org
            if let test=self.location.org{
                report["org"] = self.location.org!
            }else{
                isOrg = false;
            }
            
            // if faile to locate, we quit reporting
            if !isCountry || !isRegion || !isCity{
                print("MeasurementModel.swift -> No location information!");
                print("We go to IP-based information");
                report["city"] = self.location.city_ip_based;
                report["region"] = self.location.region_ip_based;
                report["country"] = self.location.country_ip_based;
                report["loc"] = self.location.coordinates_ip_based!
//                return;
            }
            
            
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
            let newItem = NSEntityDescription.insertNewObjectForEntityForName("Measurement", inManagedObjectContext: managedContext) 
            newItem.setValue(report["localtime"], forKey: "localtime")
            newItem.setValue(report["loc"], forKey: "loc")
            newItem.setValue(report["numofrebufferings"], forKey: "numofrebufferings")
            newItem.setValue(report["requestedresolutions"], forKey: "requestedresolutions")
            do {
                try managedContext.save()
            } catch let error1 as NSError {
                error = error1
            } catch {
                fatalError()
            }
            
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
            reportMeasurements()
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

