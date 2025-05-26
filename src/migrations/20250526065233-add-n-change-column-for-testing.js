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
    await queryInterface.changeColumn('jenisBudidaya', 'tipe', {
      type: Sequelize.ENUM,
      values: ['hewan', 'tumbuhan'],
      allowNull: false,
      validate: {
        isIn: [['hewan', 'tumbuhan']],
      },
    });

    await queryInterface.changeColumn('harianTernak', 'pakan', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      validate: {
        isIn: [[true, false]],
      },
    });
    
    await queryInterface.changeColumn('harianTernak', 'cekKandang', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      validate: {
        isIn: [[true, false]],
      },
    });

    await queryInterface.changeColumn('harianKebun', 'penyiraman', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      validate: {
        isIn: [[true, false]],
      },
    });

    await queryInterface.changeColumn('harianKebun', 'pruning', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      validate: {
        isIn: [[true, false]],
      },
    });

    await queryInterface.changeColumn('harianKebun', 'repotting', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      validate: {
        isIn: [[true, false]],
      },
    });

    await queryInterface.addColumn('harianKebun', 'tinggiTanaman', {
      type: Sequelize.DOUBLE,
      allowNull: false,
      validate: {
        isFloat: true,
        min: 0,
      },
      after: 'repotting',
    });

    await queryInterface.addColumn('harianKebun', 'kondisiDaun', {
      type: Sequelize.ENUM,
      values: ['sehat', 'kering', 'layu', 'kuning', 'keriting', 'bercak', 'rusak'],
      allowNull: false,
      defaultValue: 'sehat',
      validate: {
        isIn: [['sehat', 'kering', 'layu', 'kuning', 'keriting', 'bercak', 'rusak']],
      },
      after: 'tinggiTanaman',
    });

    await queryInterface.addColumn('harianKebun', 'statusTumbuh', {
      type: Sequelize.ENUM,
      values: ['bibit', 'perkecambahan', 'vegetatifAwal', 'vegetatifLanjut', 'generatifAwal', 'generatifLanjut', 'panen', 'dormansi'],
      allowNull: false,
      defaultValue: 'bibit',
      validate: {
        isIn: [['bibit', 'perkecambahan', 'vegetatifAwal', 'vegetatifLanjut', 'generatifAwal', 'generatifLanjut', 'panen', 'dormansi']],
      },
      after: 'kondisiDaun',
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.changeColumn('harianKebun', 'penyiraman', {
      type: Sequelize.BOOLEAN,
      allowNull: true,
    });

    await queryInterface.changeColumn('harianKebun', 'pruning', {
      type: Sequelize.BOOLEAN,
      allowNull: true,
    });

    await queryInterface.changeColumn('harianKebun', 'repotting', {
      type: Sequelize.BOOLEAN,
      allowNull: true,
    });

    await queryInterface.removeColumn('harianKebun', 'tinggiTanaman');
    await queryInterface.removeColumn('harianKebun', 'kondisiDaun');
    await queryInterface.removeColumn('harianKebun', 'statusTumbuh');
  }
};
