module.exports = (sequelize, DataTypes) => {
  const JenisBudidaya = sequelize.define(
    "JenisBudidaya",
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
      latin: {
        type: DataTypes.STRING,
      },
      status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      detail: {
        type: DataTypes.TEXT,
      },
      tipe: {
        type: DataTypes.ENUM,
        values: ["hewan", "tumbuhan"],
        allowNull: false,
        validate: {
          isIn: [["hewan", "tumbuhan"]],
        },
      },
      gambar: {
        type: DataTypes.STRING,
      },
      periodePanen: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
      },
      isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      tableName: "jenisBudidaya",
      freezeTableName: true,
    }
  );

  JenisBudidaya.associate = (models) => {
    JenisBudidaya.hasMany(models.UnitBudidaya);
    JenisBudidaya.hasMany(models.Komoditas);
  };

  return JenisBudidaya;
};
