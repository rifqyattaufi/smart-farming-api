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
    await queryInterface.addColumn("scheduledUnitNotification", "tipeLaporan", {
      type: Sequelize.ENUM("panen", "vitamin"),
      allowNull: true,
      defaultValue: null,
      after: "notificationType",
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn(
      "scheduledUnitNotification",
      "tipeLaporan"
    );
  },
};
