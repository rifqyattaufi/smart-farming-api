#!/bin/bash
set -e

echo "--- Running startup.sh script ---"

# 1. Jalankan migrasi database menggunakan skrip Node.js
echo "Running database migrations via Node.js script..."
node ./run-migrations.js

# 2. Jika migrasi berhasil (exit code 0), skrip akan lanjut. Jika gagal, 'set -e' akan menghentikannya.
echo "Migrations check completed."

# 3. Jalankan aplikasi utama
echo "Starting main application..."
npm run start:prod