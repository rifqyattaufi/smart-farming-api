#!/bin/bash

# Menjalankan migrasi database
echo "Running database migrations..."
npx sequelize-cli db:migrate

# Memeriksa apakah migrasi berhasil
# Exit code 0 berarti berhasil
if [ $? -eq 0 ]; then
  echo "Migrations completed successfully."
  # Menjalankan aplikasi utama
  echo "Starting application..."
  npm start
else
  echo "Migrations failed. Application will not start."
  exit 1
fi