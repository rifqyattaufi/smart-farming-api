const express = require('express');
const router = express.Router();
const midtransController = require('../../controller/store/midtrans');

router.post('/transaction', midtransController.createTransaction);
router.post('/transaction/recreate', midtransController.recreateTransaction);
router.post('/transaction/status/:id', midtransController.getTransactionStatus);
router.post('/notification', midtransController.handleWebhook);

module.exports = router;
