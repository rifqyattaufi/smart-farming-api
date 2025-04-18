const { encrypt } = require("../config/bcrypt");
const moment = require("moment/moment");

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
        unique: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
        set(value) {
          this.setDataValue("email", value.toLowerCase());
        },
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: true,
        set(value) {
          if (value !== null) {
            this.setDataValue("password", encrypt(value));
          }
        },
      },
      phone_number: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          isNumeric: true,
        },
      },
      role: {
        type: DataTypes.ENUM,
        values: ["inventor", "pembeli", "penjual", "petugas", "pjawab"],
        allowNull: false,
      },
      avatar_url: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue:
          "https://api.dicebear.com/9.x/thumbs/svg?eyes=variant6W12&mouth=variant2&backgroundColor=5fd15e",
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      expiredTime: {
        type: DataTypes.DATE,
        set(value) {
          if (value !== null) {
            this.setDataValue("expiredTime", moment(value).add(1, "hours"));
          } else {
            this.setDataValue("expiredTime", null);
          }
        },
      },
      isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      oAuthStatus: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
    },
    {
      freezeTableName: true,
    }
  );

  User.associate = function (models) {
    User.hasMany(models.Laporan);
  };

  return User;
};
