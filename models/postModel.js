let mongoose = require('mongoose')

let postSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    username: {
        type: String,
        default: ''
    },
    post: {
        type: String,
        default: ''
    },
    comments: [
        {
            userId: mongoose.Schema.Types.ObjectId,
            username: {
                type: String,
                default: ''
            },
            comment: {
                type: String,
                default: ''
            },
            createdAt: {
                type: Date,
                default: Date.now()
            }
        }
    ],
    likes: [
        {
            username: {
                type: String,
                default: ''
            }
        }
    ],
    totalLikes: {
        type: Number,
        default: 0
    },
    created: {
        type: Date,
        default: Date.now()
    }
})

module.exports = mongoose.model('Post', postSchema)