const express = require("express");
const router = express.Router();
const authController = require("../controller/auth");
const otpController = require("../controller/otpController");

router.post("/login", authController.login);
router.post("/register", authController.register);
router.post("/activate", authController.activate);
router.get("/refresh", authController.refreshToken);
router.post("/forgotPassword", authController.forgotPassword);
router.post("/resetPassword", authController.resetPassword);
router.get("/google/login", authController.googleLogin);
router.get("/google/register", authController.googleRegister);
router.get("/google/link", authController.googleLink);
router.get("/google/callback", authController.googleCallback);
router.post('/send', otpController.sendOTP);
module.exports = router;    
