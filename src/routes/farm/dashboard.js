const express = require("express");

const router = express.Router();

const dashboardController = require("../../controller/farm/dashboard.js");

router.get("/perkebunan", dashboardController.dashboardPerkebunan);
router.get("/peternakan", dashboardController.dashboardPeternakan);

module.exports = router;
