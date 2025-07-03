module.exports = (sequelize, DataTypes) => {
  const DetailPanen = sequelize.define(
    "DetailPanen",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
        unique: true,
      },
      isDeleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "detailPanen",
      freezeTableName: true,
    }
  );

  DetailPanen.associate = (models) => {
    DetailPanen.belongsTo(models.Panen);
    DetailPanen.belongsTo(models.ObjekBudidaya);
  };

  return DetailPanen;
};
