const express = require("express");
const router = express.Router();
const reportController = require("../../controller/farm/report.js");

//Perkebunan
router.get(
  "/statistik-harian-kebun/:id",
  reportController.getStatistikHarianJenisBudidaya
);
router.get(
  "/statistik-penyiraman/:id",
  reportController.getStatistikPenyiraman
);
router.get("/statistik-pruning/:id", reportController.getStatistikPruning);
router.get("/statistik-repotting/:id", reportController.getStatistikRepotting);

//Umum
router.get(
  "/statistik-laporan-harian/:id",
  reportController.getStatistikLaporanHarian
);
router.get(
  "/statistik-pemberian-nutrisi/:id",
  reportController.getStatistikPemberianNutrisi
);
router.get("/statistik-laporan-sakit/:id", reportController.getStatistikSakit);
router.get(
  "/statistik-laporan-kematian/:id",
  reportController.getStatistikKematian
);

//Peternakan
router.get(
  "/statistik-pemberian-vitamin/:id",
  reportController.getStatistikVitamin
);
router.get(
  "/statistik-pemberian-vaksin/:id",
  reportController.getStatistikVaksin
);
router.get("/statistik-panen/:id", reportController.getStatistikPanenTernak);
router.get("/statistik-pakan/:id", reportController.getStatistikPakan);
router.get(
  "/statistik-cek-kandang/:id",
  reportController.getStatistikCekKandang
);
router.get(
  "/statistik/jumlah-panen/:jenisBudidayaId",
  reportController.getStatistikJumlahPanenTernak
);

//Riwayat Peternakan
router.get(
  "/history/harian-ternak/jenis-budidaya/:jenisBudidayaId",
  reportController.getRiwayatPelaporanHarianTernak
);
router.get(
  "/history/panen-ternak/jenis-budidaya/:jenisBudidayaId",
  reportController.getRiwayatPelaporanPanenTernak
);

//Riwayat Umum
router.get(
  "/history/nutrisi/jenis-budidaya/:jenisBudidayaId",
  reportController.getRiwayatPemberianNutrisiPerJenisBudidaya
);
router.get(
  "/history/sakit/jenis-budidaya/:jenisBudidayaId",
  reportController.getRiwayatPelaporanSakitPerJenisBudidaya
);
router.get(
  "/history/kematian/jenis-budidaya/:jenisBudidayaId",
  reportController.getRiwayatPelaporanKematianPerJenisBudidaya
);

module.exports = router;
