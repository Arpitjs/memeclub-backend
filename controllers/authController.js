let Joi = require('@hapi/joi')
let jwt = require('jsonwebtoken')
let statusCodes = require('http-status-codes')
let User = require('../models/userModel')

exports.login = async (req, res, next) => {
    let user = await User.findOne({ username: req.body.username })
    if (!user) return next({ msg: 'invalid username or password.' })
    let isUser = await User.verifyPassword(req.body.password, user.password)
    if (!isUser) return next({ msg: 'invalid username or password.', status: statusCodes.NOT_FOUND })
    signToken(statusCodes.OK, user, res)
}

function signToken(code, user, res) {
    let token = jwt.sign({ user }, process.env.JWT_SECRET)
    res.cookie('auth', token)
    res.status(code).json({ user, token })
}

exports.register = async (req, res, next) => {
    console.log(req.body)
    try {
        let schema = Joi.object().keys({
            username: Joi.string().min(5).required(),
            email: Joi.string().email().required(),
            password: Joi.string().min(5).required()
        })

        let { error, value } = schema.validate(req.body)
        if (error && error.details) return next({ msg: error.details[0].message })

        let userEmail = await User.findOne({ email: req.body.email })
        if (userEmail) return next({ msg: 'email already exist', status: statusCodes.CONFLICT })

        let userName = await User.findOne({ username: value.username })
        if (userName) return next({ msg: 'username already exist', status: statusCodes.CONFLICT })

        let user = await User.create(req.body)
        signToken(statusCodes.CREATED, user, res)

    } catch (e) { next(e) }
}

exports.protect = async (req, res, next) => {
    try {
        let token
        if (req.headers.authorization) {
            token = req.headers.authorization.split(' ')[1]
        }
        if (!token) {
            return res.status(statusCodes.FORBIDDEN).json({
                msg: 'token not provided.'
            })
        }
       return jwt.verify(token, process.env.JWT_SECRET, async function (err, decoded) {
        //    console.log(req.headers)
            if (err) {
                if (err.expiredAt < new Date()) {
                    return res.status(statusCodes.INTERNAL_SERVER_ERROR).json({
                        msg: 'token has expired',
                        token: null
                    })
                }
                return next({msg: err})
            } else {
            let user = await User.findById(decoded.user)
            // console.log('user', user)
            req.user = user
            next()
            }
        })
    }
    catch (e) {
        console.log(e)
    }
} 