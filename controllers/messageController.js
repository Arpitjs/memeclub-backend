let catchAsync = require('../utils/catchAsync')

exports.sendMessage = catchAsync(async(req, res, next) => {
    console.log(req.body)
})