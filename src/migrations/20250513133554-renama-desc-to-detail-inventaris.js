'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.renameColumn('inventaris', 'desc', 'detail');
    await queryInterface.changeColumn('inventaris', 'detail', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.renameColumn('inventaris', 'detail', 'desc');
    await queryInterface.changeColumn('inventaris', 'desc', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  }
};
