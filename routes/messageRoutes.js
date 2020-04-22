let express = require('express')
let router = new express.Router()
let authController = require('../controllers/authController')
let messageController = require('../controllers/messageController')

router.post('/chat-message/:senderId/:recieverId', authController.protect, messageController.sendMessage)

module.exports = router