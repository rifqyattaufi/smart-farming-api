const express = require('express');
const router = express.Router();
const JenisBudidayaController = require('../../controller/farm/jenisBudidaya.js');
const auditMiddleware = require('../../middleware/auditTrail.js');

const sequelize = require("../../model/index");
const db = sequelize.sequelize;
const JenisBudidaya = sequelize.JenisBudidaya;

router.get('/', JenisBudidayaController.getAllJenisBudidaya);

router.get('/:id', JenisBudidayaController.getJenisBudidayaById);

router.get('/search/:nama', JenisBudidayaController.getJenisBudidayaByName);

router.post('/', auditMiddleware({ model: JenisBudidaya, tableName: "JenisBudidaya" }), JenisBudidayaController.createJenisBudidaya);

router.put('/:id', auditMiddleware({ model: JenisBudidaya, tableName: "JenisBudidaya" }), JenisBudidayaController.updateJenisBudidaya);

router.delete('/:id', auditMiddleware({ model: JenisBudidaya, tableName: "JenisBudidaya" }), JenisBudidayaController.deleteJenisBudidaya);

module.exports = router;