-- Script untuk memverifikasi dan memperbaiki charset di Azure MySQL
-- Jalankan script ini di Azure MySQL untuk memastikan charset utf8mb4

-- 1. Check current database charset
SELECT DEFAULT_CHARACTER_SET_NAME, DEFAULT_COLLATION_NAME 
FROM information_schema.SCHEMATA 
WHERE SCHEMA_NAME = DATABASE();

-- 2. Check table charset for scheduledUnitNotification
SELECT TABLE_NAME, TABLE_COLLATION 
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME = 'scheduledUnitNotification';

-- 3. Check column charset for problematic columns
SELECT COLUMN_NAME, CHARACTER_SET_NAME, COLLATION_NAME 
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME = 'scheduledUnitNotification'
AND COLUMN_NAME IN ('title', 'messageTemplate');

-- 4. Fix database charset if needed (uncomment if required)
-- ALTER DATABASE CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 5. Fix table charset if needed (uncomment if required)
-- ALTER TABLE scheduledUnitNotification CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 6. Fix specific columns if needed (uncomment if required)
-- ALTER TABLE scheduledUnitNotification 
-- MODIFY COLUMN title VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
-- MODIFY COLUMN messageTemplate TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 7. Check globalNotificationSetting table if exists
SELECT COLUMN_NAME, CHARACTER_SET_NAME, COLLATION_NAME 
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME = 'globalNotificationSetting'
AND COLUMN_NAME IN ('title', 'messageTemplate');

-- 8. Fix globalNotificationSetting if needed (uncomment if required)
-- ALTER TABLE globalNotificationSetting CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- ALTER TABLE globalNotificationSetting 
-- MODIFY COLUMN title VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
-- MODIFY COLUMN messageTemplate TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 9. Test emoji insertion
-- INSERT INTO scheduledUnitNotification (id, unitBudidayaId, title, messageTemplate, notificationType, tipeLaporan, scheduledTime, isActive, isDeleted, createdAt, updatedAt) 
-- VALUES (UUID(), 'test-unit-id', 'Test Emoji 🌾💊', 'Test message with emoji 🌾💊', 'daily', 'test', '08:00:00', 1, 0, NOW(), NOW());

-- 10. Check connection charset
SHOW VARIABLES LIKE 'character_set%';
SHOW VARIABLES LIKE 'collation%';
