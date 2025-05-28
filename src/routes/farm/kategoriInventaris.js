const express = require("express");
const router = express.Router();
const kategoriInventarisController = require("../../controller/farm/kategoriInventaris.js");
const auditMiddleware = require("../../middleware/auditTrail.js");

const sequelize = require("../../model/index");
const db = sequelize.sequelize;
const KategoriInventaris = sequelize.KategoriInventaris;

router.get("/", kategoriInventarisController.getAllKategoriInventaris);

router.get(
  "/only",
  kategoriInventarisController.getKategoriInventarisOnly
);

router.get("/:id", kategoriInventarisController.getKategoriInventarisById);

router.get(
  "/search/:nama",
  kategoriInventarisController.getKategoriInventarisByName
);


router.post(
  "/",
  auditMiddleware({
    model: KategoriInventaris,
    tableName: "KategoriInventaris",
  }),
  kategoriInventarisController.createKategoriInventaris
);

router.put(
  "/:id",
  auditMiddleware({
    model: KategoriInventaris,
    tableName: "KategoriInventaris",
  }),
  kategoriInventarisController.updateKategoriInventaris
);

router.delete(
  "/:id",
  auditMiddleware({
    model: KategoriInventaris,
    tableName: "KategoriInventaris",
  }),
  kategoriInventarisController.deleteKategoriInventaris
);

module.exports = router;
