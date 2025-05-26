module.exports = (sequelize, DataTypes) => {
  const PanenKebun = sequelize.define(
    "PanenKebun",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
        unique: true,
      },
      tanggalPanen: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      estimasiPanen: {
        type: DataTypes.DOUBLE,
        validate: {
          isFloat: true,
          min: 0,
        },
        comment: "Estimasi total kuantitas sebelum panen",
      },
      realisasiPanen: {
        type: DataTypes.DOUBLE,
        validate: {
          isFloat: true,
          min: 0,
        },
        comment: "Total dari semua grade yang dipanen + yang tidak ter-grade jika ada",
      },
      gagalPanen: {
        type: DataTypes.DOUBLE,
        validate: {
          isFloat: true,
          min: 0,
        },
        comment: "Kuantitas yang gagal dipanen/hilang sebelum grading",
      },
      umurTanamanPanen: {
        type: DataTypes.INTEGER,
        validate: {
          isInt: true,
          min: 0,
        },
      },
      isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      tableName: "panenkebun",
      freezeTableName: true,
    }
  );

  PanenKebun.associate = (models) => {
    PanenKebun.belongsTo(models.Komoditas, {
      foreignKey: "komoditasId",
    });
    PanenKebun.belongsTo(models.Laporan);
  };

  return PanenKebun;
};
