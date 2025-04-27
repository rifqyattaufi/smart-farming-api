"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn("user", "imageProfile");
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn("user", "imageProfile", {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: null,
      after: "phone",
    });
  },
};