'use strict'

const express = require('express')
const router = express.Router()

router.use('/auth', require('./auth.route'))
router.use('/user', require('./user.route'))
router.use('/match', require('./match.route'))
router.use('/message', require('./message.route'))

module.exports = router