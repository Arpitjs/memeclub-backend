let express = require('express')
let router = new express.Router()
let postController = require('../controllers/postController')
let authController = require('../controllers/authController')

router.post('/add-post',authController.protect, postController.createPost)
router.get('/get-posts', authController.protect, postController.getPosts)

module.exports = router