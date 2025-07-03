const express = require("express");
const router = express.Router();
const laporanController = require("../../controller/farm/laporan.js");
const auditMiddleware = require("../../middleware/auditTrail.js");

const sequelize = require("../../model/index");
const db = sequelize.sequelize;
const Laporan = sequelize.Laporan;

router.get(
  "/harian-kebun/last/:objekBudidayaId",
  laporanController.getLastHarianKebunByObjekBudidayaId
);

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

router.post(
  "/panen-kebun",
  auditMiddleware({ model: Laporan, tableName: "Laporan" }),
  laporanController.createLaporanPanenKebun
);

router.get("/harian-ternak/:id", laporanController.getLaporanHarianTernakById);

router.get("/harian-kebun/:id", laporanController.getLaporanHarianKebunById);

router.get("/sakit/:id", laporanController.getLaporanSakitById);

router.get("/kematian/:id", laporanController.getLaporanKematianById);

router.get("/jumlah-kematian/:unitBudidayaId", laporanController.getJumlahKematian);

router.get("/vitamin/:id", laporanController.getLaporanVitaminById);

router.get("/panen/:id", laporanController.getLaporanPanenById);

router.get("/hama/:id", laporanController.getLaporanHamaById);

router.get(
  "/penggunaan-inventaris/:id",
  laporanController.getLaporanPenggunaanInventarisById
);

router.get("/panen-kebun/:id", laporanController.getLaporanPanenKebunById);

module.exports = router;
