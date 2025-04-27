const express = require("express");
const router = express.Router();

const jenisBudidayaRouter = require("./jenisBudidaya");
const unitBudidayaRouter = require("./unitBudidaya");
const satuanRouter = require("./satuan");
const kategoriInventarisRouter = require("./kategoriInventaris");
const jenisHamaRouter = require("./jenisHama");
const komoditasRouter = require("./komoditas");
const inventarisRouter = require("./inventaris");
const laporanRouter = require("./laporan");
const objekBudidayaRouter = require("./objekBudidaya");

const dashboardRouter = require("./dashboard");

const { authenticate } = require("../../middleware/validation");

router.use("/jenis-budidaya", jenisBudidayaRouter);
router.use("/unit-budidaya", unitBudidayaRouter);
router.use("/objek-budidaya", objekBudidayaRouter);
router.use("/komoditas", komoditasRouter);
router.use("/jenis-hama", jenisHamaRouter);
router.use("/satuan", satuanRouter);
router.use("/kategori-inventaris", kategoriInventarisRouter);
router.use("/inventaris", inventarisRouter);
router.use("/laporan", laporanRouter);
router.use("/dashboard", dashboardRouter);

module.exports = router;
