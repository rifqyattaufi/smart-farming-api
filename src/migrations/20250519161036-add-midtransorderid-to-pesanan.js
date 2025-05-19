'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('pesanan', 'MidtransOrderId', {
      type: Sequelize.STRING,
      references: {
        model: 'midtransorders',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('pesanan', 'MidtransOrderId');
  }
};
