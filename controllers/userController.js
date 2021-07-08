let catchAsync = require('../utils/catchAsync')
let User = require('../models/userModel')
let JOI = require('@hapi/joi')
let bcrypt = require('bcryptjs')

exports.getAllUsers = catchAsync(async (req, res, next) => {
    let users = await User.find({})
        .populate('posts.postId')
        .populate('notifications.senderId')
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
    let user = await User.findById(req.params.id)
        .populate('following.userFollowed')
        .populate('followers.follower')
        .populate('chatList.recieverId')
        .populate('chatList.messageId')
        .populate('notifications.senderId')
        .populate('posts.postId')
    res.status(200).json(user)
})

exports.getUserByName = catchAsync(async (req, res, next) => {
    let user = await User.findOne({ username: req.params.username })
        .populate('following.userFollowed')
        .populate('followers.follower')
        .populate('chatList.recieverId')
        .populate('notifications.senderId')
        .populate('chatList. messageId')
        .populate('posts.postId')
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

exports.viewProfile = catchAsync(async (req, res, next) => {
    let date = moment().format('YYYY-MM-DD')
    await User.update({
        _id: req.body.id,
        // 'notifications.senderId': { $ne: req.user._id }
        'notifications.date': { $ne: [date, ''] }
    }, {
        $push: {
            notifications: {
                senderId: req.user._id,
                message: `${req.user.username} viewed your profile`,
                created: new Date(),
                date: date,
                viewProfile: true
            }
        }
    })
        .then(() => res.status(200).json({ msg: 'notification sent.' }))
})

exports.changePassword =  catchAsync(async (req, res, next) => {
    console.log(req.body)
    let schema = JOI.object().keys({
        cpassword: JOI.string().required(),
        newpassword: JOI.string().min(5).required(),
        confirmpassword: JOI.string().min(5).optional()
    })

    let { error, value } = schema.validate(req.body)
    if(error && error.details) {
        return next({ msg: error.details[0].message })
    }
    let user = await User.findById(req.user._id)
    return User.verifyPassword(value.cpassword, user.password)
    .then(async result => {
        if(!result) return res.status(500).json({ message: 'current password is invalid.'})
        let newpassword = await User.encrypt(req.body.newpassword)
        await User.updateOne({
            _id: req.user._id
        }, {
            password: newpassword
        }).then(() =>  res.status(200).json({ msg: 'password changed successfully! '}))
    })
})
