//
//  VideoTableViewController.swift
//  Demo
//
//  Created by to0 on 2/7/15.
//  Copyright (c) 2015 to0. All rights reserved.
//

import UIKit

class VideoTableViewController: UITableViewController, UISearchBarDelegate, VideoListProtocol {
    
    @IBOutlet var videoSearchBar: UISearchBar!
    var videoDataSource = VideoTableDataSource()

    override func viewDidLoad() {
        super.viewDidLoad()
        self.tableView.dataSource = videoDataSource
        self.tableView.delegate = videoDataSource
        videoSearchBar.delegate = self
        self.videoDataSource.videoList.delegate = self

        self.videoDataSource.videoList.requestDataForRefresh("Grumpy cat")

        // Uncomment the following line to preserve selection between presentations
        // self.clearsSelectionOnViewWillAppear = false

        // Uncomment the following line to display an Edit button in the navigation bar for this view controller.
        // self.navigationItem.rightBarButtonItem = self.editButtonItem()
    }
    
    override func viewWillAppear(animated: Bool) {
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }

    
    func didReloadVideoData() {
        dispatch_async(dispatch_get_main_queue(), {
            self.tableView.reloadData()
        })
    }
    func searchBar(searchBar: UISearchBar, textDidChange searchText: String) {
        
    }
    
    func searchBarSearchButtonClicked(searchBar: UISearchBar) {
        let query = searchBar.text
        self.videoDataSource.videoList.requestDataForRefresh(query)
        searchBar.resignFirstResponder()
    }
    
    // MARK: - Navigation

    // In a storyboard-based application, you will often want to do a little preparation before navigation
    override func prepareForSegue(segue: UIStoryboardSegue, sender: AnyObject?) {
        let dest = segue.destinationViewController as! SingleVideoViewController
        let cell = sender as! UITableViewCell
        let row = self.tableView.indexPathForCell(cell)!.row
        cell.selected = false
        dest.hidesBottomBarWhenPushed = true
        dest.videoId = self.videoDataSource.videoList.videoIdOfIndex(row)

        // Get the new view controller using [segue destinationViewController].
        // Pass the selected object to the new view controller.
    }
    

}
