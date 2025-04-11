// const { DataTypes } = require("sequelize");
// const db = require("../index");

module.exports = (sequelize, DataTypes) => {
  const Telur = sequelize.define(
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

  return Telur;
};

// db.sync();

// module.exports = Telur;
