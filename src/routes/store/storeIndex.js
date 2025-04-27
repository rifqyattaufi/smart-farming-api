const express = require('express');
const router = express.Router();

const artikelRouter = require('./artikel');
const tokoRouter = require('./toko');

router.use('/artikel', artikelRouter);
router.use('/toko', tokoRouter);
module.exports = router;