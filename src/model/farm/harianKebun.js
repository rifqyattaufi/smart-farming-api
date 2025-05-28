module.exports = (sequelize, DataTypes) => {
  const HarianKebun = sequelize.define(
    "HarianKebun",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
        unique: true,
      },
      penyiraman: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        validate: {
          isIn: [[true, false]],
        },
      },
      pruning: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        validate: {
          isIn: [[true, false]],
        },
      },
      repotting: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        validate: {
          isIn: [[true, false]],
        },
      },
      tinggiTanaman: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        validate: {
          isFloat: true,
          min: 0,
        },
      },
      kondisiDaun: {
        type: DataTypes.ENUM,
        values: ["sehat", "kering", "layu", "kuning", "keriting", "bercak", "rusak"],
        allowNull: false,
        validate: {
          isIn: [["sehat", "kering", "layu", "kuning", "keriting", "bercak", "rusak"]],
        },
      },
      statusTumbuh: {
        type: DataTypes.ENUM,
        values: ["bibit", "perkecambahan", "vegetatifAwal", "vegetatifLanjut", "generatifAwal", "generatifLanjut", "panen", "dormansi"],
        allowNull: false,
        validate: {
          isIn: [["bibit", "perkecambahan", "vegetatifAwal", "vegetatifLanjut", "generatifAwal", "generatifLanjut", "panen", "dormansi"]],
        },
      },
      isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      tableName: "harianKebun",
      freezeTableName: true,
    }
  );

  HarianKebun.associate = (models) => {
    HarianKebun.belongsTo(models.Laporan);
  };

  return HarianKebun;
};
