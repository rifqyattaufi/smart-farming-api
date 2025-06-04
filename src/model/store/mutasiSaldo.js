'use strict';
const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const MutasiSaldoUser = sequelize.define(
    "MutasiSaldoUser",
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
      tipeTransaksi: {
        type: DataTypes.ENUM(
          "pendapatan_masuk_penjual",
          "penarikan_dana",
          "refund_pesanan_pembeli",
          "penarikan_dibatalkan_dikembalikan",
        ),
        allowNull: false,
      },
      jumlah: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
      },
      saldoSebelum: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
      },
      saldoSesudah: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
      },
      referensiId: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      referensiTabel: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      keterangan: {
        type: DataTypes.TEXT,
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
      tableName: "mutasi_saldo_user",
      freezeTableName: true,
    }
  );

  MutasiSaldoUser.associate = function (models) {
    MutasiSaldoUser.belongsTo(models.User, {
      foreignKey: "userId",
      as: "user",
    });
  };

  return MutasiSaldoUser;
};