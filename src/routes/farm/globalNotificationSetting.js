const express = require("express");
const router = express.Router();
const globalNotificationSettingController = require("../../controller/farm/globalNotificationSetting.js");
const auditMiddleware = require("../../middleware/auditTrail.js");

const sequelize = require("../../model/index");
const GlobalNotificationSetting = sequelize.GlobalNotificationSetting;

router.get(
  "/",
  globalNotificationSettingController.getAllGlobalNotificationSetting
);
router.get(
  "/:id",
  globalNotificationSettingController.getGlobalNotificationSettingById
);
router.post(
  "/",
  auditMiddleware({
    model: GlobalNotificationSetting,
    tableName: "GlobalNotificationSetting",
  }),
  globalNotificationSettingController.createGLobalNotificationSetting
);
router.put(
  "/:id",
  auditMiddleware({
    model: GlobalNotificationSetting,
    tableName: "GlobalNotificationSetting",
  }),
  globalNotificationSettingController.updateGlobalNotificationSetting
);
router.delete(
  "/:id",
  auditMiddleware({
    model: GlobalNotificationSetting,
    tableName: "GlobalNotificationSetting",
  }),
  globalNotificationSettingController.deleteGlobalNotificationSetting
);

module.exports = router;
