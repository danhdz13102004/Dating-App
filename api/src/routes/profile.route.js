'use strict'
const express = require('express')
const router = express.Router()
const asyncHandler = require('../middlewares/asyncHandler.middleware')
const profileController = require('../controllers/profile.controller')

router.get('/:userId', asyncHandler(profileController.getProfile))

router.post('/update-avatar', asyncHandler(profileController.updateAvatar))

router.put('/update', asyncHandler(profileController.updateProfile))

module.exports = router