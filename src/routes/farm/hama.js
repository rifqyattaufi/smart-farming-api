const express = require('express');
const router = express.Router();
const hamaController = require('../../controller/farm/hama.js');
const auditMiddleware = require('../../middleware/auditTrail.js');

const sequelize = require("../../model/index");
const db = sequelize.sequelize;
const Hama = sequelize.Hama;

router.get('/', hamaController.getAllHama);

router.get('/:id', hamaController.getHamaById);

router.get('/search/:nama', hamaController.getHamaByName);

router.post('/', auditMiddleware({ model: Hama, tableName: "Hama" }), hamaController.createHama);

router.put('/:id', auditMiddleware({ model: Hama, tableName: "Hama" }), hamaController.updateHama);

router.delete('/:id', auditMiddleware({ model: Hama, tableName: "Hama" }), hamaController.deleteHama);

module.exports = router;