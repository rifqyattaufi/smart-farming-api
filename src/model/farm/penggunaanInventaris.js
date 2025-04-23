const { BelongsTo } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  const PenggunaanInventaris = sequelize.define(
    "PenggunaanInventaris",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
        unique: true,
      },
      jumlah: {
        type: DataTypes.DOUBLE,
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

  PenggunaanInventaris.associate = (models) => {
    PenggunaanInventaris.belongsTo(models.Inventaris, {
      foreignKey: "inventarisId",
    });
    PenggunaanInventaris.belongsTo(models.Laporan);
  };

  return PenggunaanInventaris;
};
