module.exports = (sequelize, DataTypes) => {
  const Satuan = sequelize.define(
    "Satuan",
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
      lambang: {
        type: DataTypes.STRING,
      },
      isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      tableName: "satuan",
      freezeTableName: true,
    }
  );

  Satuan.associate = (models) => {
    Satuan.hasMany(models.Komoditas);
    Satuan.hasMany(models.Inventaris);
  };

  return Satuan;
};
