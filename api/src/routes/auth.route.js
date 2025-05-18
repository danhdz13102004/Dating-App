"use strict";

const express = require("express");
const authController = require("../controllers/auth.controller");
const asyncHandler = require("../middlewares/asyncHandler.middleware");
const router = express.Router();

router.post("/register", asyncHandler(authController.register));

router.post("/login", asyncHandler(authController.login));

router.post("/update-hobbies", asyncHandler(authController.updateUserHobbies));

router.post("/update-gender", asyncHandler(authController.updateUserGender));

router.post("/change-password", asyncHandler(authController.changePassword));

router.post('/facebook/callback', asyncHandler(authController.loginWithFacebook));

module.exports = router;
