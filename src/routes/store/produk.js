const express = require('express');
const router = express.Router();
const produkController = require('../../controller/store/produk.js');
const auditMiddleware = require('../../middleware/auditTrail.js');

const sequelize = require("../../model/index");
const db = sequelize.sequelize;
const Produk = sequelize.Produk;



router.get('/id/:id', produkController.getProdukById);
router.get('/token', produkController.getProdukByToken);
router.get('/idToko/:id', produkController.getProdukbyTokoId);
router.get('/rfc', produkController.getProdukByRFC);
router.get('/umkm', produkController.getProdukUMKM);
router.get('/all/', produkController.getAll);
router.delete('/:id', produkController.deleteProdukById);
router.post('/', auditMiddleware({ model: Produk, tableName: "Produk" }), produkController.createProduk);

router.put('/id/:id', auditMiddleware({ model: Produk, tableName: "Produk" }), produkController.updateProduk);

module.exports = router;