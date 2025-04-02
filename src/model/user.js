const { DataTypes } = require("sequelize");
const db = require("../config/database");
const { encrypt } = require("../config/bcrypt");
const moment = require("moment/moment");

const User = db.define(
  "User",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
      set(value) {
        this.setDataValue("email", value.toLowerCase());
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      set(value) {
        this.setDataValue("password", encrypt(value));
      },
    },
    role: {
      type: DataTypes.ENUM,
      values: ["inventor", "user", "petugas", "pjawab"],
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    expiredTime: {
      type: DataTypes.DATE,
      set(value) {
        if (value !== null) {
          this.setDataValue("expiredTime", moment(value).add(1, "hours"));
        } else {
          this.setDataValue("expiredTime", null);
        }
      },
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    freezeTableName: true,
  }
);

db.sync();

module.exports = User;
