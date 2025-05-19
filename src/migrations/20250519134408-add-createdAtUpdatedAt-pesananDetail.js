'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('pesanandetail', 'createdAt', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    });

    await queryInterface.addColumn('pesanandetail', 'updatedAt', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('pesanandetail', 'createdAt');

    await queryInterface.removeColumn('pesanandetail', 'updatedAt');
  }
};