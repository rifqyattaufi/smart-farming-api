module.exports = (sequelize, DataTypes) => {
  const HarianKebun = sequelize.define(
    "HarianKebun",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
        unique: true,
      },
      penyiraman: {
        type: DataTypes.BOOLEAN,
      },
      pruning: {
        type: DataTypes.BOOLEAN,
      },
      repotting: {
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

  HarianKebun.associate = (models) => {
    HarianKebun.belongsTo(models.Laporan);
  };

  return HarianKebun;
};
