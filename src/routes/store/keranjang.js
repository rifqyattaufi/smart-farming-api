const express = require('express');
const router = express.Router();
const keranjangController = require('../../controller/store/keranjang.js');
const auditMiddleware = require('../../middleware/auditTrail.js');

const sequelize = require("../../model/index");
const db = sequelize.sequelize;
const Keranjang = sequelize.Keranjang;


router.post('/', auditMiddleware({ model: Keranjang, tableName: "Keranjang" }), keranjangController.createKeranjang);
router.get('/id/', keranjangController.getKeranjangByUserId);
router.put('/id/:id', keranjangController.updateKeranjang);
router.delete('/id/:id', keranjangController.deleteKeranjang);
module.exports = router;