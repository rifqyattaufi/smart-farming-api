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
      isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      freezeTableName: true,
    }
  );

  Rekening.associate = (models) => {
    Rekening.belongsTo(models.User);
  };
};
