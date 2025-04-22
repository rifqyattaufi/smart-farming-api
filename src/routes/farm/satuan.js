const express = require('express');
const router = express.Router();
const SatuanController = require('../../controller/farm/satuan.js');
const auditMiddleware = require('../../middleware/auditTrail.js');

const sequelize = require("../../model/index");
const db = sequelize.sequelize;
const Satuan = sequelize.Satuan;

router.get('/', SatuanController.getAllSatuan);

router.post('/', auditMiddleware({ model: Satuan, tableName: "Satuan" }), SatuanController.createSatuan);

router.get('/:id', SatuanController.getSatuanById);

router.get('/search/:nama', SatuanController.getSatuanByName);

router.put('/:id', auditMiddleware({ model: Satuan, tableName: "Satuan" }), SatuanController.updateSatuan);

router.delete('/:id', auditMiddleware({ model: Satuan, tableName: "Satuan" }), SatuanController.deleteSatuan);

module.exports = router;