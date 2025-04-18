const express = require("express");
const router = express.Router();

const userRouter = require("./user");
const authRouter = require("./auth");
const perkebunanRouter = require("./perkebunan/perkebunanIndex");
const { authenticate } = require("../middleware/validation");

router.use("/user", authenticate(["pjawab"]), userRouter);
router.use("/auth", authRouter);
router.use("/perkebunan", perkebunanRouter);

module.exports = router;
