const express = require("express");
const router = express.Router();
const reportController = require("../../controller/farm/report.js");

router.get("/statistik-harian-kebun/:id", reportController.getStatistikHarianJenisBudidaya);
router.get("/statistik-laporan-harian/:id", reportController.getStatistikLaporanHarian);
router.get("/statistik-penyiraman/:id", reportController.getStatistikPenyiraman);
router.get("/statistik-pemberian-nutrisi/:id", reportController.getStatistikPemberianNutrisi);

router.get('/history/jenis-budidaya/:jenisBudidayaId', reportController.getRiwayatLaporanUmumPerJenisBudidaya);
router.get('/history/nutrisi/jenis-budidaya/:jenisBudidayaId', reportController.getRiwayatPemberianNutrisiPerJenisBudidaya);

module.exports = router;
