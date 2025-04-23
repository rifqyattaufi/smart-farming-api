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
      inventarisId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "Inventaris",
          key: "id",
        },
      },
      laporanId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "Laporan",
          key: "id",
        },
      },
    },
    {
      freezeTableName: true,
    }
  );

  PenggunaanInventaris.associate = (models) => {
    PenggunaanInventaris.belongsTo(models.Inventaris);
    PenggunaanInventaris.belongsTo(models.Laporan);
  };

  return PenggunaanInventaris;
};
