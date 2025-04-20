"use strict";

const express = require("express");
const userController = require("../controllers/user.controller");
const asyncHandler = require("../middlewares/asyncHandler.middleware");
const router = express.Router();

router.post("/update", asyncHandler(userController.update));

router.get(
  "/conversation/:userId",
  asyncHandler(userController.getConversations)
)

router.get(
  "/notifications/:userId",
  asyncHandler(userController.getNotifications)
);

router.get(
  "/messages/:conversationId",
  asyncHandler(userController.getMessages)
);

router.post("/update", asyncHandler(userController.update));

router.get(
  "/check-user-info-completion/:userId",
  asyncHandler(userController.checkUserInfoCompletion)
);
router.post("/update-location", asyncHandler(userController.updateLocation));

module.exports = router;
