let express = require('express')
let router = new express.Router()
let authController = require('../controllers/authController')

router.post('/login', authController.login)
router.post('/register', authController.register)

module.exports = router