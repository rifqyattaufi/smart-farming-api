const express = require("express");
const router = express.Router();

const userRouter = require("./user");
const authRouter = require("./auth");
const perkebunanRouter = require("./perkebunan/perkebunanIndex");
const jenisBudidayaRouter = require("./farm/jenisBudidaya");
const unitBudidayaRouter = require("./farm/unitBudidaya");
const { authenticate } = require("../middleware/validation");

router.use("/user", authenticate(["pjawab"]), userRouter);
router.use("/auth", authRouter);

router.use("/perkebunan", perkebunanRouter);
router.use("/jenis-budidaya", authenticate(), jenisBudidayaRouter);
router.use("/unit-budidaya", authenticate(), unitBudidayaRouter);

module.exports = router;
