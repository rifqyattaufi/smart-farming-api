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
    await queryInterface.addColumn("unitBudidaya", "jenisBudidayaId", {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: "jenisBudidaya",
        key: "id",
      },
      after: "id",
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn("unitBudidaya", "jenisBudidayaId");
  }
};
