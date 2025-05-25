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
    await queryInterface.changeColumn("sakit", "penyakit", {
      type: Sequelize.STRING,
      allowNull: false,
    });
    
    await queryInterface.changeColumn("kematian", "tanggal", {
      type: Sequelize.DATE,
      allowNull: false,
    });
    
    await queryInterface.changeColumn("kematian", "penyebab", {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await queryInterface.changeColumn("vitamin", "jumlah", {
      type: Sequelize.DOUBLE,
      allowNull: false,
    });

    await queryInterface.changeColumn("vitamin", "tipe", {
      type: Sequelize.ENUM("vitamin", "vaksin", "pupuk", "disinfektan"),
      allowNull: false,
    });

  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.changeColumn("sakit", "penyakit", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.changeColumn("kematian", "tanggal", {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.changeColumn("kematian", "penyebab", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.changeColumn("vitamin", "jumlah", {
      type: Sequelize.DOUBLE,
      allowNull: true,
    });

    await queryInterface.changeColumn("vitamin", "tipe", {
      type: Sequelize.ENUM("vitamin", "vaksin", "pupuk", "disinfektan"),
      allowNull: true,
    });
  }
};
