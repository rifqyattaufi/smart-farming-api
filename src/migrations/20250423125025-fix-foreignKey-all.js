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
    await queryInterface.removeColumn("hama", "laporanID");
    await queryInterface.removeColumn("hama", "jenisHamaID");
    await queryInterface.addColumn("hama", "laporanId", {
      type: Sequelize.UUID,
      references: {
        model: "laporan",
        key: "id",
      },
      after: "id",
    });
    await queryInterface.addColumn("hama", "jenisHamaId", {
      type: Sequelize.UUID,
      references: {
        model: "jenisHama",
        key: "id",
      },
      after: "laporanId",
    });

    await queryInterface.removeColumn("harianKebun", "laporanID");
    await queryInterface.addColumn("harianKebun", "laporanId", {
      type: Sequelize.UUID,
      references: {
        model: "laporan",
        key: "id",
      },
      after: "id",
    });

    await queryInterface.removeColumn("harianTernak", "laporanID");
    await queryInterface.addColumn("harianTernak", "laporanId", {
      type: Sequelize.UUID,
      references: {
        model: "laporan",
        key: "id",
      },
      after: "id",
    });

    await queryInterface.removeColumn("kematian", "laporanID");
    await queryInterface.addColumn("kematian", "laporanId", {
      type: Sequelize.UUID,
      references: {
        model: "laporan",
        key: "id",
      },
      after: "id",
    });

    await queryInterface.removeColumn("panen", "laporanID");
    await queryInterface.removeColumn("panen", "komoditasID");
    await queryInterface.addColumn("panen", "laporanId", {
      type: Sequelize.UUID,
      references: {
        model: "laporan",
        key: "id",
      },
      after: "id",
    });
    await queryInterface.addColumn("panen", "komoditasId", {
      type: Sequelize.UUID,
      references: {
        model: "komoditas",
        key: "id",
      },
      after: "laporanId",
    });

    await queryInterface.removeColumn("sakit", "laporanID");
    await queryInterface.addColumn("sakit", "laporanId", {
      type: Sequelize.UUID,
      references: {
        model: "laporan",
        key: "id",
      },
      after: "id",
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn("hama", "laporanId");
    await queryInterface.removeColumn("hama", "jenisHamaId");
    await queryInterface.addColumn("hama", "laporanID", {
      type: Sequelize.UUID,
      references: {
        model: "laporan",
        key: "id",
      },
      after: "id",
    });
    await queryInterface.addColumn("hama", "jenisHamaID", {
      type: Sequelize.UUID,
      references: {
        model: "jenisHama",
        key: "id",
      },
      after: "laporanID",
    });

    await queryInterface.removeColumn("harianKebun", "laporanId");
    await queryInterface.addColumn("harianKebun", "laporanID", {
      type: Sequelize.UUID,
      references: {
        model: "laporan",
        key: "id",
      },
      after: "id",
    });

    await queryInterface.removeColumn("harianTernak", "laporanId");
    await queryInterface.addColumn("harianTernak", "laporanID", {
      type: Sequelize.UUID,
      references: {
        model: "laporan",
        key: "id",
      },
      after: "id",
    });

    await queryInterface.removeColumn("kematian", "laporanId");
    await queryInterface.addColumn("kematian", "laporanID", {
      type: Sequelize.UUID,
      references: {
        model: "laporan",
        key: "id",
      },
      after: "id",
    });

    await queryInterface.removeColumn("panen", "laporanId");
    await queryInterface.removeColumn("panen", "komoditasId");
    await queryInterface.addColumn("panen", "laporanID", {
      type: Sequelize.UUID,
      references: {
        model: "laporan",
        key: "id",
      },
      after: "id",
    });
    await queryInterface.addColumn("panen", "komoditasID", {
      type: Sequelize.UUID,
      references: {
        model: "komoditas",
        key: "id",
      },
      after: "laporanID",
    });

    await queryInterface.removeColumn("sakit", "laporanId");
    await queryInterface.addColumn("sakit", "laporanID", {
      type: Sequelize.UUID,
      references: {
        model: "laporan",
        key: "id",
      },
      after: "id",
    });
  },
};
