module.exports = (sequelize, DataTypes) => {
  const JenisHama = sequelize.define(
    "JenisHama",
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
      isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      tableName: "jenisHama",
      freezeTableName: true,
    }
  );

  JenisHama.associate = (models) => {
    JenisHama.hasMany(models.Hama);
  };

  return JenisHama;
};
