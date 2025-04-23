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
      laporanID: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "Laporan",
          key: "id",
        },
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
