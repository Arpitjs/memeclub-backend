let Post = require('../models/postModel')
let catchAsync = require('../utils/catchAsync')
let joi = require('@hapi/joi')

exports.createPost = catchAsync(async (req, res, next) => {
    let schema = joi.object().keys({
        post: joi.string().max(15).required()
    })
    let { error } = schema.validate(req.body)
    if(error && error.details) {
        return next({msg: error.details[0].message})
    }
    let post = await Post.create({
        user: req.user,
        username: req.user.username,
        post: req.body.post
    })
    res.status(200).json({
        msg: 'Post Created!',
        post
    })
})

exports.getPosts = async (req, res) => {
    let all = await Post.find()
    res.json(all)
}