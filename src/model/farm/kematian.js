module.exports = (sequelize, DataTypes) => {
  const Kematian = sequelize.define(
    "Kematian",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
        unique: true,
      },
      tanggal: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      penyebab: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      tableName: "kematian",
      freezeTableName: true,
    }
  );

  Kematian.associate = (models) => {
    Kematian.belongsTo(models.Laporan);
  };

  return Kematian;
};
