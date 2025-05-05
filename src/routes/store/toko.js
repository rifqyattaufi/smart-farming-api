const express = require('express');
const router = express.Router();
const tokoController = require('../../controller/store/toko.js');
const auditMiddleware = require('../../middleware/auditTrail.js');

const sequelize = require("../../model/index");
const { authenticate } = require('passport');
const db = sequelize.sequelize;
const Toko = sequelize.Artikel;


router.get('/', tokoController.getAllToko);

router.get('/id/:id', tokoController.getTokoById);

router.get('/user', tokoController.getTokoByUserId);

router.post('/', auditMiddleware({ model: Toko, tableName: "Toko" }), tokoController.createToko);

router.put('/:id', auditMiddleware({ model: Toko, tableName: "Toko" }), tokoController.updateToko);

router.put('/activate/:id', auditMiddleware({ model: Toko, tableName: "Toko" }), tokoController.activateToko);

router.put('/ban/:id', auditMiddleware({ model: Toko, tableName: "Toko" }), tokoController.banToko);

router.put('/reject/:id', auditMiddleware({ model: Toko, tableName: "Toko" }), tokoController.rejectToko);

router.delete('/:id', auditMiddleware({ model: Toko, tableName: "Toko" }), tokoController.deleteToko);

module.exports = router;