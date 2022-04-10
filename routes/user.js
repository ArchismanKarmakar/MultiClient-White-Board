const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const User = mongoose.model('User')
const requireLogin = require('../middleware/requireLogin')
const nodemailer = require('nodemailer')
const crypto = require('crypto')
const cloudinary = require('cloudinary').v2
const { URL, USER, PASS } = require('../config/keys').EMAIL
const { CLOUDINARY } = require('../config/keys')

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: USER,
        pass: PASS
    }
})

cloudinary.config({
    cloud_name: CLOUDINARY.CLOUD_NAME,
    api_key: CLOUDINARY.API_KEY,
    api_secret: CLOUDINARY.API_SECRET,
    upload_preset: CLOUDINARY.UPLOAD_PRESET
})

router.post('/dashboard', requireLogin, (req, res) => {
    User.findById(req.user._id)
        .select('-password')
        .then(user => {
            return res.json(user)
        })
        .catch(e => res.status(404).json({ error: "User not found" }))
})

router.put('/updatepic', requireLogin, (req, res) => {

    if (req.body.curr_pic_id !== "default") {
        cloudinary.uploader.destroy(req.body.curr_pic_id, (e, result) => {
            console.log(e, result)
        })
    }
    User.findByIdAndUpdate(req.user._id, {
        $set: { pic: req.body.pic, pic_id: req.body.pic_id }
    }, { new: true, useFindAndModify: false },

        (e, result) => {
            if (e) return res.status(422).json({ error: 'Pic cannot be updated !' })
            res.json({ message: 'Profile pic updated successfully !' })
        }
    )
})

router.put('/saveWhiteBoard', requireLogin, (req, res) => {
    if (req.body.prevBoardId) {
        User.updateOne({ '_id': req.user._id, 'WhiteBoards.img_id': req.body.prevBoardId }, {
            $set: { 'WhiteBoards.$.img_id': req.body.img_id, 'WhiteBoards.$.img': req.body.url, 'WhiteBoards.$.drawings': req.body.drawings }
        }
            , { new: true, useFindAndModify: false },
            (e, result) => {
                if (e) return res.status(422).json({ error: e })
                res.json({ message: "Saved successfully !" })
                cloudinary.uploader.destroy(req.body.prevBoardId, (e, result) => {
                    console.log(e, result)
                })
            }
        )
    }
    else {
        User.findByIdAndUpdate(req.user._id, {
            $push: { WhiteBoards: { img: req.body.url, img_id: req.body.img_id, drawings: req.body.drawings } }
        }, { new: true, useFindAndModify: false },

            (e, result) => {
                if (e) return res.status(422).json({ error: e })
                res.json({ message: "Saved successfully !" })
            }
        )
    }
})

router.post('/getDrawings', requireLogin, (req, res) => {
    User.findOne({ email: req.body.email })
        .then(user => {
            user.WhiteBoards.forEach(e => {
                if (e.img === req.body.pic) {
                    return res.json(e.drawings)
                }
            })
        })
        .catch(e => console.log(e))
})

router.put('/deleteBoard', requireLogin, (req, res) => {
    User.findByIdAndUpdate(req.user._id, {
        $pull: {
            WhiteBoards: { img: req.body.img_url },
        }
    }, { new: true, useFindAndModify: false },
        (e, result) => {
            if (e) return res.status(422).json({ error: e })
            res.json({ message: "Deleted successfully !" })
            cloudinary.uploader.destroy(req.body.img_id, (e, result) => {
                console.log(e, result)
            })
        }
    )
})

router.post('/shareBoardToEmail', requireLogin, (req, res) => {
    crypto.randomBytes(32, (e, buffer) => {
        if (e) console.log(e)
        const token = buffer.toString('hex')
        User.findOne({ email: req.body.receiver })
            .then(user => {
                if (!user) return res.status(422).json({ error: "User does not exist with that email" })
                user.resetToken = token
                user.expireToken = Date.now() + 3600000
                user.save().then(result => {
                    transporter.sendMail({
                        to: user.email,
                        from: 'admin@archisman.org',
                        subject: 'WhiteBoard-Shared@WhiteBoardApp(APV)',
                        html: `
                        <h2>White Board shared</h2>
                        <p>${req.body.sender} has shared the following whiteboard to you</p><br>
                        <img src="${req.body.url}"><br>
                        <p>Click <a href="${URL}/accept/?t=${token}&i=${req.body.url}&s=${req.body.sender}">here</a> to accept and save it</p>`
                    }).then(r => console.log('message sent'))
                        .catch(e => console.log(e))
                    res.json({ message: `Message has been sent to ${user.email}` })
                })
            })
    })
})

router.post('/istokenValid', requireLogin, (req, res) => {
    const sentToken = req.body.token
    User.findOne({ resetToken: sentToken, expireToken: { $gt: Date.now() } })
        .then(user => {
            if (!user) return res.status(422).json({ error: 'Session has expired!' })
            return res.json({ message: 'success' })
        })
})

module.exports = router