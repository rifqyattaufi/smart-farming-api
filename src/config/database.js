const Sequelize = require("sequelize");

const db = new Sequelize(
  process.env.DB_NAME || "db_name",
  process.env.DB_USERNAME || "",
  process.env.DB_PASSWORD || "",
  {
    host: process.env.DB_HOST || "localhost",
    dialect: "mysql",
    dialectOptions: {
      useUTC: false,
    },
    timezone: "Asia/Jakarta",
    logging: false, // Disable debug connection messages
  }
);

module.exports = db;
