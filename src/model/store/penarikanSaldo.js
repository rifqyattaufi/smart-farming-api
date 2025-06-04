'use strict';
const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const PenarikanSaldo = sequelize.define(
    "PenarikanSaldo",
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
      },
      rekeningBankId: { 
        type: DataTypes.UUID,
        allowNull: false,
      },
      jumlahDiminta: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
      },
      biayaAdmin: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
      },
      jumlahDiterima: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM(
          "pending",
          "processing",
          "completed",
          "rejected"
        ),
        allowNull: false,
        defaultValue: "pending",
      },
      tanggalRequest: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      tanggalProses: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      catatanAdmin: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      buktiTransfer: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      referensiBank: {
        type: DataTypes.STRING,
        allowNull: true,
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
      tableName: "penarikan_saldo",
      freezeTableName: true,
    }
  );

  PenarikanSaldo.associate = function (models) {
    PenarikanSaldo.belongsTo(models.User, { 
      foreignKey: "userId",
      as: "user",
    });
    PenarikanSaldo.belongsTo(models.Rekening, { 
      foreignKey: "rekeningBankId",
      as: "rekening",
    });
  };

  return PenarikanSaldo;
};