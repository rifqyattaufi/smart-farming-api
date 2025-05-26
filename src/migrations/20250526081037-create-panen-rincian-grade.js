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
    await queryInterface.createTable('panenrinciangrade', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
        unique: true,
      },
      jumlah: {
        type: Sequelize.DOUBLE,
        allowNull: false,
        validate: { isFloat: true, min: 0 },
        comment: 'Jumlah dari grade ini yang dipanen',
      },
      panenKebunId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'panenkebun',
          key: 'id'
        }
      },
      gradeId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'grade',
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
    await queryInterface.dropTable('panenrinciangrade');
  }
};
