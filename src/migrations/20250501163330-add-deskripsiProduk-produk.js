'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('produk', 'deskripsi', {
      type: Sequelize.TEXT,
      allowNull: false,
      after: 'nama',
    });
  },

  async down(queryInterface, Sequelize) {
  
    await queryInterface.removeColumn('produk', 'deskripsi');
  }
};