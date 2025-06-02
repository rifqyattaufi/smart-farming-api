const express = require("express");
const router = express.Router();
const authController = require("../controller/auth");

const { authenticate } = require("../middleware/validation");

router.post("/login", authController.login);
router.post("/register", authController.register);
router.post("/activate", authController.activateEmail);
router.get("/refresh", authController.refreshToken);
router.post("/resendOTP", authController.resendOtp);
router.post("/forgotPassword", authController.forgotPassword);
router.post("/resetPassword", authController.resetPassword);
router.get("/google/login", authController.googleLogin);
router.get("/google/register", authController.googleRegister);
router.get("/google/link", authController.googleLink);
router.get("/google/callback", authController.googleCallback);
router.post("/verifyPhone", authController.activatePhone);
router.post("/getPhoneByEmail", authController.getPhoneByEmail);
router.put(
  "/fcmToken",
  authenticate(["pjawab", "inventor", "petugas", "penjual", "user"]),
  authController.updateFcmToken
);
module.exports = router;
