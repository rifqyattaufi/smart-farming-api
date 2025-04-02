const { DataTypes } = require("sequelize");
const Ayam = require("./ayam");
const db = require("../../config/database");

const Kandang = db.define(
  "Kandang",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    kategori: {
      type: DataTypes.ENUM,
      values: ["Ayam", "Kepiting", "Lele"],
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

Kandang.hasMany(Ayam, {
  foreignKey: "kandangId",
});

db.sync();

module.exports = Kandang;
