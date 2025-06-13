#!/bin/bash

# Script akan langsung berhenti jika ada perintah yang gagal
set -e

echo "--- Running startup.sh script ---"

# 1. Jalankan migrasi database dengan memanggil file biner secara langsung
echo "Running database migrations..."
npm i
# ./node_modules/.bin/sequelize db:migrate

# 2. Jika migrasi berhasil, skrip akan lanjut ke sini.
echo "Migrations completed successfully."

# 3. Jalankan aplikasi utama
echo "Starting application..."
npm start:prod