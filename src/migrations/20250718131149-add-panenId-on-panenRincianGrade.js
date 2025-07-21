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

    await queryInterface.addColumn("panenRincianGrade", "panenId", {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: "panen",
        key: "id",
      },
      after: "id",
    });
    await queryInterface.changeColumn("panenRincianGrade", "panenKebunId", {
      type: Sequelize.UUID,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */

    await queryInterface.removeColumn("panenRincianGrade", "panenId");
    await queryInterface.changeColumn("panenRincianGrade", "panenKebunId", {
      allowNull: false,
    });
  },
};
