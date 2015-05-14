//
//  VideoModel.swift
//  Demo
//
//  Created by to0 on 2/7/15.
//  Copyright (c) 2015 to0. All rights reserved.
//

import Foundation

protocol VideoListProtocol {
    func didReloadVideoData()
//    func didGetCurrentISP()
}

private class VideoItem  {
    var thumbnail = ""
    var videoId = ""
    var title = ""
    var description = ""
    init(thumbnail th: String, videoId id: String, title ti: String, description de: String) {
        thumbnail = th
        videoId = id
        title = ti
        description = de
    }
}

class VideoList {
    private var videos = [VideoItem]()
    var delegate: VideoListProtocol?
    
    init() {
    }
    
    func isValidIndex(index: Int) -> Bool {
        return index >= 0 && index < videos.count
    }
    func numberOfVideos() -> Int {
        return videos.count
    }
    
    func videoTitleOfIndex(index: Int) -> String {
        if !isValidIndex(index) {
            return ""
        }
        let v = videos[index]
        return v.title
    }
    
    func videoIdOfIndex(index: Int) -> String {
        if !isValidIndex(index) {
            return ""
        }
        let v = videos[index]
        return v.videoId
    }
    
    func videoThumbnailOfIndex(index: Int) -> String {
        if !isValidIndex(index) {
            return ""
        }
        let v = videos[index]
        return v.thumbnail
    }
    
    func videoDescriptionOfIndex(index: Int) -> String {
        if !isValidIndex(index) {
            return ""
        }
        let v = videos[index]
        return v.description
    }
    
    func reloadVideosFromJson(jsonObject: NSDictionary) {
        videos = []
        if let rawItems = jsonObject["items"] as? [NSDictionary] {
            for rawItem: NSDictionary in rawItems {
                let thumbnail = (((rawItem["snippet"] as? NSDictionary)?["thumbnails"] as? NSDictionary)?["medium"] as? NSDictionary)?["url"] as? String
                let id = (rawItem["id"] as? NSDictionary)?["videoId"] as? String
                let title = (rawItem["snippet"] as? NSDictionary)?["title"] as? String
                let description = (rawItem["snippet"] as? NSDictionary)?["description"] as? String
                if thumbnail != nil && id != nil && title != nil && description != nil {
                    videos.append(VideoItem(thumbnail: thumbnail!, videoId: id!, title: title!, description: description!))
                }
            }
        }
    }
    
    func requestDataForRefresh(query: String) {
        let api =  DataApi.sharedInstance
        api.getList(query, success: {(data: NSDictionary) -> Void in
            self.reloadVideosFromJson(data)
            self.delegate?.didReloadVideoData()
        })
    }
//    func requestCurrentISP() {
//            }
}
