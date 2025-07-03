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

    await queryInterface.addColumn("komoditas", "tipeKomoditas", {
      type: Sequelize.ENUM("individu", "kolektif"),
      allowNull: true,
      defaultValue: "kolektif",
      after: "jumlah",
    });
    await queryInterface.addColumn("komoditas", "hapusObjek", {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      defaultValue: false,
      after: "jumlah",
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn("komoditas", "tipeKomoditas");
    await queryInterface.removeColumn("komoditas", "hapusObjek");
  },
};
