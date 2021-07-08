let express = require('express')
let router = new express.Router()
let imageController = require('../controllers/imageController')
let authController = require('../controllers/authController')

router.post('/upload-image',authController.protect, imageController.uploadImage)
router.post('/upload-PFP',authController.protect, imageController.changePFP)
router.get('/apiMeme', imageController.apiMeme)

module.exports = router