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
        allowNull: false,
        validate: {
          isIn: [[true, false]],
        },
      },
      cekKandang: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        validate: {
          isIn: [[true, false]],
        },
      },
      isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      tableName: "harianTernak",
      freezeTableName: true,
    }
  );

  HarianTernak.associate = (models) => {
    HarianTernak.belongsTo(models.Laporan);
  };

  return HarianTernak;
};
