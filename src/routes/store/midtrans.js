const express = require('express');
const router = express.Router();
const midtransController = require('../../controller/store/midtrans');

router.post(
    '/transaction',
    midtransController.createTransaction
);

module.exports = router;
