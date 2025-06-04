const express = require("express");
const router = express.Router();
const reportController = require("../../controller/farm/report.js");

router.get("/statistik-harian-kebun/:id", reportController.getStatistikHarianJenisBudidaya);
router.get("/statistik-laporan-harian/:id", reportController.getStatistikLaporanHarian);
router.get("/statistik-penyiraman/:id", reportController.getStatistikPenyiraman);
router.get("/statistik-pruning/:id", reportController.getStatistikPruning);
router.get("/statistik-repotting/:id", reportController.getStatistikRepotting);
router.get("/statistik-pemberian-nutrisi/:id", reportController.getStatistikPemberianNutrisi);
router.get("/statistik-laporan-sakit/:id", reportController.getStatistikSakit);
router.get("/statistik-laporan-kematian/:id", reportController.getStatistikKematian);

router.get('/history/jenis-budidaya/:jenisBudidayaId', reportController.getRiwayatLaporanUmumPerJenisBudidaya);
router.get('/history/nutrisi/jenis-budidaya/:jenisBudidayaId', reportController.getRiwayatPemberianNutrisiPerJenisBudidaya);
router.get('/history/sakit/jenis-budidaya/:jenisBudidayaId', reportController.getRiwayatPelaporanSakitPerJenisBudidaya);
router.get('/history/kematian/jenis-budidaya/:jenisBudidayaId', reportController.getRiwayatPelaporanKematianPerJenisBudidaya);

module.exports = router;
