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
    await queryInterface.removeColumn("laporan", "unitBudidayaId");
    await queryInterface.removeColumn("laporan", "objekBudidayaId");
    await queryInterface.addColumn("laporan", "unitBudidayaId", {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: "UnitBudidaya",
        key: "id",
      },
      after: "id",
    });
    await queryInterface.addColumn("laporan", "objekBudidayaId", {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: "ObjekBudidaya",
        key: "id",
      },
      after: "unitBudidayaId",
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn("laporan", "unitBudidayaId");
    await queryInterface.removeColumn("laporan", "objekBudidayaId");
    await queryInterface.addColumn("laporan", "unitBudidayaId", {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: "UnitBudidaya",
        key: "id",
      },
      after: "id",
    });
    await queryInterface.addColumn("laporan", "objekBudidayaId", {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: "ObjekBudidaya",
        key: "id",
      },
      after: "unitBudidayaId",
    });
  },
};
