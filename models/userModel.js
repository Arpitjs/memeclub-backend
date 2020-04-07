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
    }
})

userSchema.pre('save', async function(next) {
    this.password = await bcrypt.hash(this.password, 16)
    next()
})

userSchema.statics.verifyPassword = async function(p1, p2) {
    return await bcrypt.compare(p1, p2)
}

let User = mongoose.model('User', userSchema)

module.exports = User