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
    await queryInterface.addColumn("vitamin", "laporanId", {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: "laporan",
        key: "id",
      },
      after: "id",
    });
    await queryInterface.addColumn("vitamin", "inventarisId", {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: "inventaris",
        key: "id",
      },
      after: "laporanId",
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn("vitamin", "laporanId");
    await queryInterface.removeColumn("vitamin", "inventarisId");
  }
};
