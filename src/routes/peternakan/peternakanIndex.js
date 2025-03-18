const express = require("express");
const router = express.Router();

const kandangRouter = require("./kandang");

router.use("/kandang", kandangRouter);

module.exports = router;
