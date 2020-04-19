let mongoose = require('mongoose')
let bcrypt = require('bcryptjs')

let userSchema = mongoose.Schema({
    username: {
        type: String
    },
    email: {
        type: String,
        lowercase: true
    },
    password: {
        type: String
    },
    posts: [
        {
            post: {
                type: String,
            },
            postId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Post'
            },
            createdAt: {
                type: Date,
                default: new Date()
            }
        }
    ],
    following: [
        {
            userFollowed: mongoose.Schema.Types.ObjectId
        }
    ],
    followers: [
        {
            follower: mongoose.Schema.Types.ObjectId
        }
    ],
    notifications: [
        {
            senderId: mongoose.Schema.Types.ObjectId,
            message: {
                type: String
            },
            viewProfile: {
                type: Boolean,
                default: false
            },
            created: {
                type: Date,
                default: Date.now()
            },
            read: {
                type: Boolean,
                default: false
            },
            date: {
                type: String, default: ''
            }
        }
    ]
})

userSchema.pre('save', async function (next) {
    this.password = await bcrypt.hash(this.password, 16)
    next()
})

userSchema.statics.verifyPassword = async function (p1, p2) {
    return await bcrypt.compare(p1, p2)
}

let User = mongoose.model('User', userSchema)

module.exports = User