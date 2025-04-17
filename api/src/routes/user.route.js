"use strict";

const express = require("express");
const userController = require("../controllers/user.controller");
const asyncHandler = require("../middlewares/asynHandler.middleware");
const router = express.Router();

router.post("/update", asyncHandler(userController.update));

router.get(
  "/notifications/:userId",
  asyncHandler(userController.getNotifications)
);

router.get(
  "/messages/:conversationId",
  asyncHandler(userController.getMessages)
);
module.exports = router;
router.post("/update", asyncHandler(userController.update));
router.get(
  "/check-user-info-completion/:userId",
  asyncHandler(userController.checkUserInfoCompletion)
);
module.exports = router;
