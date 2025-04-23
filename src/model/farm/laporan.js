module.exports = (sequelize, DataTypes) => {
  const Laporan = sequelize.define(
    "Laporan",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
        unique: true,
      },
      judul: {
        type: DataTypes.STRING,
      },
      tipe: {
        type: DataTypes.ENUM,
        values: [
          "harian",
          "kematian",
          "sakit",
          "panen",
          "vitamin",
          "hama",
          "inventaris",
        ],
      },
      gambar: {
        type: DataTypes.STRING,
      },
      catatan: {
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

  Laporan.associate = (models) => {
    Laporan.belongsTo(models.User);
    Laporan.belongsTo(models.UnitBudidaya);
    Laporan.belongsTo(models.ObjekBudidaya);

    Laporan.hasOne(models.PenggunaanInventaris);
    Laporan.hasOne(models.HarianTernak);
    Laporan.hasOne(models.HarianKebun);
    Laporan.hasOne(models.Kematian);
    Laporan.hasOne(models.Vitamin);
    Laporan.hasOne(models.Panen);
    Laporan.hasOne(models.Sakit);
    Laporan.hasOne(models.Hama);
  };

  return Laporan;
};
