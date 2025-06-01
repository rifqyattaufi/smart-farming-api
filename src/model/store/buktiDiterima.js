module.exports = (sequelize, DataTypes) => {
  const BuktiDiterima = sequelize.define(
    "BuktiDiterima",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
        unique: true,
      },
      fotoBukti: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      tableName: "buktiDiterima",
      freezeTableName: true,
      timestamps: true,
    }
  );

  BuktiDiterima.associate = (models) => {
    BuktiDiterima.hasOne(models.Pesanan, {
      foreignKey: 'buktiDiterimaId',
      as: 'pesanan'
    });
  };

  return BuktiDiterima;
};