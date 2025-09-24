module.exports = (sequelize, DataTypes) => {
  const PanenRincianGrade = sequelize.define(
    "PanenRincianGrade",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
        unique: true,
      },
      jumlah: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        validate: { isFloat: true, min: 0 },
        comment: "Jumlah dari grade ini yang dipanen",
      },
      isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      tableName: "panenRincianGrade",
      freezeTableName: true,
    }
  );

  PanenRincianGrade.associate = (models) => {
    PanenRincianGrade.belongsTo(models.PanenKebun, {
      foreignKey: "panenKebunId",
      allowNull: true, // Make nullable since livestock harvest won't have this
    });
    PanenRincianGrade.belongsTo(models.Panen, {
      foreignKey: "panenId",
      allowNull: true, // Make nullable since plant harvest won't have this
    });
    PanenRincianGrade.belongsTo(models.Grade, {
      foreignKey: "gradeId",
      allowNull: false,
    });
  };

  return PanenRincianGrade;
};
