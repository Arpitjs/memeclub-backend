let catchAsync = require('../utils/catchAsync')
let cloudinary = require('cloudinary')
let User = require('../models/userModel')
const fetch = require("node-fetch")
let sharp = require('sharp')
let request = require('request')
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
})
exports.uploadImage = catchAsync(async (req, res, next) => {
    cloudinary.v2.uploader.upload_large(req.body.img, {
        resource_type: "image", chunk_size: 6000000
    })

        .then(async res => {
            await User.updateOne({
                _id: req.user._id
            }, {
                $push: {
                    images: {
                        imgId: res.public_id,
                        imgVersion: res.version
                    }
                }
            })
        })
        .then(() => res.status(200).json({ msg: 'image uploaded. ' }))
})

exports.changePFP = catchAsync(async (req, res, next) => {
    await User.updateOne({ _id: req.user._id }, {
        picVersion: req.body.img.imgVersion,
        picId: req.body.img.imgId
    })
    res.status(200).json({ msg: 'set as pfp.' })
})

exports.apiMeme = catchAsync(async (req, res, next) => {
    let apiImgs = []
    let url = 'https://api.imgflip.com/get_memes'
    let baseUrl = process.env.ENDPOINT
    let data = await fetch(new URL(url, baseUrl, {
        method: 'GET',
        encoding: null
    }))
    await data.json().then(response => {
        response.data.memes.forEach(m => {
            apiImgs.push(m.url)
            // sharp(m.url)
            // .rotate()
            // .resize(200)
            // .jpeg({ mozjpeg: true })
            // .toBuffer()
            // .then(data => console.log(data))
            // .catch(err => console.log(err));
        })
          res.status(200).json({ apiImgs })
})
})

