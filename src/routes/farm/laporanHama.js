const express = require('express');
const router = express.Router();
const laporanHamaController = require('../../controller/farm/laporanHama.js');

router.get('/', laporanHamaController.getAllLaporanHama);

router.get('/search/:query', laporanHamaController.searchLaporanHama);

router.get('/:id', laporanHamaController.getLaporanHamaById);

module.exports = router;