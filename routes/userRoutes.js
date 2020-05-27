let express = require('express')
let router = new express.Router()
let userController = require('../controllers/userController')
let authController = require('../controllers/authController')

router.get('/get-users', authController.protect, userController.getAllUsers)
router.get('/get-user/:id', authController.protect, userController.getUser)
router.get('/get-userByName/:username', authController.protect, userController.getUserByName)
router.post('/follow', authController.protect, userController.follow)
router.post('/Unfollow', authController.protect, userController.Unfollow)
router.post('/mark/:id', authController.protect, userController.markNotification)
router.post('/mark-all', authController.protect, userController.markAllNotifications)
router.post('/view-profile', authController.protect, userController.viewProfile)
router.post('/change-password', authController.protect, userController.changePassword)

module.exports = router 