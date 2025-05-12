const express = require('express');
const router = express.Router();

const artikelRouter = require('./artikel');
const tokoRouter = require('./toko');
const rekeningRouter = require('./rekening');
const produkRouter = require('./produk');
const keranjangRouter = require('./keranjang');
const midtransRouter = require('./midtrans');

router.use('/artikel', artikelRouter);
router.use('/toko', tokoRouter);
router.use('/rekening', rekeningRouter);
router.use('/produk', produkRouter);
router.use('/keranjang', keranjangRouter);
router.use('/midtrans', midtransRouter);
module.exports = router;