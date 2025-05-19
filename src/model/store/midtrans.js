module.exports = (sequelize, DataTypes) => {
    const MidtransOrder = sequelize.define(
      "MidtransOrder",
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
          allowNull: false,
          unique: true,
        },
        // Currently empty as per your requirements
        // You can add more fields here later as needed, such as:
        // - transactionId
        // - paymentType
        // - status
        // - etc.
      },
      {
        tableName: "midtransOrders",
        freezeTableName: true,
      }
    );
  
    MidtransOrder.associate = (models) => {
      MidtransOrder.hasOne(models.Pesanan); 
    };
  
    return MidtransOrder;
  };