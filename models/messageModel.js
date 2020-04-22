let mongoose = require('mongoose')

let messageSchema = mongoose.Schema({
    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation'
    },
    sender: {
        type: String
    }, 
    reciever: {
        type: String
    },
    message: [
        {
            senderId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            recieverId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            senderName: {
                type: String
            },
            recieverName: {
                type: String
            },
            body: {
                type: String, default: ''
            },
            isRead: {
                type: Boolean, default: false
            }, 
            createdAt: {
                type: Date,
                default: Date.now()
            }
        }
    ]
})

module.exports = mongoose.model('Message', messageSchema)