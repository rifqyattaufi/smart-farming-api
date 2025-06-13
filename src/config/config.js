require("dotenv").config();

module.exports = {
  development: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: "mysql",
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
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: true,
      },
    },
    // dialectOptions: {
    //   useUTC: false,
    // },
    // timezone: "Asia/Jakarta",
  },
};
