"use strict";

const { DataTypes } = require("sequelize");
const { encrypt } = require("../config/bcrypt");

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

    //role : user, inventor, penjual, petugas, pjawab
    await queryInterface.bulkInsert("user", [
      {
        id: "b1fadf5c-e36e-40d1-9770-4415b3af55f0",
        name: "user",
        email: "user@email.com",
        phone: "08123456789",
        password: await encrypt("Password123."),
        role: "user",
        avatarUrl:
          "https://api.dicebear.com/9.x/thumbs/svg?eyes=variant6W12&mouth=variant2&backgroundColor=5fd15e",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "c6b5e54d-4bb9-47b6-96c7-3c2327bc65b1",
        name: "inventor",
        email: "inventor@email.com",
        phone: "08123456789",
        password: await encrypt("Password123."),
        role: "inventor",
        avatarUrl:
          "https://api.dicebear.com/9.x/thumbs/svg?eyes=variant6W12&mouth=variant2&backgroundColor=5fd15e",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "d7f77064-5f90-4a9f-b663-279d0000ecbe",
        name: "penjual",
        email: "penjual@email.com",
        phone: "08123456789",
        password: await encrypt("Password123."),
        role: "penjual",
        avatarUrl:
          "https://api.dicebear.com/9.x/thumbs/svg?eyes=variant6W12&mouth=variant2&backgroundColor=5fd15e",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "6e84fcc8-b5c2-4c60-94ef-bb9b7af6005c",
        name: "petugas",
        email: "petugas@email.com",
        phone: "08123456789",
        password: await encrypt("Password123."),
        role: "petugas",
        avatarUrl:
          "https://api.dicebear.com/9.x/thumbs/svg?eyes=variant6W12&mouth=variant2&backgroundColor=5fd15e",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "fc571afa-e66b-437b-8b15-dce68edee3f3",
        name: "pjawab",
        email: "pjawab@email.com",
        phone: "08123456789",
        password: await encrypt("Password123."),
        role: "pjawab",
        avatarUrl:
          "https://api.dicebear.com/9.x/thumbs/svg?eyes=variant6W12&mouth=variant2&backgroundColor=5fd15e",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete("user", null, {
      where: {
        email: [
          "user@email.com",
          "penjual@email.com",
          "petugas@email.com",
          "inventor@email.com",
          "pjawab@gmail.com",
        ],
      },
      truncate: true,
      cascade: true,
      restartIdentity: true,
    });
  },
};
