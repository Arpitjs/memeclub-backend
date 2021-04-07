let express = require('express')
let router = new express.Router()
let postController = require('../controllers/postController')
let authController = require('../controllers/authController')

router.post('/add-post',authController.protect, postController.createPost)
router.post('/add-like', authController.protect, postController.addLike)
router.post('/add-comment/:postId', authController.protect, postController.addComment)
router.get('/posts', authController.protect, postController.getPosts)
router.get('/post/:postId', authController.protect, postController.getOnePost)
router.put('/edit-post', authController.protect, postController.editPost)
router.delete('/delete-post/:id', authController.protect, postController.deletePost)
router.post('/edit-postUser', authController.protect, postController.editPostUser)

module.exports = router