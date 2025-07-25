module.exports = (sequelize, DataTypes) => {
  const Produk = sequelize.define(
    "Produk",
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
      deskripsi: {
        type: DataTypes.TEXT,
      },
      gambar: {
        type: DataTypes.STRING,
      },
      stok: {
        type: DataTypes.INTEGER,
      },
      satuan: {
        type: DataTypes.STRING,
      },
      harga: {
        type: DataTypes.INTEGER,
      },
      isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      tableName: "produk",
      freezeTableName: true,
    }
  );

  Produk.associate = (models) => {
    Produk.belongsTo(models.Toko);
    Produk.hasOne(models.Komoditas);
    Produk.hasMany(models.Keranjang);
    Produk.hasMany(models.PesananDetail);
  };

  return Produk;
};
