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
    await queryInterface.createTable("globalNotificationSetting", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      messageTemplate: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      scheduledTime: {
        type: Sequelize.TIME,
        allowNull: false,
      },
      scheduledDate: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      targetRole: {
        type: Sequelize.ENUM("pjawab", "petugas", "inventor", "all"),
        allowNull: false,
      },
      notificationType: {
        type: Sequelize.ENUM("repeat", "once"),
        allowNull: false,
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      lastTriggered: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      isDeleted: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
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
    await queryInterface.dropTable("globalNotificationSetting");
  },
};
