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
     await queryInterface.addColumn('inventaris', 'desc', {
      type: Sequelize.STRING,
      after: 'gambar',
    });

    await queryInterface.addColumn('inventaris', 'tanggalKadaluwarsa', {
      type: Sequelize.DATE,
      after: 'desc',
    });

    await queryInterface.addColumn('inventaris', 'ketersediaan', {
      type: Sequelize.ENUM('tersedia', 'tidak tersedia', 'kadaluwarsa'),
      allowNull: false,
      defaultValue: 'tersedia',
      after: 'tanggalKadaluwarsa',
    });

    await queryInterface.addColumn('inventaris', 'kondisi', {
      type: Sequelize.ENUM('baik', 'rusak'),
      allowNull: false,
      defaultValue: 'baik',
      after: 'ketersediaan',
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn('inventaris', 'kondisi');
    await queryInterface.removeColumn('inventaris', 'ketersediaan');
    await queryInterface.removeColumn('inventaris', 'tanggalKadaluwarsa');
    await queryInterface.removeColumn('inventaris', 'desc');
  }
};
