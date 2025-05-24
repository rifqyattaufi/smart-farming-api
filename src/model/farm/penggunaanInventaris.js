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
        allowNull: false,
      },
      isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      tableName: "penggunaanInventaris",
      freezeTableName: true,
    }
  );

  PenggunaanInventaris.associate = (models) => {
    PenggunaanInventaris.belongsTo(models.Inventaris);
    PenggunaanInventaris.belongsTo(models.Laporan);
  };

  return PenggunaanInventaris;
};
