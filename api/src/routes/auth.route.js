'use strict'

const express = require('express')
const authController = require('../controllers/auth.controller')
const asyncHandler = require('../middlewares/asynHandler.middleware')
const router = express.Router()

router.post('/register', asyncHandler(authController.register))

module.exports = router