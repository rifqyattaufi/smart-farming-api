const express = require('express');
const router = express.Router();
const UnitBudidayaController = require('../../controller/farm/unitBudidaya.js');

router.get('/', UnitBudidayaController.getAllUnitBudidaya);

router.post('/', UnitBudidayaController.createUnitBudidaya);

router.get('/:id', UnitBudidayaController.getUnitBudidayaById);

router.put('/:id', UnitBudidayaController.updateUnitBudidaya);

router.delete('/:id', UnitBudidayaController.deleteUnitBudidaya);

module.exports = router;