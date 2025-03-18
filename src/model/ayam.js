const { DataTypes } = require("sequelize");
const db = require("../config/database");
const Kandang = require("./kandang");
const Telur = require("./telur");

const Ayam = db.define(
  "Ayam",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    berat: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    isProductive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    idDeleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    freezeTableName: true,
  }
);

db.sync();

Ayam.hasMany(Telur, {
  foreignKey: "ayamId",
});

module.exports = Ayam;
