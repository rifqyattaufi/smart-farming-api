const express = require("express");
const router = express.Router();

const userRouter = require("./user");
const peternakanRouter = require("./peternakan/peternakanIndex");
const perkebunanRouter = require("./perkebunan/perkebunanIndex");

router.use("/user", userRouter);
router.use("/peternakan", peternakanRouter);
router.use("/perkebunan", perkebunanRouter);

module.exports = router;
