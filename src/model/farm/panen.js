module.exports = (sequelize, DataTypes) => {
  const Panen = sequelize.define(
    "Panen",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
        unique: true,
      },
      jumlah: {
        type: DataTypes.DOUBLE,
      },
      isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      tableName: "panen",
      freezeTableName: true,
    }
  );

  Panen.associate = (models) => {
    Panen.belongsTo(models.Komoditas, {
      foreignKey: "komoditasId",
    });
    Panen.belongsTo(models.Laporan);
  };

  return Panen;
};
