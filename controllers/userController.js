let catchAsync = require('../utils/catchAsync')
let User = require('../models/userModel')

exports.getAllUsers = catchAsync(async (req, res, next) => {
    let users = await User.find({})
        .populate('posts.postId')
    res.status(200).json(users)
})

exports.follow = catchAsync(async (req, res, next) => {
    User.findByIdAndUpdate({
        _id: req.user._id,
        "following.userFollowed": { $ne: req.body.userId }
    }, {
        $push: {
            following: {
                userFollowed: req.body.userId
            }
        }
    }).then(async () => {
        await User.findByIdAndUpdate({
            _id: req.body.userId,
            "followers.follower": { $ne: req.user._id }
        }, {
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
        res.status(200).json({ msg: 'you have followed the user' })
    })
})

exports.Unfollow = catchAsync(async (req, res, next) => {
    User.findByIdAndUpdate({ _id: req.user._id }, {
        $pull: {
            following: {
                userFollowed: req.body.userId
            }
        }
    }).then(async () => {
        await User.findByIdAndUpdate({ _id: req.body.userId }, {
            $pull: {
                followers: {
                    follower: req.user._id
                }
            }
        })
        res.status(200).json({ msg: 'you have unfollowed the user' })
    })
})

exports.getUser = catchAsync(async (req, res, next) => {
    let user = await User.findById(req.params.id).populate('following.userFollowed').populate('followers.follower')
    res.status(200).json(user)
})

exports.getUserByName = catchAsync(async (req, res, next) => {
    let user = await User.findOne({username: req.params.username}).populate('following.userFollowed').populate('followers.follower')
    res.status(200).json(user)
})

exports.markNotification = catchAsync(async (req, res, next) => {
    if (!req.body.deleteVal) {
        await User.updateOne({ _id: req.user._id, "notifications._id": req.params.id }, {
            $set: {
                'notifications.$.read': true
            }
        })
        res.status(200).json({ msg: 'message marked as read.' })
    } else {
        await User.update({ _id: req.user._id, "notifications._id": req.params.id }, {
            $pull: {
                notifications: { _id: req.params.id }
            }
        })
        res.status(200).json({ msg: 'notification deleted' })
    }
})

exports.markAllNotifications = catchAsync(async (req, res, next) => {
    await User.update({ _id: req.user._id }, {
        $set: {
            'notifications.$[elem].read': true
        }
    }, { arrayFilters: [{ 'elem.read': false }], multi: true }
    )
    res.status(200).json({ msg: 'all messages marked as read.' })
})
