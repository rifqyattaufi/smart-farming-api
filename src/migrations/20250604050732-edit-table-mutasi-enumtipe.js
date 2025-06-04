'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('mutasi_saldo_user', 'tipeTransaksi', {
      type: Sequelize.ENUM(
        'penarikan_dana',
        'pendapatan_masuk_penjual',
        'refund_masuk',
        'penarikan_dibatalkan_dikembalikan',
        'refund_pesanan_pembeli'
      )
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('mutasi_saldo_user', 'tipeTransaksi', {
      type: Sequelize.ENUM(
        'penarikan_dana',
        'pendapatan_masuk_penjual',
        'refund_masuk',
        'penarikan_dibatalkan_dikembalikan',
      )
    });
  }
};