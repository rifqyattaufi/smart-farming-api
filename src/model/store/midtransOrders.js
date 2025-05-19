module.exports = (sequelize, DataTypes) => {
  const MidtransOrder = sequelize.define('MidtransOrder', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false
    },
    transaction_id: DataTypes.STRING,
    transaction_status: DataTypes.STRING,
    payment_type: DataTypes.STRING,
    bank: DataTypes.STRING,
    va_number: DataTypes.STRING,
    gross_amount: DataTypes.STRING,
    transaction_time: DataTypes.DATE,
    expiry_time: DataTypes.DATE,
    fraud_status: DataTypes.STRING,
  }, {
    tableName: 'midtransorders',
    timestamps: true,
  });

  MidtransOrder.associate = (models) => {
    MidtransOrder.hasOne(models.Pesanan, {
      foreignKey: 'MidtransOrderId',
      sourceKey: 'id'
    });
  };

  return MidtransOrder;
};
