const express = require('express');
const router = express.Router();
const kategoriInventarisController = require('../../controller/farm/kategoriInventaris.js');
const auditMiddleware = require('../../middleware/auditTrail.js');

const sequelize = require("../../model/index");
const db = sequelize.sequelize;
const KategoriInventaris = sequelize.KategoriInventaris;

router.get('/', kategoriInventarisController.getAllkategoriInventaris);

router.post('/', auditMiddleware({ model: KategoriInventaris, tableName: "KategoriInventaris" }), kategoriInventarisController.createkategoriInventaris);

router.get('/:id', kategoriInventarisController.getkategoriInventarisById);

router.put('/:id', auditMiddleware({ model: KategoriInventaris, tableName: "KategoriInventaris" }), kategoriInventarisController.updatekategoriInventaris);

router.delete('/:id', auditMiddleware({ model: KategoriInventaris, tableName: "KategoriInventaris" }), kategoriInventarisController.deletekategoriInventaris);

module.exports = router;