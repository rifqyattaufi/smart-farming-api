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
      },
      status: {
        type: DataTypes.BOOLEAN,
      },
      isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      jenisHamaID: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
              model: "JenisHama",
              key: "id",
          },
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

  Hama.associate = (models) => {
    Hama.belongsTo(models.Laporan);
    Hama.belongsTo(models.JenisHama);
  };

  return Hama;
};
