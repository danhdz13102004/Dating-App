"use strict";

const express = require("express");
const postController = require("../controllers/post.controller");
const asyncHandler = require("../middlewares/asyncHandler.middleware");
const router = express.Router();

router.post("/create", asyncHandler(postController.create));
// Add new route to get newest post with image
router.get("/newest-image/:userId", asyncHandler(postController.getNewestImagePost));
// Add new route to remove newest post
router.delete("/remove-newest/:userId", asyncHandler(postController.removeNewestPost));

module.exports = router;
