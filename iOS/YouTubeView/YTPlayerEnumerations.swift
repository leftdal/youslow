//
//  YTPlayerEnumerations.swift
//  Demo
//
//  Created by to0 on 2/1/15.
//  Copyright (c) 2015 to0. All rights reserved.
//

import Foundation

enum YTPlayerState: String {
    case Unstarted = "-1"
    case Ended = "0"
    case Playing = "1"
    case Paused = "2"
    case Buffering = "3"
    case Cued = "5"
    case Unknown = "unknown"
}

enum YTPlayerQuality: String {
    case Small = "small"
    case Medium = "medium"
    case Large = "large"
    case HD720 = "hd720"
    case HD1080 = "hd1080"
    case HighRes = "highres"
    case Auto = "auto"
    case Default = "default"
    case Unknown = "unknown"
}

enum YTPlayerError: String {
    case InvalidParam = "2"
    case HTML5 = "5"
    case VideoNotFound = "100"
    case NotEmbeddable = "101"
    case CannotFindVideo = "105"
}

enum YTPlayerCallback: String {
    case OnReady = "onReady"
    case OnStateChange = "onStateChange"
    case OnPlaybackQualityChange = "onPlaybackQualityChange"
    case OnError = "onError"
    case OnYouTubeIframeAPIReady = "onYouTubeIframeAPIReady"

}