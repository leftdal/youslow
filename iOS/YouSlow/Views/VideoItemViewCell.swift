//
//  VideoItemViewCell.swift
//  YouSlow
//
//  Created by to0 on 4/24/15.
//  Copyright (c) 2015 to0. All rights reserved.
//

import UIKit

class VideoItemViewCell: UITableViewCell {

    @IBOutlet var thumbnailView: UIImageView!
    @IBOutlet var titleLabel: UILabel!
    @IBOutlet var detailLabel: UILabel!
    override func awakeFromNib() {
        super.awakeFromNib()
        // Initialization code
    }

    override func setSelected(selected: Bool, animated: Bool) {
        super.setSelected(selected, animated: animated)

        // Configure the view for the selected state
    }

}
