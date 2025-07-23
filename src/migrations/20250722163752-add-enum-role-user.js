'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('user', 'role', {
      type: Sequelize.ENUM('user', 'inventor', 'penjual', 'pjawab', 'petugas', 'admin'),
      allowNull: false,
      defaultValue: 'user'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('user', 'role', {
      type: Sequelize.ENUM('user', 'inventor', 'penjual', 'pjawab', 'petugas'),
      allowNull: false,
      defaultValue: 'user'
    });
  }
};