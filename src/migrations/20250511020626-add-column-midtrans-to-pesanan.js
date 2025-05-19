'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Create midtransOrder table first
    await queryInterface.createTable('midtransOrders', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      // Add additional fields later as needed
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Remove metodePembayaran column from pesanan table
    await queryInterface.removeColumn('pesanan', 'metodePembayaran');

    // Add MidtransOrderId column to pesanan table
    await queryInterface.addColumn('pesanan', 'MidtransOrderId', {
      type: Sequelize.UUID,
      references: {
        model: 'midtransOrders',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove MidtransOrderId from pesanan table
    await queryInterface.removeColumn('pesanan', 'MidtransOrderId');

    // Add back metodePembayaran column
    await queryInterface.addColumn('pesanan', 'metodePembayaran', {
      type: Sequelize.STRING
    });

    // Drop midtransOrder table
    await queryInterface.dropTable('midtransOrders');
  }
};