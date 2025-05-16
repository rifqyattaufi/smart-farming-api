const express = require("express");
const router = express.Router();
const ObjekBudidayaController = require("../../controller/farm/objekBudidaya");
const auditMiddleware = require("../../middleware/auditTrail.js");

const sequelize = require("../../model/index");
const ObjekBudidaya = sequelize.ObjekBudidaya;

router.get("/", ObjekBudidayaController.getAllObjekBudidaya);
router.get("/:id", ObjekBudidayaController.getObjekBudidayaById);
router.get(
  "/unit-budidaya/:id",
  ObjekBudidayaController.getObjekBudidayaByUnitBudidaya
);

router.post(
  "/",
  auditMiddleware({ model: ObjekBudidaya, tableName: "ObjekBudidaya" }),
  ObjekBudidayaController.createObjekBudidaya
);
router.put(
  "/:id",
  auditMiddleware({ model: ObjekBudidaya, tableName: "ObjekBudidaya" }),
  ObjekBudidayaController.updateObjekBudidaya
);
router.delete(
  "/:id",
  auditMiddleware({ model: ObjekBudidaya, tableName: "ObjekBudidaya" }),
  ObjekBudidayaController.deleteObjekBudidaya
);

module.exports = router;
