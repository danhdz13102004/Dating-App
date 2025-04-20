"use strict";

const express = require("express");
const messageController = require("../controllers/message.controller");
const asyncHandler = require("../middlewares/asyncHandler.middleware");
const router = express.Router();

router.post("/add", asyncHandler(messageController.add));

module.exports = router;
