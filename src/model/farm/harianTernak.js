module.exports = (sequelize, DataTypes) => {
  const HarianTernak = sequelize.define(
    "HarianTernak",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
        unique: true,
      },
      pakan: {
        type: DataTypes.BOOLEAN,
      },
      cekKandang: {
        type: DataTypes.BOOLEAN,
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

  HarianTernak.associate = (models) => {
    HarianTernak.belongsTo(models.Laporan);
  };

  return HarianTernak;
};
