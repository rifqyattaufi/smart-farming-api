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
      satuanId: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
              model: "Satuan",
              key: "id",
          },
      },
      kategoriInventarisId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "KategoriInventaris",
          key: "id",
        },
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
