"use strict";

const express = require("express");
const matchController = require("../controllers/match.controller");
const asyncHandler = require("../middlewares/asyncHandler.middleware");
const router = express.Router();

// API để kiểm tra match giữa hai người dùng
router.post("/:id/match", asyncHandler(matchController.matchUser));

// API để lấy danh sách người dùng đã match với người dùng hiện tại
router.get("/matches", asyncHandler(matchController.getMatchedUsers));

// API để xử lý hành động "Like" người dùng
router.post("/:id/like", asyncHandler(matchController.likeUser));

// API để xử lý hành động "Dislike" người dùng
router.post("/:id/dislike", asyncHandler(matchController.skipUser));

// API lấy danh sách người dùng theo hobbies, location, age range (ko bao gồm người đã bị skipped)
router.get('/:id/potential-matches', asyncHandler(matchController.getPotentialMatches))

// API cập nhật preferences, gender, age range, location để tìm người match
router.put('/:id/preferences', asyncHandler(matchController.updatePreferences))

// API lấy preference của người dùng
router.get('/:id/preferences', asyncHandler(matchController.getPreferences))

module.exports = router