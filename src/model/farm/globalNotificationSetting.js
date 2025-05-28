module.exports = (sequelize, DataTypes) => {
  const GlobalNotificationSetting = sequelize.define(
    "GlobalNotificationSetting",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
        unique: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      messageTemplate: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      scheduledTime: {
        type: DataTypes.TIME,
        allowNull: false,
      },
      targetRole: {
        type: DataTypes.ENUM("pjawab", "petugas", "inventor", "all"),
        allowNull: false,
      },
      notificationType: {
        type: DataTypes.ENUM("repeat", "once"),
        allowNull: false,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      lastTriggered: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      tableName: "globalNotificationSetting",
      timestamps: true,
    }
  );

  GlobalNotificationSetting.associate = (models) => {};

  return GlobalNotificationSetting;
};
