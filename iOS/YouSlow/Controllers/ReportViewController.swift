//
//  ReportViewController.swift
//  YouSlow
//
//  Created by to0 on 4/21/15.
//  Copyright (c) 2015 to0. All rights reserved.
//

import UIKit

class ReportViewController: UIViewController {
    
    
    var videoQualityLabel: UILabel?
    var barChart: PNBarChart?
    var pieChart: PNPieChart?
    let columbiaItems = [
        PNPieChartDataItem(value: 30, color: UIColor(red: 77.0 / 255.0, green: 216.0 / 255.0, blue: 122.0 / 255.0, alpha: 1),description: "small"),
        PNPieChartDataItem(value: 10, color: UIColor(red: 77.0 / 255.0, green:196.0 / 255.0, blue:122.0 / 255.0, alpha: 1), description: "medium"),
        PNPieChartDataItem(value: 20, color: UIColor(red: 77.0 / 255.0, green:176.0 / 255.0, blue:122.0 / 255.0, alpha: 1),description: "large"),
        PNPieChartDataItem(value: 50, color: UIColor(red: 77.0 / 255.0, green:186.0 / 255.0, blue:122.0 / 255.0, alpha:1.0),description: "hd720")
    ]
    let twcItems = [
        PNPieChartDataItem(value: 30, color: UIColor(red: 77.0 / 255.0, green: 216.0 / 255.0, blue: 122.0 / 255.0, alpha: 1), description: "small"),
        PNPieChartDataItem(value: 10, color: UIColor(red: 77.0 / 255.0, green:196.0 / 255.0, blue:122.0 / 255.0, alpha: 1), description: "medium"),
        PNPieChartDataItem(value: 20, color: UIColor(red: 77.0 / 255.0, green:176.0 / 255.0, blue:122.0 / 255.0, alpha: 1),description: "large"),
        PNPieChartDataItem(value: 30, color: UIColor(red: 77.0 / 255.0, green:186.0 / 255.0, blue:122.0 / 255.0, alpha:1.0),description: "hd720")

    ]
    let g4Items = [
        PNPieChartDataItem(value: 50, color: UIColor(red: 77.0 / 255.0, green: 216.0 / 255.0, blue: 122.0 / 255.0, alpha: 1), description: "small"),
        PNPieChartDataItem(value: 30, color: UIColor(red: 77.0 / 255.0, green:196.0 / 255.0, blue:122.0 / 255.0, alpha: 1), description: "medium"),
        PNPieChartDataItem(value: 20, color: UIColor(red: 77.0 / 255.0, green:176.0 / 255.0, blue:122.0 / 255.0, alpha: 1),description: "large"),
        PNPieChartDataItem(value: 20, color: UIColor(red: 77.0 / 255.0, green:186.0 / 255.0, blue:122.0 / 255.0, alpha:1.0),description: "hd720")
        
    ]


    override func viewDidLoad() {
        super.viewDidLoad()
        let width = self.view.frame.width
        let height = self.view.frame.height
        let pieHeight = (height - 240) / 2
        let pieY = height - pieHeight - 60
                pieChart = PNPieChart(frame: CGRect(x: (width - pieHeight)/2, y: pieY, width: pieHeight, height: pieHeight), items: columbiaItems)
        barChart = PNBarChart(frame: CGRect(x: 10, y: 120, width: width - 20, height: pieHeight))
        self.tabBarItem = UITabBarItem(title: "Report", image: UIImage(named: "second"), selectedImage: UIImage(named: "second"))
        videoQualityLabel = UILabel(frame: CGRect(x: 10, y: pieY - 40, width: width - 20, height: 20))
        videoQualityLabel?.text = "Played Bitrates (%)"
        videoQualityLabel?.textAlignment = NSTextAlignment.Center
        
        
        pieChart!.descriptionTextColor = UIColor.whiteColor()
        pieChart!.descriptionTextFont = UIFont.systemFontOfSize(13)
        
        barChart!.yLabelFormatter = {
            (yValue: CGFloat) -> String! in
            var yValuePased: CGFloat = yValue
            
            var labelText = NSString(format: "%1.f", yValuePased)
            return labelText as String
        }
        
        barChart!.xLabels = ["4/22", "4/23", "4/24", "4/25", "4/26", "4/27", "4/28"]
        barChart!.yValues = [1, 24, 13, 25, 10, 15, 8]
        barChart!.strokeColor = UIColor(red: 77.0 / 255.0, green:186.0 / 255.0, blue:122.0 / 255.0, alpha: 1)
        self.view.addSubview(barChart!)
        self.view.addSubview(pieChart!)
        self.view.addSubview(videoQualityLabel!)
    }
    @IBAction func scopeChanged(sender: UISegmentedControl) {
        if sender.selectedSegmentIndex == 0 {
            barChart?.yValues = [1, 24, 13, 25, 10, 15, 8]
            barChart?.xLabels = ["4/22", "4/23", "4/24", "4/25", "4/26", "4/27", "4/28"]
            pieChart?.items = columbiaItems
            pieChart?.strokeChart()
            barChart?.strokeChart()
        }
        else if sender.selectedSegmentIndex == 1{
            barChart?.yValues = [10, 15, 13, 25, 1, 5, 9]
            barChart?.xLabels = ["4/22", "4/23", "4/24", "4/25", "4/26", "4/27", "4/28"]
            pieChart?.items = twcItems
            barChart?.strokeChart()
            pieChart?.strokeChart()
        }
        else {
            barChart?.yValues = [10, 15, 13, 25, 1, 5, 9]
            barChart?.xLabels = ["4/22", "4/23", "4/24", "4/25", "4/26", "4/27", "4/28"]
            pieChart?.items = g4Items
            barChart?.strokeChart()
            pieChart?.strokeChart()
        }
    }
    
    override func viewWillAppear(animated: Bool) {
        barChart!.strokeChart()
        pieChart!.strokeChart()
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
