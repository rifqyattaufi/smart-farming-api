'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('pesanan', 'status', {
      type: Sequelize.ENUM('menunggu', 'diterima', 'selesai', 'ditolak', 'expired')
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('pesanan', 'status', {
      type: Sequelize.ENUM('menunggu', 'diterima', 'selesai', 'ditolak')
    });
  }
};
