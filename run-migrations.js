const { Sequelize } = require("sequelize");
const { Umzug, SequelizeStorage } = require("umzug");
const path = require("path"); // <-- INI PERBAIKANNYA

const env = process.env.NODE_ENV || "development";
// Menggunakan path.join agar lebih robust
const config = require(path.join(__dirname, "src/config/config.js"))[env];

// Buat instance Sequelize menggunakan konfigurasi dari config.js
const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);

// Konfigurasi Umzug untuk menemukan dan menjalankan file migrasi
const umzug = new Umzug({
  migrations: {
    // Menggunakan path.join agar lebih robust
    glob: path.join(__dirname, "src/migrations", "*.js"),
    resolve: ({ name, path: migrationPath, context }) => {
      const migration = require(migrationPath);
      return {
        name,
        up: async () => migration.up(context, Sequelize),
        down: async () => migration.down(context, Sequelize),
      };
    },
  },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize }),
  logger: console,
});

// Fungsi untuk menjalankan migrasi
const runMigrations = async () => {
  try {
    console.log("Mengecek dan menjalankan migrasi yang tertunda...");
    const migrated = await umzug.up();
    if (migrated.length > 0) {
      console.log("Migrasi yang berhasil dijalankan:");
      migrated.forEach((m) => console.log(`- ${m.name}`));
    } else {
      console.log(
        "Tidak ada migrasi yang perlu dijalankan. Database sudah terbaru."
      );
    }
    console.log("Proses migrasi selesai.");
    // Keluar dengan sukses
    process.exit(0);
  } catch (error) {
    console.error("Migrasi GAGAL:", error);
    // Keluar dengan error code untuk menghentikan proses startup
    process.exit(1);
  }
};

// Jalankan fungsi
runMigrations();
