const Sequilize = require("sequelize");

const db = new Sequilize(
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
  }
);

module.exports = db;
