"use strict";

const express = require("express");
const matchController = require("../controllers/match.controller");
const asyncHandler = require("../middlewares/asynHandler.middleware");
const router = express.Router();

// API để kiểm tra match giữa hai người dùng
router.post("/:id/match", asyncHandler(matchController.matchUser));

// API để lấy danh sách người dùng đã match với người dùng hiện tại
router.get("/matches", asyncHandler(matchController.getMatchedUsers));

// API để xử lý hành động "Like" người dùng
router.post("/:id/like", asyncHandler(matchController.likeUser));

// API để xử lý hành động "Dislike" người dùng
router.post("/:id/dislike", asyncHandler(matchController.skipUser));

module.exports = router;