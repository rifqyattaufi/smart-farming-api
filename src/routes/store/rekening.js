const express = require('express');
const router = express.Router();
const rekeningController = require('../../controller/store/rekening.js');
const auditMiddleware = require('../../middleware/auditTrail.js');

const sequelize = require("../../model/index");
const db = sequelize.sequelize;
const Rekening = sequelize.Rekening;



router.get('/idUser/:id', rekeningController.getRekeningByUserId);

router.get('/idUser/:id/raw', rekeningController.getRekeningByUserIdRaw);

router.get('/user', rekeningController.getRekeningById);

router.post('/', auditMiddleware({ model: Rekening, tableName: "Rekening" }), rekeningController.createRekening);

router.put('/:id', auditMiddleware({ model: Rekening, tableName: "Rekening" }), rekeningController.updateRekening);

module.exports = router;