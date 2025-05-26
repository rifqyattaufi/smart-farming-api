const { where } = require("sequelize");
const { admin, firebaseApp } = require("../src/config/firebaseAdmin");
const sequelize = require("../src/model/index");
const User = sequelize.User;
const { Op } = require("sequelize");

async function sendNotificationToUser(
  targetRole,
  title,
  body,
  dataPayload = {}
) {
  if (!firebaseApp) {
    console.error("Firebase Admin SDK not initialized. Notification not sent.");
    return {
      successCount: 0,
      failureCount: 0,
      error: "Firebase Admin SDK not initialized",
    };
  }

  let usersWithToken;

  try {
    if (targetRole != "all") {
      usersWithToken = await User.findAll({
        where: {
          role: targetRole,
          fcmToken: {
            [Op.not]: null,
            [Op.ne]: "",
          },
        },
        attributes: ["fcmToken"],
      });
    } else {
      usersWithToken = await User.findAll({
        where: {
          fcmToken: {
            [Op.not]: null,
            [Op.ne]: "",
          },
        },
        attributes: ["fcmToken"],
      });
    }

    const tokens = usersWithToken
      .map((user) => user.fcmToken)
      .filter((token) => token);

    if (tokens.length === 0) {
      console.log(
        `No users found with role "${targetRole}" and valid FCM tokens. Notification for "${title}" not sent.`
      );
      return { successCount: 0, failureCount: 0, results: [] };
    }

    const stringDataPayload = {};
    for (const key in dataPayload) {
      if (Object.hasOwnProperty.call(dataPayload, key)) {
        stringDataPayload[key] = String(dataPayload[key]);
      }
    }

    const message = {
      notification: {
        title: title,
        body: body,
      },
      data: stringDataPayload,
      tokens: tokens,
      android: {
        priority: "high",
        notification: {
          sound: "default",
        },
      },
    };

    const response = await admin.messaging().sendEachForMulticast(message);
    console.log(
      `${response.successCount} messages were sent successfully to role "${targetRole}" for title: "${title}".`
    );

    if (response.failureCount > 0) {
      const failedTokensInfo = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          const failedToken = tokens[idx];
          failedTokensInfo.push({
            token: failedToken,
            error: resp.error.message,
            code: resp.error.code,
          });
          if (
            [
              "messaging/invalid-registration-token",
              "messaging/registration-token-not-registered",
            ].includes(resp.error.code)
          ) {
            User.update(
              { fcmToken: null },
              { where: { fcmToken: failedToken } }
            )
              .then(() =>
                console.log(`Invalid FCM token removed: ${failedToken}`)
              )
              .catch((err) =>
                console.error(
                  `Error removing invalid FCM token ${failedToken}:`,
                  err
                )
              );
          }
        }
      });
      console.error(
        `Failed to send ${response.failureCount} messages. Details:`,
        JSON.stringify(failedTokensInfo, null, 2)
      );
    }
  } catch (error) {
    console.error(
      `Error in sendNotificationToRole for role "${targetRole}", title "${title}":`,
      error
    );
    return { successCount: 0, failureCount: 0, error: error.message };
  }
}

module.exports = {
  sendNotificationToUser,
};
