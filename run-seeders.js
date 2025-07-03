const { Sequelize } = require("sequelize");
const { Umzug, SequelizeStorage } = require("umzug");
const path = require("path");

const env = process.env.NODE_ENV || "development";
const config = require(path.join(__dirname, "src/config/config.js"))[env];

// Buat instance Sequelize
const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);

// Konfigurasi Umzug untuk Seeder
const umzug = new Umzug({
  // Arahkan ke folder seeders
  migrations: {
    glob: path.join(__dirname, "src/seeders", "*.js"),
    resolve: ({ name, path: seederPath, context }) => {
      const seeder = require(seederPath);
      // Sequelize-CLI seeder menggunakan `up` dan `down`, sama seperti migrasi
      return {
        name,
        up: async () => seeder.up(context, Sequelize),
        down: async () => seeder.down(context, Sequelize),
      };
    },
  },
  context: sequelize.getQueryInterface(),
  // Penting: Sequelize-CLI menggunakan tabel 'SequelizeData' untuk melacak seeder
  storage: new SequelizeStorage({ sequelize, tableName: "SequelizeData" }),
  logger: console,
});

// Fungsi untuk menjalankan seeder
const runSeeders = async () => {
  try {
    console.log("Menjalankan seeder yang tertunda...");
    const seeded = await umzug.up();
    if (seeded.length > 0) {
      console.log("Seeder yang berhasil dijalankan:");
      seeded.forEach((s) => console.log(`- ${s.name}`));
    } else {
      console.log("Tidak ada seeder baru yang perlu dijalankan.");
    }
    console.log("Proses seeding selesai.");
    process.exit(0);
  } catch (error) {
    console.error("Seeding GAGAL:", error);
    process.exit(1);
  }
};

// Jalankan fungsi
runSeeders();
