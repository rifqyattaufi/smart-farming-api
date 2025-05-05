module.exports = (sequelize, DataTypes) => {
  const PesananDetail = sequelize.define(
    "PesananDetail",
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
      },
      isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      tableName: "pesananDetail",
      freezeTableName: true,
    }
  );

  PesananDetail.associate = (models) => {
    PesananDetail.belongsTo(models.Pesanan);
    PesananDetail.belongsTo(models.Produk);
  };

  return PesananDetail;
};
