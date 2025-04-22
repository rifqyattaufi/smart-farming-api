const express = require('express');
const router = express.Router();
const jenisHamaController = require('../../controller/farm/jenisHama.js');
const auditMiddleware = require('../../middleware/auditTrail.js');

const sequelize = require("../../model/index");
const db = sequelize.sequelize;
const JenisHama = sequelize.JenisHama;

router.get('/', jenisHamaController.getAlljenisHama);

router.get('/:id', jenisHamaController.getjenisHamaById);

router.get('/search/:nama', jenisHamaController.getjenisHamaByName);

router.post('/', auditMiddleware({ model: JenisHama, tableName: "JenisHama" }), jenisHamaController.createjenisHama);

router.put('/:id', auditMiddleware({ model: JenisHama, tableName: "JenisHama" }), jenisHamaController.updatejenisHama);

router.delete('/:id', auditMiddleware({ model: JenisHama, tableName: "JenisHama" }), jenisHamaController.deletejenisHama);

module.exports = router;