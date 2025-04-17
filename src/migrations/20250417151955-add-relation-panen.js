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
    await queryInterface.addColumn("panen", "laporanID", {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: "laporan",
        key: "id",
      },
      after: "id",
    });
    await queryInterface.addColumn("panen", "komoditasID", {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: "komoditas",
        key: "id",
      },
      after: "laporanID",
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn("panen", "laporanID");
    await queryInterface.removeColumn("panen", "komoditasID");
  }
};
