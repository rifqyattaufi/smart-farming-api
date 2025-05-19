const express = require('express');
const router = express.Router();
const midtransController = require('../controller/store/midtrans');

router.post('/notification', midtransController.handleWebhook);

module.exports = router;
