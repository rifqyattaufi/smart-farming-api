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
        id: "f6f87523-3a83-4917-9f71-b773ac9acc3a",
        name: "Rooftop Farming Center",
        email: "rfc@gmail.com",
        phone: "082266095743",
        password: await encrypt("Password123."),
        role: "penjual",
        avatarUrl:
          "https://api.dicebear.com/9.x/thumbs/svg?eyes=variant6W12&mouth=variant2&backgroundColor=5fd15e",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "37d2ea06-ff8e-4c20-80e3-5c35510d37c4",
        name: "Toko Buah Segar Akay",
        email: "umkm1@gmail.com",
        phone: "082266095743",
        password: await encrypt("Password123."),
        role: "penjual",
        avatarUrl:
          "https://api.dicebear.com/9.x/thumbs/svg?eyes=variant6W12&mouth=variant2&backgroundColor=5fd15e",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "76f78c3f-2df8-4aa2-9132-ffac45d211c0",
        name: "Toko Hotwheels Akay",
        email: "umkm2@gmail.com",
        phone: "082266095743",
        password: await encrypt("Password123."),
        role: "penjual",
        avatarUrl:
          "https://api.dicebear.com/9.x/thumbs/svg?eyes=variant6W12&mouth=variant2&backgroundColor=5fd15e",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "43af6752-327b-4ede-8552-f8060dfe811c",
        name: "Toko Boquet Akay",
        email: "umkm3@gmail.com",
        phone: "082266095743",
        password: await encrypt("Password123."),
        role: "penjual",
        avatarUrl:
          "https://api.dicebear.com/9.x/thumbs/svg?eyes=variant6W12&mouth=variant2&backgroundColor=5fd15e",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "92c4ab94-d185-49da-97fb-1838885e8672",
        name: "Toko Dimsum Mentai Akay",
        email: "umkm4@gmail.com",
        phone: "082266095743",
        password: await encrypt("Password123."),
        role: "penjual",
        avatarUrl:
          "https://api.dicebear.com/9.x/thumbs/svg?eyes=variant6W12&mouth=variant2&backgroundColor=5fd15e",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "f8ce768b-ad35-49a3-a1fb-b79bbdb15ae8",
        name: "Himse Store",
        email: "umkm5@gmail.com",
        phone: "082266095743",
        password: await encrypt("Password123."),
        role: "penjual",
        avatarUrl:
          "https://api.dicebear.com/9.x/thumbs/svg?eyes=variant6W12&mouth=variant2&backgroundColor=5fd15e",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "31308d40-7158-45ed-91cf-ba82d75e0292a",
        name: "Apps Premium by Akay",
        email: "umkm6@gmail.com",
        phone: "082266095743",
        password: await encrypt("Password123."),
        role: "penjual",
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
          "rfc@gmail.com",
          "umkm1@email.com",
          "umkm2@email.com",
          "umkm3@email.com",
          "umkm4@email.com",
          "umkm5@email.com",
          "umkm6@email.com",

        ],
      },
      truncate: true,
      cascade: true,
      restartIdentity: true,
    });
  },
};
