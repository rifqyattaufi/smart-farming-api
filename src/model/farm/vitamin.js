module.exports = (sequelize, DataTypes) => {
  const Vitamin = sequelize.define(
    "Vitamin",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
        unique: true,
      },
      tipe: {
        type: DataTypes.ENUM,
        values: ["vitamin", "vaksin", "pupuk", "disinfektan"],
        allowNull: false,
      },
      jumlah: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
      isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      tableName: "vitamin",
      freezeTableName: true,
    }
  );

  Vitamin.associate = (models) => {
    Vitamin.belongsTo(models.Inventaris, {
      foreignKey: "inventarisId",
      as: "inventaris",
    });
    Vitamin.belongsTo(models.Laporan);
  };

  return Vitamin;
};
