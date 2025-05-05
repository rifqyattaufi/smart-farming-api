module.exports = (sequelize, DataTypes) => {
  const Keranjang = sequelize.define(
    "Keranjang",
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
      tableName: "keranjang",
      freezeTableName: true,
    }
  );

  Keranjang.associate = (models) => {
    Keranjang.belongsTo(models.User);
    Keranjang.belongsTo(models.Produk);
  };

  return Keranjang;
};
