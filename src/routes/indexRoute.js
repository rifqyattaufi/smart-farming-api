const express = require("express");
const router = express.Router();

const userRouter = require("./user");
const authRouter = require("./auth");
const farmRouter = require("./farm/farmIndex");
const storeRouter = require("./store/storeIndex");

const { authenticate } = require("../middleware/validation");

router.use("/user", userRouter);
router.use("/auth", authRouter);
 router.use("/midtrans", storeRouter);

router.use("/farm", authenticate(["pjawab", "inventor", "petugas"]), farmRouter);
router.use("/store", authenticate(["pjawab", "penjual", "user"]), storeRouter);


module.exports = router;
