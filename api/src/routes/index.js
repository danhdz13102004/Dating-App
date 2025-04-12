'use strict'

const express = require('express')
const router = express.Router()

router.use('/auth', require('./auth.route'))
router.use('/user', require('./user.route'))

module.exports = router