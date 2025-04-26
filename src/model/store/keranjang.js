module.exports = (sequelize, DataTypes) => {
  const keranjang = sequelize.define(
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
      freezeTableName: true,
    }
  );

  keranjang.associate = (models) => {
    keranjang.belongsTo(models.User);
    keranjang.belongsTo(models.Produk);
  };
};
