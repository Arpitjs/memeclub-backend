let catchAsync = require('../utils/catchAsync')
let User = require('../models/userModel')

exports.getAllUsers = catchAsync(async(req, res, next) => {
    let users = await User.find({})
    .populate('posts.postId')
    res.status(200).json(users)
})