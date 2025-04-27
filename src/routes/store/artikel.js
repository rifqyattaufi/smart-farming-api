const express = require('express');
const router = express.Router();
const artikelController = require('../../controller/store/artikel.js');
const auditMiddleware = require('../../middleware/auditTrail.js');

const sequelize = require("../../model/index");
const db = sequelize.sequelize;
const Artikel = sequelize.Artikel;


router.get('/', artikelController.getAllArtikel);

router.get('/:id', artikelController.getArtikelById);

router.get('/search/:judul', artikelController.getArtikelByTitle);

router.post('/', auditMiddleware({ model: Artikel, tableName: "Artikel" }), artikelController.createArtikel);

router.put('/:id', auditMiddleware({ model: Artikel, tableName: "Artikel" }), artikelController.updateArtikel);

router.delete('/:id', auditMiddleware({ model: Artikel, tableName: "Artikel" }), artikelController.deleteArtikel);

module.exports = router;