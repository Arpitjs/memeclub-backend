let Post = require('../models/postModel')
let joi = require('@hapi/joi')
let catchAsync = require('../utils/catchAsync')
let User = require('../models/userModel')

exports.createPost = catchAsync(async (req, res, next) => {
    let schema = joi.object().keys({
        post: joi.string().max(150).required()
    })
    let { error } = schema.validate(req.body)
    if (error && error.details) {
        return next({ msg: error.details[0].message })
    }
    Post.create({
        user: req.user,
        username: req.user.username,
        post: req.body.post
    })
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
})

exports.getPosts = async (req, res) => {
    let all = await Post.find()
        .populate('user')
        .sort({ created: -1 })
    res.status(200).json(all)
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
    })
    res.status(200).json({ message: 'the post is liked' })
})

exports.addComment = catchAsync(async (req, res, next) => {
    console.log(req.body)
    await Post.updateOne({ _id: req.params.postId }, {
        $push: {
            comments: {
                userId: req.user._id,
                username: req.user.username,
                comment: req.body.comment
            }
        }
    })
    res.status(200).json({ message: 'comment added.' })
})

exports.getOnePost = catchAsync(async (req, res, next) => {
    let postId = req.params.postId
    let post = await Post.findOne({ _id: postId })
        .populate('user').populate('comments.userId')
    res.status(200).json(post)
})

