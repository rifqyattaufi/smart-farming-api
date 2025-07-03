# Script untuk debugging charset issues di Azure MySQL
# Run this script untuk mengecek dan memperbaiki charset issues

Write-Host "🔍 Azure MySQL Charset Debugging Script" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: This script must be run from the smart-farming-api root directory" -ForegroundColor Red
    exit 1
}

Write-Host "📋 Steps to fix charset issues in Azure:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. 🔧 Updated Sequelize config with aggressive charset settings" -ForegroundColor Cyan
Write-Host "   - Added initSql commands"
Write-Host "   - Added afterConnect hooks"
Write-Host "   - Added proper pool configuration"
Write-Host ""

Write-Host "2. 📊 Run the SQL script to check current charset:" -ForegroundColor Cyan
Write-Host "   Execute: azure-charset-check.sql in your Azure MySQL console"
Write-Host ""

Write-Host "3. 🛠️  If charset is wrong, uncomment and run these SQL commands:" -ForegroundColor Cyan
Write-Host "   ALTER DATABASE CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
Write-Host "   ALTER TABLE scheduledUnitNotification CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
Write-Host ""

Write-Host "4. 🚀 Deploy updated config to Azure:" -ForegroundColor Cyan
Write-Host "   - Deploy the updated config.js"
Write-Host "   - Restart your Azure App Service"
Write-Host ""

Write-Host "5. 🧪 Test emoji insertion:" -ForegroundColor Cyan
Write-Host "   Try updating unitBudidaya with notification that contains emoji"
Write-Host ""

Write-Host "📝 Additional Notes:" -ForegroundColor Yellow
Write-Host "- The new config will force set charset on every connection"
Write-Host "- Emoji 🌾💊 should now work properly"
Write-Host "- Check Azure App Service logs for charset connection messages"
Write-Host ""

Write-Host "✅ Configuration updated successfully!" -ForegroundColor Green
