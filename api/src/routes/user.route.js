"use strict";

const express = require("express");
const userController = require("../controllers/user.controller");
const asyncHandler = require("../middlewares/asynHandler.middleware");
const router = express.Router();

router.post("/update", asyncHandler(userController.update));
router.get(
  "/check-user-info-completion/:userId",
  asyncHandler(userController.checkUserInfoCompletion)
);
module.exports = router;
