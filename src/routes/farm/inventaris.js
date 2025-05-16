const express = require('express');
const router = express.Router();
const inventarisController = require('../../controller/farm/inventaris.js');
const auditMiddleware = require('../../middleware/auditTrail.js');

const sequelize = require("../../model/index");
const db = sequelize.sequelize;
const Inventaris = sequelize.Inventaris;

router.get('/', inventarisController.getAllInventaris);

router.get('/riwayat-penggunaan-inventaris', inventarisController.getRiwayatPenggunaanInventaris);

router.get('/:id', inventarisController.getInventarisById);

router.get('/search/:nama', inventarisController.getInventarisByName);

router.post('/', auditMiddleware({ model: Inventaris, tableName: "Inventaris" }), inventarisController.createInventaris);

router.put('/:id', auditMiddleware({ model: Inventaris, tableName: "Inventaris" }), inventarisController.updateInventaris);

router.delete('/:id', auditMiddleware({ model: Inventaris, tableName: "Inventaris" }), inventarisController.deleteInventaris);

module.exports = router;