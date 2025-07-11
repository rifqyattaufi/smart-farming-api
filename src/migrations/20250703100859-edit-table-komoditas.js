'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('komoditas', 'produkId', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'produk',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('komoditas', 'produkId');
  }
};
