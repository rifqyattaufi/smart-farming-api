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
        type: DataTypes.INTEGER,
        validate: {
          isInt: true,
          min: 0,
        },
        comment: "Estimasi total kuantitas sebelum panen",
      },
      realisasiPanen: {
        type: DataTypes.INTEGER,
        validate: {
          isInt: true,
          min: 0,
        },
        comment:
          "Total dari semua grade yang dipanen + yang tidak ter-grade jika ada",
      },
      gagalPanen: {
        type: DataTypes.INTEGER,
        validate: {
          isInt: true,
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
      tableName: "panenKebun",
      freezeTableName: true,
    }
  );

  PanenKebun.associate = (models) => {
    PanenKebun.belongsTo(models.Komoditas, {
      foreignKey: "komoditasId",
      as: "komoditas",
    });
    PanenKebun.belongsTo(models.Laporan);
    PanenKebun.hasMany(models.PanenRincianGrade);
  };

  return PanenKebun;
};
