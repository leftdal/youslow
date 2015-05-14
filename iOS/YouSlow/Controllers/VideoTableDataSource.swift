//
//  VideoTableDataSource.swift
//  Demo
//
//  Created by to0 on 2/12/15.
//  Copyright (c) 2015 to0. All rights reserved.
//

import UIKit

class VideoTableDataSource: NSObject, UITableViewDataSource, UITableViewDelegate  {
    
    var videoList = VideoList()
    
    func numberOfSectionsInTableView(tableView: UITableView) -> Int {
        // #warning Potentially incomplete method implementation.
        // Return the number of sections.
        return 1
    }
    
    func tableView(tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        // #warning Incomplete method implementation.
        // Return the number of rows in the section.
        return videoList.numberOfVideos()
    }
    
    func tableView(tableView: UITableView, heightForRowAtIndexPath indexPath: NSIndexPath) -> CGFloat {
        return 120;
    }
    
    func tableView(tableView: UITableView, cellForRowAtIndexPath indexPath: NSIndexPath) -> UITableViewCell {
        let cell = tableView.dequeueReusableCellWithIdentifier("VideoListCell", forIndexPath: indexPath) as! VideoItemViewCell
        let row = indexPath.row
        cell.titleLabel?.text = videoList.videoTitleOfIndex(row)
        cell.detailLabel?.text = videoList.videoDescriptionOfIndex(row)
        
        cell.thumbnailView?.contentMode = UIViewContentMode.ScaleAspectFill
//        cell.thumbnailView?.image = UIImage(named: "grey")
        
        let url = NSURL(string: videoList.videoThumbnailOfIndex(row))
        let request: NSURLRequest = NSURLRequest(URL: url!)
        let urlConnection: NSURLConnection = NSURLConnection(request: request, delegate: self)!
        NSURLConnection.sendAsynchronousRequest(request, queue: NSOperationQueue.mainQueue(), completionHandler: {(response: NSURLResponse!, data: NSData!, error: NSError!) -> Void in
            if error == nil {
                let img: UIImage? = UIImage(data: data)
                if img != nil {
                    dispatch_async(dispatch_get_main_queue(), {
                        cell.thumbnailView?.image = img!
                    })
                }
            }
        })
        return cell
    }
}