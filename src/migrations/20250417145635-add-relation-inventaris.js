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
    await queryInterface.addColumn("inventaris", "kategoriInventarisId", {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: "kategoriInventaris",
        key: "id",
      },
      after: "id",
    });
    await queryInterface.addColumn("inventaris", "satuanId", {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: "satuan",
        key: "id",
      },
      after: "kategoriInventarisId",
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn("inventaris", "kategoriInventarisId");
    await queryInterface.removeColumn("inventaris", "satuanId");
  }
};
