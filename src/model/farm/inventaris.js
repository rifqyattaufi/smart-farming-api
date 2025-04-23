module.exports = (sequelize, DataTypes) => {
  const Inventaris = sequelize.define(
    "Inventaris",
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
      jumlah: {
        type: DataTypes.DOUBLE,
      },
      gambar: {
        type: DataTypes.STRING,
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

  Inventaris.associate = (models) => {
    Inventaris.hasMany(models.PenggunaanInventaris);
    Inventaris.hasMany(models.Vitamin);

    Inventaris.belongsTo(models.KategoriInventaris, {
      foreignKey: "kategoriInventarisId",
    });

    Inventaris.belongsTo(models.Satuan);
  };

  return Inventaris;
};
