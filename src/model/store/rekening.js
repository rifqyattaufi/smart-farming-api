module.exports = (sequelize, DataTypes) => {
  const Rekening = sequelize.define(
    "Rekening",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
        unique: true,
      },
      nomorRekening: {
        type: DataTypes.STRING,
      },
      namaBank: {
        type: DataTypes.STRING,
      },
      namaPenerima: {
        type: DataTypes.STRING,
      },
      isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      tableName: "rekening",
      freezeTableName: true,
    }
  );

  Rekening.associate = (models) => {
    Rekening.belongsTo(models.User);
  };

  return Rekening;
};
