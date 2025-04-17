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
    await queryInterface.addColumn("hama", "laporanID", {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: "laporan",
        key: "id",
      },
      after: "id",
    });
    await queryInterface.addColumn("hama", "jenisHamaID", {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: "jenisHama",
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
    await queryInterface.removeColumn("hama", "laporanID");
    await queryInterface.removeColumn("hama", "jenisHamaID");
  }
};
