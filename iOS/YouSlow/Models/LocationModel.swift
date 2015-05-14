//
//  LocationModel.swift
//  YouSlow
//
//  Created by to0 on 3/8/15.
//  Copyright (c) 2015 to0. All rights reserved.
//
import UIKit
import CoreLocation

protocol LocationDelegate {
    func didGetLocation(location: String)
    func didGetIsp(isp: String)
}

class Location: NSObject, CLLocationManagerDelegate {
    var coordinates: String?
    var country: String?
    var city: String?
    var region: String?
    let locationManager = CLLocationManager()
    let geoCoder = CLGeocoder()
    var currentLocation: CLLocation?
    var geoCoderToken = dispatch_once_t()
    var org: String?
    var delegate: LocationDelegate?

    override init() {
        super.init()
        getOrg()
        locationManager.delegate = self
        locationManager.distanceFilter = kCLDistanceFilterNone
        locationManager.desiredAccuracy = kCLLocationAccuracyBest
        println(CLLocationManager.authorizationStatus().rawValue)
        if CLLocationManager.authorizationStatus() == CLAuthorizationStatus.NotDetermined || CLLocationManager.authorizationStatus() == CLAuthorizationStatus.Denied {
            if (UIDevice.currentDevice().systemVersion as NSString).floatValue >= 8.0 {
                locationManager.requestWhenInUseAuthorization()
            }
        }
    }
    
    var isReady: Bool {
        return org != nil
    }
    private func getOrg() {
        if isReady {
            return
        }
        DataApi.sharedInstance.getNetworkInfo(convertResponse, fail: failHandler)
    }
    private func convertResponse(res: NSDictionary) {
        if let org = res["org"] as? String {
            self.org = org.stringByReplacingOccurrencesOfString(" ", withString: "", options: NSStringCompareOptions.allZeros, range: nil)
            println("ISP: \(self.org!)")
            dispatch_async(dispatch_get_main_queue(), {
                self.delegate?.didGetIsp(self.org!)
            })
        }
    }
    private func failHandler(err: NSError) {
        
    }
    
    private func decodeLocation(array: [AnyObject]!, err: NSError!) -> Void {
        if err == nil {
            let mark = array.first as! CLPlacemark
            country = mark.ISOcountryCode
            city = mark.subAdministrativeArea.stringByReplacingOccurrencesOfString(" ", withString: "", options: NSStringCompareOptions.allZeros, range: nil)
            region = mark.administrativeArea
            coordinates = "\(mark.location.coordinate.latitude),\(mark.location.coordinate.longitude)"
            println("Country: \(country!)")
            println("City: \(city!)")
            println("Region: \(region!)")
            println("Loc: \(coordinates!)")
            delegate?.didGetLocation("\(coordinates!)")
        }
    }
    // Delegates
    func locationManager(manager: CLLocationManager!, didChangeAuthorizationStatus status: CLAuthorizationStatus) {
        if status == CLAuthorizationStatus.AuthorizedAlways || status == CLAuthorizationStatus.AuthorizedWhenInUse {
            locationManager.startUpdatingLocation()
        }
    }
    func locationManager(manager: CLLocationManager!, didUpdateLocations locations: [AnyObject]!) {
        //An array of CLLocation objects. The most recent location update is at the end of the array.
        dispatch_once(&geoCoderToken, {
            self.currentLocation = locations.last as? CLLocation
            self.geoCoder.reverseGeocodeLocation(self.currentLocation!, completionHandler: self.decodeLocation)
        })
    }
}
