'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Menambahkan kolom 'namaPenerima' ke tabel 'rekening'
    await queryInterface.addColumn('rekening', 'namaPenerima', {
      type: Sequelize.STRING,
      allowNull: true, 
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('rekening', 'namaPenerima');
  }
};