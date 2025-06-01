'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('pendapatan', 'tokoId', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'toko',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('pendapatan', 'tokoId');
  }
};