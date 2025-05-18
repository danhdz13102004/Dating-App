'use strict'

const express = require('express')
const router = express.Router()

router.use('/auth', require('./auth.route'))

router.use('/user', require('./user.route'))

router.use('/match', require('./match.route'))
router.use('/message', require('./message.route'))
router.use('/conversation', require('./conversation.route'))

router.use('/otp', require('./otp.routes'))

router.use('/notification', require('./notification.route'))

router.use('/post', require('./post.route'))

router.use('/profile', require('./profile.route'))

module.exports = router