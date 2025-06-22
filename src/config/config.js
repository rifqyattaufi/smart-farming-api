require("dotenv").config();

module.exports = {
  development: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: "mysql",
    dialectOptions: {
      charset: "utf8mb4",
      supportBigNumbers: true,
      bigNumberStrings: true,
    },
    // timezone: "+07:00",
    // logging: (...args) => console.log(...args),
    // dialectOptions: {
    //   useUTC: false,
    // },
    // timezone: "Asia/Jakarta",
  },
  test: {
    dialect: "sqlite",
    storage: ":memory:",
    logging: false,
    timezone: "+07:00",
  },
  production: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: "mysql",
    timezone: "+07:00",
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
      charset: "utf8mb4",
      collation: "utf8mb4_unicode_ci",
      supportBigNumbers: true,
      bigNumberStrings: true,
      connectTimeout: 60000,
    },
    // Hooks for setting charset properly on Azure
    hooks: {
      afterConnect: async (connection) => {
        try {
          // Use promise() method for proper async handling
          const promiseConnection = connection.promise();
          await promiseConnection.query(
            "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
          );
          await promiseConnection.query("SET character_set_client = utf8mb4");
          await promiseConnection.query(
            "SET character_set_connection = utf8mb4"
          );
          await promiseConnection.query("SET character_set_results = utf8mb4");
          await promiseConnection.query(
            "SET collation_connection = utf8mb4_unicode_ci"
          );
          console.log("✅ Force set charset to utf8mb4 on Azure connection");
        } catch (error) {
          console.warn(
            "⚠️  Failed to set charset on connection:",
            error.message
          );
        }
      },
    },
    // dialectOptions: {
    //   useUTC: false,
    // },
    // timezone: "Asia/Jakarta",
  },
};
