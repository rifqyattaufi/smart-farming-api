'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('toko', 'TypeToko', {
      type: Sequelize.ENUM('rfc', 'umkm'),
      allowNull: false,
      defaultValue: 'umkm',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('toko', 'TypeToko');

    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_toko_TypeToko";');
  }
};