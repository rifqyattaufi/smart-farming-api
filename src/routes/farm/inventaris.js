const express = require('express');
const router = express.Router();
const inventarisController = require('../../controller/farm/inventaris.js');
const auditMiddleware = require('../../middleware/auditTrail.js');

const sequelize = require("../../model/index");
const db = sequelize.sequelize;
const Inventaris = sequelize.Inventaris;

router.get('/', inventarisController.getAllInventaris);

router.post('/', auditMiddleware({ model: Inventaris, tableName: "Inventaris" }), inventarisController.createInventaris);

router.get('/:id', inventarisController.getInventarisById);

router.put('/:id', auditMiddleware({ model: Inventaris, tableName: "Inventaris" }), inventarisController.updateInventaris);

router.delete('/:id', auditMiddleware({ model: Inventaris, tableName: "Inventaris" }), inventarisController.deleteInventaris);

module.exports = router;