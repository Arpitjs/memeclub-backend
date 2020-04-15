let express = require('express')
let router = new express.Router()
let postController = require('../controllers/postController')
let authController = require('../controllers/authController')

router.post('/add-post',authController.protect, postController.createPost)
router.post('/add-like', authController.protect, postController.addLike)
router.get('/posts', postController.getPosts)

module.exports = router