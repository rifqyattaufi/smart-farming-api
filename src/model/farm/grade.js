module.exports = (sequelize, DataTypes) => {
  const Grade = sequelize.define(
    "Grade",
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
        comment: "Contoh: Grade A, Super, Premium, Rusak, BS",
      },
      deskripsi: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      tableName: "grade",
      freezeTableName: true,
    }
  );

  Grade.associate = (models) => {
    Grade.hasMany(models.PanenRincianGrade, {
      foreignKey: "gradeId",
    });
  };

  return Grade;
};