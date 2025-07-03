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
          id: "ac3a537e-486f-4f99-ace0-e398765bcd0d",
          nama: "Vitamin",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "082802a5-54ba-470f-925e-f90ff6ad447f",
          nama: "Vaksin",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "08bf7193-7e3b-4a15-ae1a-ff273833fff0",
          nama: "Pupuk",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "1dd42017-1358-4141-859c-5084f347f534",
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
