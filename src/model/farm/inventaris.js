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
      detail: {
        type: DataTypes.TEXT,
      },
      stokMinim: {
        type: DataTypes.DOUBLE,
      },
      tanggalKadaluwarsa: {
        type: DataTypes.DATE,
      },
      ketersediaan: {
        type: DataTypes.ENUM("tersedia", "tidak tersedia", "kadaluwarsa"),
        allowNull: false,
        defaultValue: "tersedia",
      },
      kondisi: {
        type: DataTypes.ENUM("baik", "rusak"),
        allowNull: false,
        defaultValue: "baik",
      },
      isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      tableName: "inventaris",
      freezeTableName: true,
    }
  );

  Inventaris.associate = (models) => {
    Inventaris.hasMany(models.PenggunaanInventaris, {
      foreignKey: "inventarisId",
    });
    Inventaris.hasMany(models.Vitamin, {
      foreignKey: "inventarisId",
      as: "vitamin",
    });

    Inventaris.belongsTo(models.KategoriInventaris, {
      foreignKey: "kategoriInventarisId",
      as: "kategoriInventaris",
    });

    Inventaris.belongsTo(models.Satuan);
  };

  return Inventaris;
};
