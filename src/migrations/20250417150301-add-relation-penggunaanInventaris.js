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
    await queryInterface.addColumn("penggunaanInventaris", "inventarisId", {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: "inventaris",
        key: "id",
      },
      after: "id",
    });
    await queryInterface.addColumn("penggunaanInventaris", "laporanId", {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: "laporan",
        key: "id",
      },
      after: "inventarisId",
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn("penggunaanInventaris", "inventarisId");
    await queryInterface.removeColumn("penggunaanInventaris", "laporanId");
  }
};
