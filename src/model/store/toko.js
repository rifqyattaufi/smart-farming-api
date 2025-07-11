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
      tokoStatus: {
        type: DataTypes.ENUM,
        values: ["request", "active", "delete", "reject"],
        defaultValue: "request",
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      TypeToko: {
        type: DataTypes.ENUM,
        values: ['rfc', 'umkm'],
        defaultValue: 'umkm',
      },
    },
    {
      tableName: "toko",
      freezeTableName: true,
    }
  );

  Toko.associate = (models) => {
    Toko.hasMany(models.Produk);
    Toko.hasMany(models.Pesanan);

    Toko.belongsTo(models.User);
    Toko.hasMany(models.Pendapatan, {
      foreignKey: "tokoId",
      as: "pendapatan",
    });
  };

  return Toko;
};
