"use strict";

const express = require("express");
const conversationController = require("../controllers/conversation.controller");
const asyncHandler = require("../middlewares/asyncHandler.middleware");
const router = express.Router();

// API để đổi trạng thái thành "active"
router.patch("/:conversationId/active", asyncHandler(conversationController.markAsSuccess));

// API để đổi trạng thái thành deleted
router.patch("/:conversationId", asyncHandler(conversationController.deleteConversation));

// API để lấy danh sách yêu cầu match
router.get("/match-requests/:id", asyncHandler(conversationController.getMatchRequests));

// API để chặn người dùng trong cuộc trò chuyện
router.patch("/:conversationId/block", asyncHandler(conversationController.blockUser));

// API để bỏ chặn người dùng trong cuộc trò chuyện
router.patch("/:conversationId/unblock", asyncHandler(conversationController.unblockUser));

// API để lấy thông tin chi tiết của một cuộc hội thoại
router.get("/:conversationId", asyncHandler(conversationController.getConversationById));

module.exports = router;