const express = require('express');
const router = express.Router();
const JenisBudidayaController = require('../controller/jenisBudidaya.js');

router.get('/', JenisBudidayaController.getAllJenisBudidaya);

router.post('/', JenisBudidayaController.createJenisBudidaya);

router.put('/:id', JenisBudidayaController.updateJenisBudidaya);

router.delete('/:id', JenisBudidayaController.deleteJenisBudidaya);

module.exports = router;