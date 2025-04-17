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
    await queryInterface.addColumn("laporan", "unitBudidayaId", {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: "unitBudidaya",
        key: "id",
      },
      after: "id",
    });
    await queryInterface.addColumn("laporan", "objekBudidayaId", {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: "objekBudidaya",
        key: "id",
      },
      after: "unitBudidayaId",
    });
    await queryInterface.addColumn("laporan", "userId", {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: "user",
        key: "id",
      },
      after: "objekBudidayaId",
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
    await queryInterface.removeColumn("laporan", "userId");
  },
};
