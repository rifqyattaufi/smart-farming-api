const express = require('express');
const router = express.Router();
const saldoController = require('../../controller/store/saldo.js');
const auditMiddleware = require('../../middleware/auditTrail.js');

const sequelize = require("../../model/index");
const penarikanSaldo = require('../../model/store/penarikanSaldo.js');
const db = sequelize.sequelize;
const Saldo = sequelize.Saldo;

router.get('/user', saldoController.getMySaldo);

router.get('/mutasi', saldoController.getMyMutasiSaldo);

router.post('/tarik-saldo', auditMiddleware({ model: penarikanSaldo, tableName: "penarikan_saldo" }), saldoController.createPenarikanSaldo);

router.get('/histori-penarikan', saldoController.getMyPenarikanSaldoHistory);

router.get(
    '/admin/request-penarikan', saldoController.getAllPenarikanSaldoRequests
);

router.put(
    '/admin/proses-penarikan/:id', auditMiddleware({ model: sequelize.PenarikanSaldo, tableName: "penarikan_saldo" }), saldoController.prosesPenarikanSaldo
);

module.exports = router;