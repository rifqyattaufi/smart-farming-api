const express = require('express');
const router = express.Router();
const produkController = require('../../controller/store/produk.js');
const auditMiddleware = require('../../middleware/auditTrail.js');

const sequelize = require("../../model/index");
const db = sequelize.sequelize;
const Produk = sequelize.Produk;



router.get('/id/:id', produkController.getProdukById);
router.get('/idUser/:id', produkController.getAllProdukByIdUser);
router.get('/idToko/:id', produkController.getProdukbyTokoId);
router.get('/rfc', produkController.getProdukByRFC);
router.get('/umkm', produkController.getProdukUMKM);
router.get('/stok/:id', produkController.getStokByProdukId);
router.get('/all/', produkController.getAll);
router.delete('/:id', produkController.deleteProdukById);
router.put('/activate/:id', produkController.activateProdukById);
router.post('/', auditMiddleware({ model: Produk, tableName: "Produk" }), produkController.createProduk);
router.post('/komoditas', auditMiddleware({ model: Produk, tableName: "Produk" }), produkController.createProdukByKomoditas);
router.put('/id/:id', auditMiddleware({ model: Produk, tableName: "Produk" }), produkController.updateProduk);

module.exports = router;