const { Sequelize } = require("sequelize");
const { Umzug, SequelizeStorage } = require("umzug");
const path = require("path");

const env = process.env.NODE_ENV || "development";
const config = require(path.join(__dirname, "src/config/config.js"))[env];

// Inisialisasi Sequelize
const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);

// Konfigurasi Umzug untuk Seeder
const umzugSeeder = new Umzug({
  migrations: {
    glob: path.join(__dirname, "src/seeders", "*.js"),
    resolve: ({ name, path: seederPath, context }) => {
      const seeder = require(seederPath);
      return {
        name,
        up: async () => seeder.up(context, Sequelize),
        down: async () => seeder.down(context, Sequelize),
      };
    },
  },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize, tableName: "SequelizeData" }),
  logger: console,
});

// Fungsi utama untuk mereset database
const resetDatabase = async () => {
  try {
    console.log("--- MEMULAI PROSES RESET DATABASE ---");

    // 1. Menonaktifkan pengecekan foreign key
    console.log("Menonaktifkan pengecekan foreign key...");
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 0", { raw: true });

    // 2. Menghapus semua data dari setiap tabel (truncate)
    // Dapatkan semua nama model yang terdaftar di Sequelize
    const models = sequelize.models;
    const tableNames = Object.keys(models);

    console.log(`Menghapus data dari ${tableNames.length} tabel...`);
    for (const tableName of tableNames) {
      // Kita tidak perlu menghapus tabel meta Sequelize
      if (tableName !== "SequelizeMeta" && tableName !== "SequelizeData") {
        console.log(
          `- Menghapus data dari tabel: ${models[tableName].getTableName()}`
        );
        await models[tableName].destroy({ where: {}, truncate: true });
      }
    }

    // 3. Menghapus histori seeder agar bisa dijalankan lagi
    console.log("Menghapus histori seeder (SequelizeData)...");
    await sequelize.query("TRUNCATE TABLE `SequelizeData`", { raw: true });

    // 4. Menjalankan kembali semua seeder
    console.log("Menjalankan ulang semua seeder...");
    await umzugSeeder.up();
    console.log("Seeding selesai.");

    // 5. Mengaktifkan kembali pengecekan foreign key
    console.log("Mengaktifkan kembali pengecekan foreign key...");
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 1", { raw: true });

    console.log("--- RESET DATABASE BERHASIL ---");
    process.exit(0);
  } catch (error) {
    console.error("--- RESET DATABASE GAGAL ---");
    console.error(error);
    // Pastikan foreign key check diaktifkan kembali jika terjadi error
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 1", { raw: true });
    process.exit(1);
  }
};

// Jalankan fungsi reset
resetDatabase();
