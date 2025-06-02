const express = require('express');
const router = express.Router();
const pesananController = require('../../controller/store/pesanan.js');
const auditMiddleware = require('../../middleware/auditTrail.js');

const sequelize = require("../../model/index");
const db = sequelize.sequelize;
const Pesanan = sequelize.Pesanan;


router.post('/', auditMiddleware({ model: Pesanan, tableName: "Pesanan" }), pesananController.createPesanan);
router.get('/user', pesananController.getPesananByUser);
router.put('/status', pesananController.updatePesananStatus);
router.put('/statusss', pesananController.updatePesananStatusandNotif);
router.get('/id/:id', pesananController.getPesananById);
router.get('/toko/:id', pesananController.getPesananByTokoId);
router.post('/bukti', pesananController.CreatebuktiDiterima);

module.exports = router;  