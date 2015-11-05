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
    func didGetcity_ip_based(city_ip_based: String)
    func didGetregion_ip_based(region_ip_based: String)
    func didGetcountry_ip_based(country_ip_based: String)
    func didGetcoordinates_ip_based(coordinates_ip_based: String)
    func didGetlat_ip_based(lat_ip_based: String)
    func didGetlon_ip_based(lon_ip_based: String)
}

class Location: NSObject, CLLocationManagerDelegate {
    var coordinates: String?
    var country: String?
    var city: String?
    var region: String?

    var coordinates_ip_based: String?
    var country_ip_based: String?
    var city_ip_based: String?
    var region_ip_based: String?
    var lat_ip_based: String?
    var lon_ip_based: String?

    
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
        print(CLLocationManager.authorizationStatus().rawValue)
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
            self.org = org.stringByReplacingOccurrencesOfString(" ", withString: "", options: NSStringCompareOptions(), range: nil)
            print("ISP: \(self.org!)")
            dispatch_async(dispatch_get_main_queue(), {
                self.delegate?.didGetIsp(self.org!)
            })
        }
        
        if let city_test = res["city"] as? String {
            self.city_ip_based = city_test.stringByReplacingOccurrencesOfString(" ", withString: "", options: NSStringCompareOptions(), range: nil)
            print("City_ip_based: \(self.city_ip_based!)")
            dispatch_async(dispatch_get_main_queue(), {
                self.delegate?.didGetcity_ip_based(self.city_ip_based!)
            })
        }
        
        if let region_test = res["region"] as? String {
            self.region_ip_based = region_test.stringByReplacingOccurrencesOfString(" ", withString: "", options: NSStringCompareOptions(), range: nil)
            print("Region_ip_based: \(self.region_ip_based!)")
            dispatch_async(dispatch_get_main_queue(), {
                self.delegate?.didGetregion_ip_based(self.region_ip_based!)
            })
        }

        if let country_test = res["countryCode"] as? String {
            self.country_ip_based = country_test.stringByReplacingOccurrencesOfString(" ", withString: "", options: NSStringCompareOptions(), range: nil)
            print("Country_ip_based: \(self.country_ip_based!)")
            dispatch_async(dispatch_get_main_queue(), {
                self.delegate?.didGetcountry_ip_based(self.country_ip_based!)
            })
        }
        
        if let lat_test = res["lat"] as? String {
            self.lat_ip_based = lat_test.stringByReplacingOccurrencesOfString(" ", withString: "", options: NSStringCompareOptions(), range: nil)
            print("Lat_ip_based: \(self.lat_ip_based!)")
            dispatch_async(dispatch_get_main_queue(), {
                self.delegate?.didGetlat_ip_based(self.lat_ip_based!)
            })
        }else{
            let index: Double = res["lat"]!.doubleValue
            self.lat_ip_based = String(format:"%f", index)
            print("Lat_ip_based: \(self.lat_ip_based!)")
        }
        
        if let lon_test = res["lon"] as? String {
            self.lon_ip_based = lon_test.stringByReplacingOccurrencesOfString(" ", withString: "", options: NSStringCompareOptions(), range: nil)
            print("Lon_ip_based: \(self.lon_ip_based!)")
            dispatch_async(dispatch_get_main_queue(), {
                self.delegate?.didGetlon_ip_based(self.lon_ip_based!)
            })
        }else{
            let index: Double = res["lon"]!.doubleValue
            self.lon_ip_based = String(format:"%f", index)
            print("Lon_ip_based: \(self.lon_ip_based!)")

        }
        self.coordinates_ip_based = (self.lat_ip_based)!+","+(self.lon_ip_based)!;
        self.coordinates_ip_based = self.coordinates_ip_based!.stringByReplacingOccurrencesOfString(" ", withString: "", options: NSStringCompareOptions(), range: nil)
        self.coordinates_ip_based = self.coordinates_ip_based!.stringByReplacingOccurrencesOfString("+", withString: "", options: NSStringCompareOptions(), range: nil)
        print("Coordinates_ip_based: \(self.coordinates_ip_based!)")
        
    }
    private func failHandler(err: NSError) {
        
    }
    
    
    
//    private func decodeLocation(array: [AnyObject]!, err: NSError!) -> Void {
//        if err == nil {
//            let mark = array.first as! CLPlacemark
//            country = mark.ISOcountryCode
//            city = mark.subAdministrativeArea!.stringByReplacingOccurrencesOfString(" ", withString: "", options: NSStringCompareOptions(), range: nil)
//            region = mark.administrativeArea
//            coordinates = "\(mark.location!.coordinate.latitude),\(mark.location!.coordinate.longitude)"
//            print("Country: \(country!)")
//            print("City: \(city!)")
//            print("Region: \(region!)")
//            print("Loc: \(coordinates!)")
//            delegate?.didGetLocation("\(coordinates!)")
//        }
//    }
    

    private func decodeLocation(array:[CLPlacemark]?, err:NSError?) {
        if err == nil {
            let mark = array!.first as CLPlacemark!
//            let mark = array.[0] as CLPlacemark

//            print("========");
//            print(mark);
//            print("========");
            
            country = mark.ISOcountryCode
            city = mark.subAdministrativeArea!.stringByReplacingOccurrencesOfString(" ", withString: "", options: NSStringCompareOptions(), range: nil)
            region = mark.administrativeArea
            coordinates = "\(mark.location!.coordinate.latitude),\(mark.location!.coordinate.longitude)"
            print("Country: \(country!)")
            print("City: \(city!)")
            print("Region: \(region!)")
            print("Loc: \(coordinates!)")
            delegate?.didGetLocation("\(coordinates!)")
        }
    }
    
    
    // Delegates
    func locationManager(manager: CLLocationManager, didChangeAuthorizationStatus status: CLAuthorizationStatus) {
        if status == CLAuthorizationStatus.AuthorizedAlways || status == CLAuthorizationStatus.AuthorizedWhenInUse {
            locationManager.startUpdatingLocation()
        }
    }
    func locationManager(manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        //An array of CLLocation objects. The most recent location update is at the end of the array.
        
        dispatch_once(&geoCoderToken, {
            self.currentLocation = locations.last as CLLocation!
//            print("========");
//            print(self.currentLocation);
//            print("========");
            self.geoCoder.reverseGeocodeLocation(self.currentLocation!, completionHandler: self.decodeLocation)
        })
        
    }
}
