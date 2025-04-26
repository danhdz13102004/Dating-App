"use strict";

const express = require("express");
const notificationController = require("../controllers/notification.controller");
const asyncHandler = require("../middlewares/asyncHandler.middleware");
const router = express.Router();

// API để add new notification
router.post("/add", asyncHandler(notificationController.add));

module.exports = router;