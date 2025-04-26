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
    await queryInterface.addColumn("artikel", "userId", {
      type: Sequelize.UUID,
      references: {
        model: "user",
        key: "id",
      },
      after: "id",
    });
    await queryInterface.addColumn("rekening", "userId", {
      type: Sequelize.UUID,
      references: {
        model: "user",
        key: "id",
      },
      after: "id",
    });
    await queryInterface.addColumn("toko", "userId", {
      type: Sequelize.UUID,
      references: {
        model: "user",
        key: "id",
      },
      after: "id",
    });
    await queryInterface.addColumn("keranjang", "userId", {
      type: Sequelize.UUID,
      references: {
        model: "user",
        key: "id",
      },
      after: "id",
    });
    await queryInterface.addColumn("keranjang", "produkId", {
      type: Sequelize.UUID,
      references: {
        model: "produk",
        key: "id",
      },
      after: "userId",
    });
    await queryInterface.addColumn("produk", "tokoId", {
      type: Sequelize.UUID,
      references: {
        model: "toko",
        key: "id",
      },
      after: "id",
    });
    await queryInterface.addColumn("pesanan", "userId", {
      type: Sequelize.UUID,
      references: {
        model: "user",
        key: "id",
      },
      after: "id",
    });
    await queryInterface.addColumn("pesanan", "tokoId", {
      type: Sequelize.UUID,
      references: {
        model: "toko",
        key: "id",
      },
      after: "userId",
    });
    await queryInterface.createTable("pesananDetail", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      pesananId: {
        type: Sequelize.UUID,
        references: {
          model: "pesanan",
          key: "id",
        },
      },
      produkId: {
        type: Sequelize.UUID,
        references: {
          model: "produk",
          key: "id",
        },
      },
      jumlah: {
        type: Sequelize.INTEGER,
      },
      isDeleted: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.dropTable("pesananDetail");
    await queryInterface.removeColumn("pesanan", "tokoId");
    await queryInterface.removeColumn("pesanan", "userId");
    await queryInterface.removeColumn("produk", "tokoId");
    await queryInterface.removeColumn("keranjang", "produkId");
    await queryInterface.removeColumn("keranjang", "userId");
    await queryInterface.removeColumn("toko", "userId");
    await queryInterface.removeColumn("rekening", "userId");
    await queryInterface.removeColumn("artikel", "userId");
  },
};
