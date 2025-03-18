const express = require("express");
const router = express.Router();
const KandangController = require("../../controller/peternakan/kandang");

router.get("/", KandangController.getAllKandang);

router.post("/", KandangController.createKandang);

// router.put('/:id', KandangController);

// router.delete('/:id', KandangController);

module.exports = router;
