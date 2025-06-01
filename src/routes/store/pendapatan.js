const express = require('express');
const router = express.Router();
const pendapatanController = require('../../controller/store/pendapatan.js');
const auditMiddleware = require('../../middleware/auditTrail.js');

const sequelize = require("../../model/index");
const db = sequelize.sequelize;
const Pendapatan = sequelize.Pendapatan;

router.post('/', auditMiddleware({ model: Pendapatan, tableName: "Pendapatan" }), pendapatanController.addPendapatan);
router.get('/:id', pendapatanController.getPendapatanByTokoId);

module.exports = router;