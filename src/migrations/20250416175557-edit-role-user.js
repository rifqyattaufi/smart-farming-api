"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.changeColumn("user", "role", {
      type: Sequelize.ENUM,
      values: ["inventor", "user", "petugas", "pjawab", "penjual"],
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.changeColumn("user", "role", {
      type: Sequelize.ENUM,
      values: ["inventor", "user", "petugas", "pjawab"],
      allowNull: false,
    });
  },
};
