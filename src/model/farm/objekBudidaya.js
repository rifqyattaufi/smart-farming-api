module.exports = (sequelize, DataTypes) => {
  const ObjekBudidaya = sequelize.define(
    "ObjekBudidaya",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
        unique: true,
      },
      namaId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      deskripsi: {
        type: DataTypes.TEXT,
      },
      isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      unitBudidayaId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "UnitBudidaya",
          key: "id",
        },
      },
    },
    {
      freezeTableName: true,
    }
  );

  ObjekBudidaya.associate = (models) => {
    ObjekBudidaya.hasMany(models.Laporan);

    ObjekBudidaya.belongsTo(models.UnitBudidaya);
  };

  return ObjekBudidaya;
};
