let express = require('express')
let router = new express.Router()
let userController = require('../controllers/userController')
let authController = require('../controllers/authController')

router.get('/get-users',authController.protect, userController.getAllUsers)
router.get('/get-user/:id',authController.protect, userController.getUser)
router.get('/get-user/:username',authController.protect, userController.getUserByName)
router.post('/follow',authController.protect, userController.follow )

module.exports = router