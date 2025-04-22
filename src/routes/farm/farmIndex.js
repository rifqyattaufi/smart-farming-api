const express = require("express");
const router = express.Router();

const jenisBudidayaRouter = require("./jenisBudidaya");
const unitBudidayaRouter = require("./unitBudidaya");
const satuanRouter = require("./satuan");
const kategoriInventarisRouter = require("./kategoriInventaris");
const jenisHamaRouter = require("./jenisHama");
const komoditasRouter = require("./komoditas");
const inventarisRouter = require("./inventaris");

const { authenticate } = require("../../middleware/validation");

router.use("/jenis-budidaya", authenticate(), jenisBudidayaRouter);
router.use("/unit-budidaya", authenticate(), unitBudidayaRouter);
router.use("/satuan", authenticate(), satuanRouter);
router.use("/kategori-inventaris", authenticate(), kategoriInventarisRouter);
router.use("/jenis-hama", authenticate(), jenisHamaRouter);
router.use("/komoditas", authenticate(), komoditasRouter);
router.use("/inventaris", authenticate(), inventarisRouter);

module.exports = router;
