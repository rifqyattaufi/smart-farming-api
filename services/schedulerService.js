const cron = require("node-cron");
const moment = require("moment");
const { Op, where } = require("sequelize");
const sequelize = require("../src/model/index");
const GlobalNotificationSetting = sequelize.GlobalNotificationSetting;
const ScheduledUnitNotification = sequelize.ScheduledUnitNotification;
const UnitBudidaya = sequelize.UnitBudidaya;
const { sendNotificationToUser } = require("./notificationService");

async function checkAndSendScheduledNotifications() {
  const now = moment();
  console.log(
    `[${now.format("YYYY-MM-DD HH:mm:ss Z")}] Scheduler: Running checks...`
  );

  try {
    const globalSetting = await GlobalNotificationSetting.findAll({
      where: {
        isActive: true,
        isDeleted: false,
      },
    });

    for (const setting of globalSetting) {
      let send = false;
      const title = setting.title;
      const message = setting.messageTemplate;
      const targetRole = setting.targetRole;
      const lastTriggered = setting.lastTriggered
        ? moment(setting.lastTriggered)
        : null;

      if (setting.notificationType == "repeat") {
        const recurringTimeParts = setting.scheduledTime.split(":").map(Number);

        if (
          now.hours() === recurringTimeParts[0] &&
          now.minutes() === recurringTimeParts[1]
        ) {
          if (lastTriggered) {
            if (!lastTriggered.isSame(now, "day")) {
              send = true;
            }
          } else {
            send = true;
          }
        }
      } else if (setting.notificationType === "once") {
        if (!lastTriggered) {
          const onceDatetime = moment(setting.scheduledDate);

          if (onceDatetime.isSameOrBefore(now)) {
            send = true;
          }
        }
      }

      if (send) {
        console.log(
          `[GLOBAL][${now.format(
            "HH:mm"
          )}] Sending: "${title}" to role ${targetRole}`
        );
        await sendNotificationToUser(targetRole, title, message, {
          notificationType: "GLOBAL",
          settingId: setting.id,
        });
        await setting.update({ lastTriggered: now.toDate() });
      }
    }
  } catch (error) {
    console.error(
      `[${moment().format()}] Scheduler Error (GlobalNotificationSetting):`,
      error
    );
  }

  try {
    const unitSchedules = await ScheduledUnitNotification.findAll({
      include: [
        {
          model: UnitBudidaya,
          attributes: ["id", "nama"],
        },
      ],
      where: {
        isActive: true,
        isDeleted: false,
      },
    });

    for (const schedule of unitSchedules) {
      let shouldSendUnitSchedule = false;

      const scheduledTimeParts = schedule.scheduledTime.split(":").map(Number);

      const lastUnitTriggered = schedule.lastTriggered
        ? moment(schedule.lastTriggered)
        : null;

      if (
        now.hours() === scheduledTimeParts[0] &&
        now.minutes() === scheduledTimeParts[1]
      ) {
        let frequencyMatch = false;
        if (schedule.notificationType === "daily") {
          frequencyMatch = true;
        } else if (schedule.notificationType === "weekly") {
          if (now.day() === schedule.dayOfWeek) {
            frequencyMatch = true;
          }
        } else if (schedule.notificationType === "monthly") {
          if (now.date() === schedule.dayOfMonth) {
            frequencyMatch = true;
          }
        }

        if (frequencyMatch) {
          if (lastUnitTriggered) {
            if (!lastUnitTriggered.isSame(now, "day")) {
              shouldSendUnitSchedule = true;
            }
          } else {
            shouldSendUnitSchedule = true;
          }
        }
      }

      if (shouldSendUnitSchedule) {
        const title = schedule.title;
        const message = schedule.messageTemplate;

        console.log(
          `[UNIT][${now.format("HH:mm")}] Sending: "${title}" to PETUGAS`
        );
        await sendNotificationToUser("petugas", title, message, {
          notificationType: "UNIT_SCHEDULE",
          unitBudidayaId: schedule.UnitBudidaya.id,
          scheduleId: schedule.id,
        });

        await schedule.update({ lastTriggered: now.toDate() });
      }
    }
  } catch (error) {
    console.error(
      `[${moment().format()}] Scheduler Error (ScheduledUnitReport):`,
      error
    );
  }
}

function startScheduler() {
  cron.schedule("* * * * *", checkAndSendScheduledNotifications, {
    scheduled: true,
  });
  console.log(
    `Notification scheduler started. Running every minute. App Timezone: Asia/Jakarta. Current Time for Scheduler: ${moment().format(
      "YYYY-MM-DD HH:mm:ss Z"
    )}`
  );
  checkAndSendScheduledNotifications();
  // Opsional: jalankan sekali saat start untuk testing
}

module.exports = {
  startScheduler,
};
