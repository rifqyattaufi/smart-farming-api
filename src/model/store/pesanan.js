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
      tableName: "pesanan",
      freezeTableName: true,
      timestamps: true,
    }
  );

  Pesanan.associate = (models) => {
    Pesanan.belongsTo(models.User);
    Pesanan.belongsTo(models.Toko);
    Pesanan.hasMany(models.PesananDetail);
    Pesanan.belongsTo(models.MidtransOrder);
    Pesanan.belongsTo(models.BuktiDiterima);
  };

  return Pesanan;
};
