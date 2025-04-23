const express = require("express");
const router = express.Router();
const laporanController = require("../../controller/farm/laporan.js");
const auditMiddleware = require("../../middleware/auditTrail.js");

const sequelize = require("../../model/index");
const db = sequelize.sequelize;
const Laporan = sequelize.Laporan;

router.post(
  "/harian-kebun",
  auditMiddleware({ model: Laporan, tableName: "Laporan" }),
  laporanController.createLaporanHarianKebun
);
router.post(
  "/harian-ternak",
  auditMiddleware({ model: Laporan, tableName: "Laporan" }),
  laporanController.createLaporanHarianTernak
);

router.post(
  "/sakit",
  auditMiddleware({ model: Laporan, tableName: "Laporan" }),
  laporanController.createLaporanSakit
);
router.post(
  "/kematian",
  auditMiddleware({ model: Laporan, tableName: "Laporan" }),
  laporanController.createLaporanKematian
);
router.post(
  "/vitamin",
  auditMiddleware({ model: Laporan, tableName: "Laporan" }),
  laporanController.createLaporanVitamin
);

router.post(
  "/panen",
  auditMiddleware({ model: Laporan, tableName: "Laporan" }),
  laporanController.createLaporanPanen
);
router.post(
  "/hama",
  auditMiddleware({ model: Laporan, tableName: "Laporan" }),
  laporanController.createLaporanHama
);

router.post(
  "/penggunaan-inventaris",
  auditMiddleware({ model: Laporan, tableName: "Laporan" }),
  laporanController.createLaporanPenggunaanInventaris
);

module.exports = router;
