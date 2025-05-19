const express = require("express");

const router = express.Router();

const dashboardController = require("../../controller/farm/dashboard.js");
const dashboardInvController = require("../../controller/farm/dashboardInv.js");

router.get("/perkebunan", dashboardController.dashboardPerkebunan);
router.get("/peternakan", dashboardController.dashboardPeternakan);
router.get("/inventaris", dashboardInvController.dashboardInventaris);

module.exports = router;
