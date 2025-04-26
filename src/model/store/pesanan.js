module.exports = (sequelize, DataTypes) => {
  const Pesanan = sequelize.define(
    "Pesanan",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
        unique: true,
      },
      status: {
        type: DataTypes.ENUM,
        values: ["menunggu", "diterima", "selesai", "ditolak"],
      },
      totalHarga: {
        type: DataTypes.INTEGER,
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

  Pesanan.associate = (models) => {
    Pesanan.belongsTo(models.User);
    Pesanan.hasMany(models.PesananDetail);
  };

  return Pesanan;
};
