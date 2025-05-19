'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('pesanan', 'MidtransOrderId', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'midtransOrders',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('pesanan', 'MidtransOrderId', {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'midtransOrders',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  }
};