'use strict';
const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    const SaldoUser = sequelize.define(
        "SaldoUser", 
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
                allowNull: false,
                unique: true,
            },
            userId: {
                type: DataTypes.UUID,
                allowNull: false,
                unique: true, 
            },
            saldoTersedia: {
                type: DataTypes.DECIMAL(15, 2),
                allowNull: false,
                defaultValue: 0.00
            },
            createdAt: {
                allowNull: false,
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW 
            },
            updatedAt: {
                allowNull: false,
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW 
            }
        },
        {
            tableName: "saldo_user", 
            freezeTableName: true,
        }
    );

    SaldoUser.associate = function (models) {
        SaldoUser.belongsTo(models.User, {
            foreignKey: "userId",
            as: "user",
        });
    };

    return SaldoUser;
};