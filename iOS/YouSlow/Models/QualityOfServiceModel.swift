//
//  QualityOfServiceModel.swift
//  YouSlow
//
//  Created by to0 on 3/8/15.
//  Copyright (c) 2015 to0. All rights reserved.
//

import Foundation

protocol QualityDelegate {
    func didEndBufferings(bufferings: String)
}

class QualityOfService {
    var numOfBufferings = 0
    var durationOfBufferings = 0
    var resolutionChanges = 0
    var delegate: QualityDelegate?

    private var bufferingTimes = [Int]()
    private var bufferingIntervals = [Int]()
    private var lastBuffering = 0

    private var qualityTimes = [Int]()
    private var qualityStrings = [String]()
    private var lastResolutionTime = -1
    
    var timeLength = ""
    // in milliseconds
    var initialBuffering = 0
    var abandonment = ""
    var loadedFraction = ""
    var availableQualities = ""
    
    init() {
//        qualityTimes.append(0)
//        qualityStrings.append("default")
//        lastResolutionTime = 0
    }
    
    var bufferingsWithTime: String {
        var description = ""
        for i in 0 ..< bufferingTimes.count {
            description += "\(bufferingTimes[i])?\(bufferingIntervals[i]):"
        }
        return description
    }
    var timesOfResolutionChange: Int {
        return qualityTimes.count
    }
    var requestedResolutions: String {
        var res = ""
        for i in 0 ..< qualityStrings.count {
            res += "\(qualityStrings[i]):"
        }
        return res
    }
    var requestedResolutionsWithTime: String {
        var res = ""
        for i in 0 ..< qualityTimes.count {
            res += "\(qualityTimes[i])?\(qualityStrings[i]):"
        }
        return res
    }
    func changeToQuality(time: Int, quality: String) {
        if lastResolutionTime >= time {
            return
        }
        qualityTimes.append(time)
        qualityStrings.append(quality)
        lastResolutionTime = time
        resolutionChanges += 1
    }
    
    func startBuffering(startTime: Int) {
        lastBuffering = startTime
    }
    func endBuffering(endTime: Int) {
        let interval = endTime - lastBuffering
        if interval <= 0 {
            return
        }
        bufferingTimes.append(lastBuffering)
        bufferingIntervals.append(interval)
        numOfBufferings += 1
        delegate?.didEndBufferings("\(numOfBufferings)")

        durationOfBufferings += interval
    }
}