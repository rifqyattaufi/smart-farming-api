const express = require("express");
const router = express.Router();
const authController = require("../controller/auth");

router.post("/login", authController.login);
router.post("/register", authController.register);
router.post("/activate", authController.activate);
router.get("/refresh", authController.refreshToken);
router.post("/forgotPassword", authController.forgotPassword);
router.post("/resetPassword", authController.resetPassword);
router.get("/google", authController.googleLogin);
router.get("/google/callback", authController.googleCallback);

module.exports = router;
