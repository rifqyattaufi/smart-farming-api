const express = require('express');
const router = express.Router();
const UnitBudidayaController = require('../../controller/farm/unitBudidaya.js');
const auditMiddleware = require('../../middleware/auditTrail.js');

const sequelize = require("../../model/index");
const UnitBudidaya = sequelize.UnitBudidaya;

router.get('/', UnitBudidayaController.getAllUnitBudidaya);

router.get('/:id', UnitBudidayaController.getUnitBudidayaById);

router.get('/search/:nama', UnitBudidayaController.getUnitBudidayaByName);

router.post('/', auditMiddleware({ model: UnitBudidaya, tableName: "UnitBudidaya" }), UnitBudidayaController.createUnitBudidaya);

router.put('/:id', auditMiddleware({ model: UnitBudidaya, tableName: "UnitBudidaya" }), UnitBudidayaController.updateUnitBudidaya);

router.delete('/:id', auditMiddleware({ model: UnitBudidaya, tableName: "UnitBudidaya" }), UnitBudidayaController.deleteUnitBudidaya);

module.exports = router;