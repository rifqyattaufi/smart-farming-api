const e = require("express");
const sequelize = require("../model/index");
const db = sequelize.sequelize;
const Logs = sequelize.Logs;

const logActivity = async (action, tableName, recordId, before, after, changedBy, transaction) => {
  try {
    if (typeof tableName !== 'string') {
      throw new Error('tableName must be a string');
    }

    await Logs.create({
      action, // "create", "update", "delete"
      tableName,
      recordId,
      before,
      after,
      changedBy,
    }, { transaction });
  } catch (error) {
    console.error("Error logging change:", error);
  }
};

// const getAllLogs = async (req, res) => {
//     try {
//       const logs = await Logs.findAll();
//       return res.json({
//         message: "Success get all logs",
//         data: logs,
//       });
//     } catch (error) {
//       res.status(500).json({
//         message: error.message,
//         detail: error,
//       });
//     }
//   };

module.exports = {
  logActivity,
};
