let Post = require('../models/postModel')
let joi = require('@hapi/joi')
let catchAsync = require('../utils/catchAsync')
let User = require('../models/userModel')
let cloudinary = require('cloudinary')
const { populate } = require('../models/postModel')

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
})

exports.createPost = catchAsync(async (req, res, next) => {
    let schema = joi.object().keys({
        post: joi.string().max(150).required()
    })
    let body = {
        post: req.body.post
    }
    let { error } = schema.validate(body)
    if (error && error.details) {
        return next({ msg: error.details[0].message })
    }
    let body2 = {
        user: req.user._id,
        username: req.user.username,
        post: req.body.post
    }
    if (req.body.post && !req.body.image) {
        Post.create(body2)
            .then(async post => {
                await User.update({ _id: req.user._id },
                    {
                        $push:
                        {
                            posts: {
                                postId: post._id,
                                post: req.body.post
                            }
                        }
                    })
                res.status(200).json({ message: 'Post Created.', post })
            })
    }
    if (req.body.post && req.body.image) {
        let iType = Object.values(req.body.image[5])[0]
        if (iType !== 'i') return next({ msg: 'file is not of appropriate type' })
        cloudinary.v2.uploader.upload(req.body.image)
            .then(response => {
                let reqBody = {
                    user: req.user._id,
                    username: req.user.username,
                    post: req.body.post,
                    imgId: response.public_id,
                    imgVersion: response.version
                }
                Post.create(reqBody)
                    .then(async post => {
                        await User.updateOne({ _id: req.user._id },
                            {
                                $push:
                                {
                                    posts: {
                                        postId: post._id,
                                        post: req.body.post
                                    }
                                }
                            })
                        res.status(200).json({ message: 'Post Created with Image.', post })
                    })
            })
    }
})

exports.getPosts = async (req, res) => {

    let all = await Post.find()
        .populate('user')
        .sort({ created: -1 })
    let topPosts = await Post.find({ totalLikes: { $gte: 2 } })
        .populate('user')
    arr = []
    topPosts.forEach(post => {
        points = {}
        post.comments.length ? points.comment = 3 * post.comments.length : points.comment = 0
        post.likes.length ? points.likes = post.likes.length : ''

        //    post.created.getTime() > Ago().getTime() ? points.date = 1 : points.date = -4

        function calcPointsForDates(createdTime) {

            let today = new Date()
            let Y = today.getFullYear()
            let M = today.getMonth()
            let T = today.getDate()

            let weekAgo = () => new Date(Y, M,  T- 7).getTime()
            let monthAgo = days => new Date(Y, M, T-days).getTime()

            if (createdTime > weekAgo() && monthAgo(30) && monthAgo(90)) {
                points.date = 2
            } else if(createdTime < monthAgo(180)) {
                points.date = -5
            } else if (createdTime < monthAgo(90)) {
                points.date = -4
            } else if (createdTime < monthAgo(60)) {
                points.date = -3
            } else if (createdTime < monthAgo(30)) {
                points.date = -2
            } else if (createdTime < weekAgo()) {
                points.date = -1
            }
        }
        calcPointsForDates(post.created.getTime())

        let final = {}
        final.post = post
        final.score = points.comment + points.likes + points.date
        arr.push(final)
    })

    arr.sort((a, b) => {
        if (a.score > b.score) {
            return -1
        } else if (b.score > a.score) {
            return 1
        } else {
            return 0
        }
    })
    console.log('arey sort', arr)
    let user = await User.findOne({ _id: req.user._id })
    if (user.country === '' || user.country === null) {
        request('https://geolocation-db.com/json', { json: true }, async (err, response) => {
            if (err) console.log(err)
            console.log(response)
            await User.updateOne({ _id: req.user._id }, {
                country: response.body.country_name
            })
        })
    }
    res.status(200).json({ all, arr })
}

exports.addLike = catchAsync(async (req, res, next) => {
    let postId = req.body._id
    await Post.updateOne({ _id: postId, 'likes.username': { $ne: req.user.username } }, {
        $push: {
            likes: {
                username: req.user.username
            }
        },
        $inc: { totalLikes: 1 }
    }).then(async () => {
        await User.updateOne({ _id: req.body.user._id, 'posts.postId': postId }, {
            $push: {
                notifications: {
                    senderId: req.user._id,
                    message: `${req.user.username} liked your post.`
                }
            }
        })
    })
    res.status(200).json({ message: 'the post is liked' })
})

exports.addComment = catchAsync(async (req, res, next) => {
    let currentPost = await Post.findById(req.params.postId)
    await Post.updateOne({ _id: req.params.postId }, {
        $push: {
            comments: {
                userId: req.user._id,
                username: req.user.username,
                comment: req.body.comment
            }
        }
    }).then(async () => {
        await User.updateOne({ _id: currentPost.user, 'posts.postId': req.params.postId }, {
            $push: {
                notifications: {
                    senderId: req.user._id,
                    message: `${req.user.username} commented on your post.`
                }
            }
        })

    })
    res.status(200).json({ message: 'comment added.' })
})

exports.getOnePost = catchAsync(async (req, res, next) => {
    let postId = req.params.postId
    let post = await Post.findOne({ _id: postId })
    res.status(200).json(post)
})

exports.editPost = catchAsync(async (req, res, next) => {
    let body = {
        post: req.body.post,
        created: new Date()
    }
    if (req.body.post && !req.body.image) {
        await Post.findOneAndUpdate({ _id: req.body.PostId }, body, { new: true })
        res.status(200).json({ message: 'Post Updated.', post })
    }

    if (req.body.post && req.body.image) {
        let iType = Object.values(req.body.image[5])[0]
        if (iType !== 'i') return next({ msg: 'file is not of appropriate type' })
        cloudinary.uploader.upload(req.body.image)
            .then(async response => {
                let reqBody = {
                    user: req.user._id,
                    username: req.user.username,
                    post: req.body.post,
                    imgId: response.public_id,
                    imgVersion: response.version
                }
                let post = await Post.findByIdAndUpdate(req.body.PostId, reqBody, { new: true })
                res.status(200).json({ message: 'Post Updated with Image.', post })
            })
    }
})

exports.editPostUser = catchAsync(async (req, res, next) => {
    console.log(req.body)
    res.status(200).json({ msg: 'fuck' })
    //    User.findOneAndUpdate({ _id: req.body.id }, {
    //        $set: {
    //            posts: {
    //                post: req.body.post
    //            }
    //        }
    //    })
    //    .then(post => res.status(200).json(post))
})

exports.deletePost = catchAsync(async (req, res, next) => {
    let { id } = req.params
    let result = await Post.findByIdAndDelete(id)
    if (!result) return res.status(404).json({ msg: 'couldnt delete post.' })
    await User.updateOne({ _id: req.user._id }, {
        $pull: {
            posts: {
                postId: id
            }
        }
    })
    return res.status(200).json({ msg: 'post deleted.' })
})