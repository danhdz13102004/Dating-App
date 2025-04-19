"use strict";

const express = require("express");
const conversationController = require("../controllers/conversation.controller");
const asyncHandler = require("../middlewares/asynHandler.middleware");
const router = express.Router();

// API để đổi trạng thái thành "active"
router.patch("/:conversationId/active", asyncHandler(conversationController.markAsSuccess));

// API để đổi trạng thái thành deleted
router.patch("/:conversationId", asyncHandler(conversationController.deleteConversation));
router.get("/match-requests/:id", asyncHandler(conversationController.getMatchRequests));
module.exports = router;