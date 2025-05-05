module.exports = (sequelize, DataTypes) => {
  const Logs = sequelize.define(
    "Logs",
    {
      id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    tableName: DataTypes.STRING,
    action: DataTypes.ENUM("create", "update", "delete"),
    recordId: DataTypes.UUID,
    before: DataTypes.JSON,
    after: DataTypes.JSON,
    changedBy: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    }},
    {
      tableName: "logs",
    }
  );

  Logs.associate = (models) => {
    Logs.belongsTo(models.User);
  };

  return Logs;
};
