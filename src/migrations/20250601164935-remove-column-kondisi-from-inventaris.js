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
    await queryInterface.removeColumn('inventaris', 'kondisi');
    await queryInterface.changeColumn('inventaris', 'ketersediaan', {
      type: Sequelize.ENUM('tersedia', 'tidak tersedia'),
      allowNull: false,
      defaultValue: 'tersedia',
      after: 'tanggalKadaluwarsa',
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.addColumn('inventaris', 'kondisi', {
      type: Sequelize.ENUM('baik', 'rusak'),
      allowNull: true,
      defaultValue: 'baik',
      after: 'ketersediaan',
    });
    await queryInterface.changeColumn('inventaris', 'ketersediaan', {
      type: Sequelize.ENUM('tersedia', 'tidak tersedia', 'kadaluwarsa'),
      allowNull: false,
      defaultValue: 'tersedia',
      after: 'tanggalKadaluwarsa',
    });
  }
};
