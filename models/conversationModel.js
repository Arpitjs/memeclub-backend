let mongoose = require('mongoose')

let conversationSchema = mongoose.Schema({
participants: [
    {
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        recieverId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    }
]
})

module.exports = mongoose.model('Conversation', conversationSchema)