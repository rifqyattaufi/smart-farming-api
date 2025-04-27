'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('toko', 'tokoStatus', {
      type: Sequelize.ENUM('request', 'active', 'delete', 'reject'),
      allowNull: false,
      defaultValue: 'request',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('toko', 'tokoStatus', {
      type: Sequelize.ENUM('request', 'active', 'delete'),
      allowNull: false,
      defaultValue: 'request',
    });

    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_toko_tokoStatus";');
  }
};