module.exports = (sequelize, DataTypes) => {
  const KategoriInventaris = sequelize.define(
    "KategoriInventaris",
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
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: true,
        },
      },
      isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      tableName: "kategoriInventaris",
      freezeTableName: true,
    }
  );

  KategoriInventaris.associate = (models) => {
    KategoriInventaris.hasMany(models.Inventaris, {
      foreignKey: "kategoriInventarisId",
    });
  };

  return KategoriInventaris;
};
