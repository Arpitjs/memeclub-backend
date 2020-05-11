let express = require('express')
let router = new express.Router()
let authController = require('../controllers/authController')
let messageController = require('../controllers/messageController')

router.post('/chat-message/:reciever_Id', authController.protect, messageController.sendMessage)
router.get('/chat-message/:reciever_Id', authController.protect, messageController.getMessages)
router.get('/reciever-messages/:reciever', authController.protect, messageController.markRecieverMsg)
router.get('/mark-all-messages', authController.protect, messageController.markAllMsgs)

module.exports = router