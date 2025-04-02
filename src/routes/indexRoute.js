const express = require("express");
const router = express.Router();

const userRouter = require("./user");
const authRouter = require("./auth");
const peternakanRouter = require("./peternakan/peternakanIndex");
const perkebunanRouter = require("./perkebunan/perkebunanIndex");

router.use("/user", userRouter);
router.use("/auth", authRouter);
router.use("/peternakan", peternakanRouter);
router.use("/perkebunan", perkebunanRouter);

module.exports = router;
