'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // First add the new totalHarga column
    await queryInterface.addColumn('pesanan', 'totalHarga', {
      type: Sequelize.INTEGER,
      allowNull: true
    });

    // Copy data from jumlahBayar to totalHarga
    await queryInterface.sequelize.query(`
      UPDATE pesanan
      SET totalHarga = jumlahBayar
      WHERE jumlahBayar IS NOT NULL
    `);

    // Remove the old jumlahBayar column
    await queryInterface.removeColumn('pesanan', 'jumlahBayar');
  },

  async down(queryInterface, Sequelize) {
    // First add back the jumlahBayar column
    await queryInterface.addColumn('pesanan', 'jumlahBayar', {
      type: Sequelize.INTEGER,
      allowNull: true
    });

    // Copy data from totalHarga to jumlahBayar
    await queryInterface.sequelize.query(`
      UPDATE pesanan
      SET jumlahBayar = totalHarga
      WHERE totalHarga IS NOT NULL
    `);

    // Remove the totalHarga column
    await queryInterface.removeColumn('pesanan', 'totalHarga');
  }
};