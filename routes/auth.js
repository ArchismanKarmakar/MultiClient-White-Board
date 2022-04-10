const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const mongoose = require('mongoose')
const nodemailer = require('nodemailer')
const User = mongoose.model('User')
const { JWT_SECRET } = require('../config/keys')
const { URL, USER, PASS } = require('../config/keys').EMAIL

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: USER,
        pass: PASS
    }
})

router.post('/signup', (req, res) => {

    const { firstName, lastName, email, password, pic, pic_id } = req.body

    User.findOne({ email })
        .then(savedUser => {
            if (savedUser) {
                return res.status(422).json({ error: "User already exists with this email !" })
            }

            bcrypt.hash(password, 12)
                .then(hashedPassword => {
                    const user = new User({
                        password: hashedPassword,
                        email,
                        firstName,
                        lastName,
                        pic,
                        pic_id
                    })
                    user.save().then(user => {
                        return res.json({ message: 'User Saved successfully !' })
                    })
                })
                .catch(e => console.log(e))
        })
        .catch(e => console.log(e))
})

router.post('/signin', (req, res) => {

    const { email, password } = req.body

    User.findOne({ email })
        .then(savedUser => {
            if (!savedUser) {
                return res.status(422).json({ error: "Wrong username or password!" })
            }

            bcrypt.compare(password, savedUser.password).then(doMatch => {
                if (doMatch) {
                    const token = jwt.sign({ _id: savedUser._id }, JWT_SECRET)
                    const { _id, firstName, lastName, email, pic, pic_id, WhiteBoards } = savedUser
                    return res.json({ token, user: { _id, firstName, lastName, email, pic, pic_id, WhiteBoards } })
                }
                return res.status(422).json({ error: "Wrong username or password" })
            })
                .catch(e => console.log(e))
        })
        .catch(e => console.log(e))
})

router.post('/reset-password', (req, res) => {
    crypto.randomBytes(32, (e, buffer) => {
        if (e) console.log(e)
        const token = buffer.toString('hex')
        User.findOne({ email: req.body.email })
            .then(user => {
                if (!user) return res.status(422).json({ error: "User does not exist with that email" })
                user.resetToken = token
                user.expireToken = Date.now() + 3600000
                user.save().then(result => {
                    transporter.sendMail({
                        to: user.email,
                        from: 'admin@archisman.org',
                        subject: 'Password-Reset@WhiteBoardApp(APV)',
                        html: `
                        <h2>You requested for password reset</h2>
                        <p>Click on this <a href="${URL}/reset/${token}">link</a> to reset password<p>`,
                        text: 'hello'
                    }).then(r => console.log('message sent'))
                        .catch(e => console.log(e))
                    res.json({ message: 'Link has been sent to your email !' })
                })
            })
    })
})

router.post('/new-password', (req, res) => {
    const newPassword = req.body.password
    const sentToken = req.body.token
    User.findOne({ resetToken: sentToken, expireToken: { $gt: Date.now() } })
        .then(user => {
            if (!user) return res.status(422).json({ error: 'Session has expired ! Try Again !' })
            bcrypt.hash(newPassword, 12).then(hashedPassword => {
                user.password = hashedPassword
                user.resetToken = undefined
                user.expireToken = undefined
                user.save().then(savedUser => {
                    res.json({ message: "Password updated succesfully !" })
                }).catch(e => console.log(e))
            }).catch(e => console.log(e))
        })
})

module.exports = router