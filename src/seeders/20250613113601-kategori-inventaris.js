"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     */
    await queryInterface.bulkInsert(
      "kategoriInventaris",
      [
        {
          nama: "Vitamin",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          nama: "Vaksin",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          nama: "Pupuk",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          nama: "Disinfektan",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {
        ignoreDuplicates: false,
        returning: true,
      }
    );
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete("kategoriInventaris", null, {});
  },
};
