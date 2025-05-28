const express = require("express");
const router = express.Router();
const scheduledUnitNotificationController = require("../../controller/farm/scheduledUnitNotification.js");
const auditMiddleware = require("../../middleware/auditTrail.js");

const sequelize = require("../../model/index");
const ScheduledUnitNotification = sequelize.ScheduledUnitNotification;

router.get(
  "/",
  scheduledUnitNotificationController.getScheduledUnitNotifications
);

router.get(
  "/:id",
  scheduledUnitNotificationController.getScheduledUnitNotificationById
);

router.get(
  "/unitBudidaya/:unitBudidayaId",
  scheduledUnitNotificationController.getScheduledUnitNotificationsByUnitBudidayaId
);

router.post(
  "/",
  auditMiddleware({
    model: ScheduledUnitNotification,
    tableName: "ScheduledUnitNotification",
  }),
  scheduledUnitNotificationController.createScheduledUnitNotification
);

router.put(
  "/:id",
  auditMiddleware({
    model: ScheduledUnitNotification,
    tableName: "ScheduledUnitNotification",
  }),
  scheduledUnitNotificationController.updateScheduledUnitNotification
);

router.delete(
  "/:id",
  auditMiddleware({
    model: ScheduledUnitNotification,
    tableName: "ScheduledUnitNotification",
  }),
  scheduledUnitNotificationController.deleteScheduledUnitNotification
);

module.exports = router;
