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
      },
      jumlah: {
        type: DataTypes.DOUBLE,
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
    });
    Vitamin.belongsTo(models.Laporan);
  };

  return Vitamin;
};
