let express = require('express')
let router = new express.Router()
let userController = require('../controllers/userController')
let authController = require('../controllers/authController')

router.get('/get-users',authController.protect, userController.getAllUsers)

module.exports = router