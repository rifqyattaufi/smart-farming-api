module.exports = (sequelize, DataTypes) => {
  const Artikel = sequelize.define(
    "Artikel",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
        unique: true,
      },
      judul: {
        type: DataTypes.STRING,
      },
      images: {
        type: DataTypes.STRING,
      },
      deskripsi: {
        type: DataTypes.TEXT,
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

  Artikel.associate = (models) => {
    Artikel.belongsTo(models.User);
  };

  return Artikel;
};
