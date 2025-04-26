module.exports = (sequelize, DataTypes) => {
  const Toko = sequelize.define(
    "Toko",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
        unique: true,
      },
      nama: {
        type: DataTypes.STRING,
      },
      phone: {
        type: DataTypes.STRING,
      },
      alamat: {
        type: DataTypes.STRING,
      },
      logoToko: {
        type: DataTypes.STRING,
      },
      deskripsi: {
        type: DataTypes.TEXT,
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

  Toko.associate = (models) => {
    Toko.hasMany(models.Produk);
    Toko.hasMany(models.Pesanan);

    Toko.belongsTo(models.User);
  };

  return Toko;
};
