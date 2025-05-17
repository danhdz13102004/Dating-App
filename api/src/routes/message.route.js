"use strict";

const express = require("express");
const messageController = require("../controllers/message.controller");
const asyncHandler = require("../middlewares/asyncHandler.middleware");
const router = express.Router();

router.post("/add", asyncHandler(messageController.add));
router.put("/edit", asyncHandler(messageController.edit));
router.delete("/delete", asyncHandler(messageController.delete));

module.exports = router;
