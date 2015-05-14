//
//  MainTabViewController.swift
//  YouSlow
//
//  Created by to0 on 4/24/15.
//  Copyright (c) 2015 to0. All rights reserved.
//

import UIKit

class MainTabViewController: UITabBarController {

    override func viewDidLoad() {
        super.viewDidLoad()
        let videoListVC = self.viewControllers![0] as! UIViewController;
//        let reportVC = self.viewControllers![0] as! UIViewController;
        videoListVC.tabBarItem = UITabBarItem(title: "Video List", image: UIImage(named: "first"), selectedImage: UIImage(named: "first"))
//
//        reportVC.tabBarItem = UITabBarItem(title: "Report", image: UIImage(named: "second"), selectedImage: UIImage(named: "second"))
        // Do any additional setup after loading the view.
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    
    /*
    // MARK: - Navigation

    // In a storyboard-based application, you will often want to do a little preparation before navigation
    override func prepareForSegue(segue: UIStoryboardSegue, sender: AnyObject?) {
        // Get the new view controller using segue.destinationViewController.
        // Pass the selected object to the new view controller.
    }
    */

}
