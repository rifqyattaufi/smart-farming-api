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
    await queryInterface.addColumn("komoditas", "satuanId", {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: "satuan",
        key: "id",
      },
      after: "id",
    });
    await queryInterface.addColumn("komoditas", "jenisBudidayaId", {
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
    await queryInterface.removeColumn("komoditas", "satuanId");
    await queryInterface.removeColumn("komoditas", "jenisBudidayaId");
  }
};
