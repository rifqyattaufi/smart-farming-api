'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      "ALTER TABLE `mutasi_saldo_user` MODIFY COLUMN `tipeTransaksi` ENUM('pendapatan_masuk_penjual', 'penarikan_dana', 'refund_masuk', 'penarikan_dibatalkan_dikembalikan') NOT NULL;"
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      "ALTER TABLE `mutasi_saldo_user` MODIFY COLUMN `tipeTransaksi` ENUM('pendapatan_masuk_penjual', 'penarikan_dana', 'refund_masuk') NOT NULL;"
    );
  }
};