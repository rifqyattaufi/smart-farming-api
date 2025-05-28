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
    await queryInterface.createTable('panenKebun', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
        unique: true,
      },
      tanggalPanen: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      estimasiPanen: {
        type: Sequelize.DOUBLE,
        validate: {
          isFloat: true,
          min: 0,
        },
        comment: 'Estimasi total kuantitas sebelum panen',
      },
      realisasiPanen: {
        type: Sequelize.DOUBLE,
        validate: {
          isFloat: true,
          min: 0,
        },
        comment: 'Total dari semua grade yang dipanen + yang tidak ter-grade jika ada',
      },
      gagalPanen: {
        type: Sequelize.DOUBLE,
        validate: {
          isFloat: true,
          min: 0,
        },
        comment: 'Kuantitas yang gagal dipanen/hilang sebelum grading',
      },
      umurTanamanPanen: {
        type: Sequelize.INTEGER,
        validate: {
          isInt: true,
          min: 0,
        },
      },
      komoditasId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'komoditas',
          key: 'id'
        }
      },
      laporanId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'laporan',
          key: 'id'
        }
      },
      isDeleted: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.dropTable('panenkebun');
  }
};
