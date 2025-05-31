const express = require("express");
const router = express.Router();
const reportResult = require("../../controller/farm/report.js");

router.get("/statistik-harian-kebun/:id", reportResult.getStatistikHarianJenisBudidaya);

module.exports = router;
