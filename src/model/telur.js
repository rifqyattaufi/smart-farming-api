const { DataTypes } = require("sequelize");
const db = require("../config/database");
const Ayam = require("./ayam");

const Telur = db.define(
  "Telur",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    jumlah: {
      type: DataTypes.INTEGER,
      allowNull: false,
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

module.exports = Telur;
