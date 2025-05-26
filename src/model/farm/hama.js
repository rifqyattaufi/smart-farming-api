module.exports = (sequelize, DataTypes) => {
  const Hama = sequelize.define(
    "Hama",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
        unique: true,
      },
      jumlah: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      status: {
        type: DataTypes.BOOLEAN,
      },
      isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      tableName: "hama",
      freezeTableName: true,
    }
  );

  Hama.associate = (models) => {
    Hama.belongsTo(models.Laporan);
    Hama.belongsTo(models.JenisHama);
  };

  return Hama;
};
