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
     await queryInterface.removeIndex('satuan', 'nama');
     await queryInterface.removeIndex('kategoriInventaris', 'nama');
     await queryInterface.changeColumn("jenisHama", "nama", {
      type: Sequelize.STRING,
      allowNull: false,
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
      await queryInterface.addIndex('satuan', ['nama'], {
        unique: true,
        name: 'nama'
      });

      await queryInterface.addIndex('kategoriInventaris', ['nama'], {
        unique: true,
        name: 'nama'
      });

      await queryInterface.changeColumn("jenisHama", "nama", {
        type: Sequelize.STRING,
        allowNull: true,
      });
  }
};
