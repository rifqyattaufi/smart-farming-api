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
    await queryInterface.changeColumn("panenKebun", "estimasiPanen", {
      type: Sequelize.INTEGER,
      validate: {
        isInt: true,
        min: 0
      },
      comment: "Estimasi total kuantitas sebelum panen"
    });

    await queryInterface.changeColumn("panenKebun", "realisasiPanen", {
      type: Sequelize.INTEGER,
      validate: {
        isInt: true,
        min: 0
      },
      comment: "Total dari semua grade yang dipanen + yang tidak ter-grade jika ada"
    });

    await queryInterface.changeColumn("panenKebun", "gagalPanen", {
      type: Sequelize.INTEGER,
      validate: {
        isInt: true,
        min: 0
      },
      comment: "Kuantitas yang gagal dipanen/hilang sebelum grading"
    });

    await queryInterface.changeColumn("panenKebun", "umurTanamanPanen", {
      type: Sequelize.INTEGER,
      validate: {
        isInt: true,
        min: 0
      },
      comment: "Umur tanaman saat panen dalam hari"
    });
    
    await queryInterface.changeColumn("panenRincianGrade", "jumlah", {
      type: Sequelize.INTEGER,
      allowNull: false,
      validate: {
        isInt: true,
        min: 0
      },
      comment: "Jumlah dari grade yang dipanen"
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.changeColumn("panenKebun", "estimasiPanen", {
      type: Sequelize.DOUBLE,
      validate: {
        isFloat: true,
        min: 0
      },
      comment: "Estimasi total kuantitas sebelum panen"
    });

    await queryInterface.changeColumn("panenKebun", "realisasiPanen", {
      type: Sequelize.DOUBLE,
      validate: {
        isFloat: true,
        min: 0
      },
      comment: "Total dari semua grade yang dipanen + yang tidak ter-grade jika ada"
    });

    await queryInterface.changeColumn("panenKebun", "gagalPanen", {
      type: Sequelize.DOUBLE,
      validate: {
        isFloat: true,
        min: 0
      },
      comment: "Kuantitas yang gagal dipanen/hilang sebelum grading"
    });

    await queryInterface.changeColumn("panenKebun", "umurTanamanPanen", {
      type: Sequelize.INTEGER,
      validate: {
        isInt: true,
        min: 0
      } 
    });

    await queryInterface.changeColumn("panenRincianGrade", "jumlah", {
      type: Sequelize.DOUBLE,
      allowNull: false,
      validate: {
        isFloat: true,
        min: 0
      },
      comment: "Jumlah dari grade yang dipanen"
    });
  }
};
