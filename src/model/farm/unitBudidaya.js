module.exports = (sequelize, DataTypes) => {
  const UnitBudidaya = sequelize.define(
    "UnitBudidaya",
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
      lokasi: {
        type: DataTypes.STRING,
      },
      tipe: {
        type: DataTypes.ENUM,
        values: ["kolektif", "individu"],
      },
      luas: {
        type: DataTypes.FLOAT,
      },
      jumlah: {
        type: DataTypes.INTEGER,
      },
      status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      gambar: {
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
      tableName: "unitBudidaya",
      freezeTableName: true,
    }
  );

  UnitBudidaya.associate = (models) => {
    UnitBudidaya.belongsTo(models.JenisBudidaya);

    UnitBudidaya.hasMany(models.Laporan);
    UnitBudidaya.hasMany(models.ObjekBudidaya);
  };

  return UnitBudidaya;
};
