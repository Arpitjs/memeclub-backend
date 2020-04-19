let catchAsync = require('../utils/catchAsync')
let User = require('../models/userModel')

exports.getAllUsers = catchAsync(async(req, res, next) => {
    let users = await User.find({})
    .populate('posts.postId')
    res.status(200).json(users)
})

exports.follow = catchAsync(async(req, res, next) => {
    User.findByIdAndUpdate({_id: req.user._id,
    "following.userFollowed": { $ne: req.body._id }}, {
        $push: {
            following: {
                userFollowed: req.body._id
            }
        }
    }).then(async () => {
        await User.findByIdAndUpdate({_id: req.body._id, 
            "followers.follower": { $ne: req.user._id } }, {
                $push: {
                    followers: {
                        follower: req.user._id
                    },
                    notifications: {
                        senderId: req.user._id,
                        message: `${req.user.username} is now following you.`
                    }
                }
            })
            res.status(200).json({ msg: 'you have followed the user'})
    })
})

exports.Unfollow = catchAsync(async(req, res, next) => {
    console.log(req.body)
    User.findByIdAndUpdate({_id: req.user._id}, {
        $pull: {
            following: {
                userFollowed: req.body.userFollowed._id
            }
        }
    }).then(async () => {
        await User.findByIdAndUpdate({_id: req.body.userFollowed._id }, {
                $pull: {
                    followers: {
                        follower: req.user._id
                    }
                }
            })
            res.status(200).json({ msg: 'you have unfollowed the user'})
    })
})

exports.getUserByName = catchAsync(async(req, res, next) => {
    let users = await User.findOne({username: req.params.username})
    res.status(200).json(users)
})

exports.getUser = catchAsync(async(req, res, next) => {
   let user = await User.findById(req.params.id).populate('following.userFollowed').populate('followers.follower')
        res.status(200).json(user)
})

exports.getNotify = catchAsync(async(req, res, next) => {
   
 })