const express = require('express')
const requireLogin = require('../middleware/requireLogin')
const router = express.Router()


router.get('/about', (req, res) => {
    res.render('about')
})

router.get('/signup', (req, res) => {
    res.render('signup')
})

router.get('/signin', (req, res) => {
    res.render('login')
})

router.get('/dashboard', (req, res) => {
    res.render('dashboard')
})

router.get('/resetPassword', (req, res) => {
    res.render('resetPassword')
})

router.get('/reset/:token', (req, res) => {
    res.render('newPassword')
})

router.get('/accept/', (req, res) => {
    const query = req.query
    res.render('acceptBoard', { query })
})

module.exports = router