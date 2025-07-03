const { Sequelize, DataTypes } = require("sequelize");
const defineGlobalNotificationSetting = require("../../../model/farm/globalNotificationSetting");
const { isUUID } = require("validator");

describe("GlobalNotificationSetting Model", () => {
  let sequelize;
  let GlobalNotificationSetting;

  beforeAll(async () => {
    sequelize = new Sequelize({
      dialect: "sqlite",
      storage: ":memory:",
      logging: false,
    });

    GlobalNotificationSetting = defineGlobalNotificationSetting(
      sequelize,
      DataTypes
    );

    // Set up associations (empty in this case)
    GlobalNotificationSetting.associate({});

    await sequelize.sync();
  });

  beforeEach(async () => {
    await GlobalNotificationSetting.destroy({ where: {} });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe("GlobalNotificationSetting Creation", () => {
    it("should create a global notification setting with valid data", async () => {
      const setting = await GlobalNotificationSetting.create({
        title: "Daily Reminder",
        messageTemplate: "Don't forget to check your farm!",
        scheduledTime: "08:00:00",
        targetRole: "all",
        notificationType: "repeat",
      });

      expect(setting.title).toBe("Daily Reminder");
      expect(setting.messageTemplate).toBe("Don't forget to check your farm!");
      expect(setting.scheduledTime).toBe("08:00:00");
      expect(setting.targetRole).toBe("all");
      expect(setting.notificationType).toBe("repeat");
      expect(setting.isActive).toBe(true);
      expect(setting.isDeleted).toBe(false);
      expect(isUUID(setting.id)).toBe(true);
    });

    it("should set default values correctly", async () => {
      const setting = await GlobalNotificationSetting.create({
        title: "Test Notification",
        messageTemplate: "Test message",
        scheduledTime: "09:00:00",
        targetRole: "pjawab",
        notificationType: "once",
      });

      expect(setting.isActive).toBe(true);
      expect(setting.isDeleted).toBe(false);
      expect(setting.lastTriggered).toBeNull();
      expect(setting.scheduledDate).toBeNull();
    });

    it("should generate UUID for id field", async () => {
      const setting = await GlobalNotificationSetting.create({
        title: "Test",
        messageTemplate: "Test message",
        scheduledTime: "10:00:00",
        targetRole: "petugas",
        notificationType: "repeat",
      });

      expect(isUUID(setting.id)).toBe(true);
    });
  });

  describe("Required Fields Validation", () => {
    it("should require title field", async () => {
      expect.assertions(1);
      try {
        await GlobalNotificationSetting.create({
          messageTemplate: "Test message",
          scheduledTime: "08:00:00",
          targetRole: "all",
          notificationType: "repeat",
        });
      } catch (err) {
        expect(err.message).toMatch(/notNull/);
      }
    });

    it("should require messageTemplate field", async () => {
      expect.assertions(1);
      try {
        await GlobalNotificationSetting.create({
          title: "Test Title",
          scheduledTime: "08:00:00",
          targetRole: "all",
          notificationType: "repeat",
        });
      } catch (err) {
        expect(err.message).toMatch(/notNull/);
      }
    });

    it("should require scheduledTime field", async () => {
      expect.assertions(1);
      try {
        await GlobalNotificationSetting.create({
          title: "Test Title",
          messageTemplate: "Test message",
          targetRole: "all",
          notificationType: "repeat",
        });
      } catch (err) {
        expect(err.message).toMatch(/notNull/);
      }
    });

    it("should require targetRole field", async () => {
      expect.assertions(1);
      try {
        await GlobalNotificationSetting.create({
          title: "Test Title",
          messageTemplate: "Test message",
          scheduledTime: "08:00:00",
          notificationType: "repeat",
        });
      } catch (err) {
        expect(err.message).toMatch(/notNull/);
      }
    });

    it("should require notificationType field", async () => {
      expect.assertions(1);
      try {
        await GlobalNotificationSetting.create({
          title: "Test Title",
          messageTemplate: "Test message",
          scheduledTime: "08:00:00",
          targetRole: "all",
        });
      } catch (err) {
        expect(err.message).toMatch(/notNull/);
      }
    });
  });

  describe("ENUM Field Validation", () => {
    describe("targetRole ENUM", () => {
      const validTargetRoles = ["pjawab", "petugas", "inventor", "all"];

      validTargetRoles.forEach((role) => {
        it(`should accept targetRole: ${role}`, async () => {
          const setting = await GlobalNotificationSetting.create({
            title: "Test",
            messageTemplate: "Test message",
            scheduledTime: "08:00:00",
            targetRole: role,
            notificationType: "repeat",
          });

          expect(setting.targetRole).toBe(role);
        });
      });

      it("should reject invalid targetRole", async () => {
        expect.assertions(1);
        try {
          await GlobalNotificationSetting.create({
            title: "Test",
            messageTemplate: "Test message",
            scheduledTime: "08:00:00",
            targetRole: "invalid_role",
            notificationType: "repeat",
          });
        } catch (err) {
          expect(err.message).toMatch(/invalid input value for enum/);
        }
      });
    });

    describe("notificationType ENUM", () => {
      const validNotificationTypes = ["repeat", "once"];

      validNotificationTypes.forEach((type) => {
        it(`should accept notificationType: ${type}`, async () => {
          const setting = await GlobalNotificationSetting.create({
            title: "Test",
            messageTemplate: "Test message",
            scheduledTime: "08:00:00",
            targetRole: "all",
            notificationType: type,
          });

          expect(setting.notificationType).toBe(type);
        });
      });

      it("should reject invalid notificationType", async () => {
        expect.assertions(1);
        try {
          await GlobalNotificationSetting.create({
            title: "Test",
            messageTemplate: "Test message",
            scheduledTime: "08:00:00",
            targetRole: "all",
            notificationType: "invalid_type",
          });
        } catch (err) {
          expect(err.message).toMatch(/invalid input value for enum/);
        }
      });
    });
  });

  describe("Data Types Validation", () => {
    it("should store title as STRING", async () => {
      const longTitle = "a".repeat(255);
      const setting = await GlobalNotificationSetting.create({
        title: longTitle,
        messageTemplate: "Test message",
        scheduledTime: "08:00:00",
        targetRole: "all",
        notificationType: "repeat",
      });

      expect(setting.title).toBe(longTitle);
    });

    it("should store messageTemplate as TEXT", async () => {
      const longMessage = "a".repeat(10000);
      const setting = await GlobalNotificationSetting.create({
        title: "Test",
        messageTemplate: longMessage,
        scheduledTime: "08:00:00",
        targetRole: "all",
        notificationType: "repeat",
      });

      expect(setting.messageTemplate).toBe(longMessage);
    });

    it("should validate TIME format for scheduledTime", async () => {
      const validTimes = ["00:00:00", "12:30:45", "23:59:59"];

      for (const time of validTimes) {
        const setting = await GlobalNotificationSetting.create({
          title: "Test",
          messageTemplate: "Test message",
          scheduledTime: time,
          targetRole: "all",
          notificationType: "repeat",
        });

        expect(setting.scheduledTime).toBe(time);
      }
    });

    it("should store DATE for scheduledDate when provided", async () => {
      const testDate = new Date("2024-12-25T00:00:00Z");
      const setting = await GlobalNotificationSetting.create({
        title: "Christmas Reminder",
        messageTemplate: "Merry Christmas!",
        scheduledTime: "08:00:00",
        scheduledDate: testDate,
        targetRole: "all",
        notificationType: "once",
      });

      expect(setting.scheduledDate).toEqual(testDate);
    });

    it("should store BOOLEAN values correctly", async () => {
      const setting = await GlobalNotificationSetting.create({
        title: "Test",
        messageTemplate: "Test message",
        scheduledTime: "08:00:00",
        targetRole: "all",
        notificationType: "repeat",
        isActive: false,
        isDeleted: true,
      });

      expect(typeof setting.isActive).toBe("boolean");
      expect(typeof setting.isDeleted).toBe("boolean");
      expect(setting.isActive).toBe(false);
      expect(setting.isDeleted).toBe(true);
    });

    it("should store DATE for lastTriggered when provided", async () => {
      const triggerDate = new Date();
      const setting = await GlobalNotificationSetting.create({
        title: "Test",
        messageTemplate: "Test message",
        scheduledTime: "08:00:00",
        targetRole: "all",
        notificationType: "repeat",
        lastTriggered: triggerDate,
      });

      expect(setting.lastTriggered).toEqual(triggerDate);
    });
  });

  describe("Default Values", () => {
    it("should set isActive to true by default", async () => {
      const setting = await GlobalNotificationSetting.create({
        title: "Test",
        messageTemplate: "Test message",
        scheduledTime: "08:00:00",
        targetRole: "all",
        notificationType: "repeat",
      });

      expect(setting.isActive).toBe(true);
    });

    it("should set isDeleted to false by default", async () => {
      const setting = await GlobalNotificationSetting.create({
        title: "Test",
        messageTemplate: "Test message",
        scheduledTime: "08:00:00",
        targetRole: "all",
        notificationType: "repeat",
      });

      expect(setting.isDeleted).toBe(false);
    });

    it("should allow overriding default values", async () => {
      const setting = await GlobalNotificationSetting.create({
        title: "Test",
        messageTemplate: "Test message",
        scheduledTime: "08:00:00",
        targetRole: "all",
        notificationType: "repeat",
        isActive: false,
        isDeleted: true,
      });

      expect(setting.isActive).toBe(false);
      expect(setting.isDeleted).toBe(true);
    });

    it("should set optional fields to null by default", async () => {
      const setting = await GlobalNotificationSetting.create({
        title: "Test",
        messageTemplate: "Test message",
        scheduledTime: "08:00:00",
        targetRole: "all",
        notificationType: "repeat",
      });

      expect(setting.scheduledDate).toBeNull();
      expect(setting.lastTriggered).toBeNull();
    });
  });

  describe("Timestamps", () => {
    it("should include createdAt and updatedAt timestamps", async () => {
      const setting = await GlobalNotificationSetting.create({
        title: "Test",
        messageTemplate: "Test message",
        scheduledTime: "08:00:00",
        targetRole: "all",
        notificationType: "repeat",
      });

      expect(setting.createdAt).toBeInstanceOf(Date);
      expect(setting.updatedAt).toBeInstanceOf(Date);
    });

    it("should update updatedAt on save", async () => {
      const setting = await GlobalNotificationSetting.create({
        title: "Test",
        messageTemplate: "Test message",
        scheduledTime: "08:00:00",
        targetRole: "all",
        notificationType: "repeat",
      });

      const originalUpdatedAt = setting.updatedAt;

      // Wait a bit to ensure timestamp difference
      await new Promise((resolve) => setTimeout(resolve, 10));

      setting.title = "Updated Test";
      await setting.save();

      expect(setting.updatedAt.getTime()).toBeGreaterThan(
        originalUpdatedAt.getTime()
      );
    });
  });

  describe("CRUD Operations", () => {
    it("should support findAll operation", async () => {
      await GlobalNotificationSetting.create({
        title: "Test 1",
        messageTemplate: "Message 1",
        scheduledTime: "08:00:00",
        targetRole: "all",
        notificationType: "repeat",
      });

      await GlobalNotificationSetting.create({
        title: "Test 2",
        messageTemplate: "Message 2",
        scheduledTime: "09:00:00",
        targetRole: "pjawab",
        notificationType: "once",
      });

      const settings = await GlobalNotificationSetting.findAll();
      expect(settings.length).toBe(2);
    });

    it("should support findOne operation", async () => {
      const created = await GlobalNotificationSetting.create({
        title: "Test",
        messageTemplate: "Test message",
        scheduledTime: "08:00:00",
        targetRole: "all",
        notificationType: "repeat",
      });

      const found = await GlobalNotificationSetting.findOne({
        where: { id: created.id },
      });
      expect(found.title).toBe("Test");
    });

    it("should support update operation", async () => {
      const setting = await GlobalNotificationSetting.create({
        title: "Original Title",
        messageTemplate: "Original message",
        scheduledTime: "08:00:00",
        targetRole: "all",
        notificationType: "repeat",
      });

      await GlobalNotificationSetting.update(
        { title: "Updated Title", isActive: false },
        { where: { id: setting.id } }
      );

      const updated = await GlobalNotificationSetting.findByPk(setting.id);
      expect(updated.title).toBe("Updated Title");
      expect(updated.isActive).toBe(false);
      expect(updated.messageTemplate).toBe("Original message");
    });

    it("should support destroy operation", async () => {
      const setting = await GlobalNotificationSetting.create({
        title: "Test",
        messageTemplate: "Test message",
        scheduledTime: "08:00:00",
        targetRole: "all",
        notificationType: "repeat",
      });

      await setting.destroy();

      const found = await GlobalNotificationSetting.findByPk(setting.id);
      expect(found).toBeNull();
    });

    it("should support soft delete using isDeleted flag", async () => {
      const setting = await GlobalNotificationSetting.create({
        title: "Test",
        messageTemplate: "Test message",
        scheduledTime: "08:00:00",
        targetRole: "all",
        notificationType: "repeat",
      });

      setting.isDeleted = true;
      await setting.save();

      const found = await GlobalNotificationSetting.findByPk(setting.id);
      expect(found.isDeleted).toBe(true);
    });
  });

  describe("BulkCreate Operations", () => {
    it("should support bulkCreate for multiple settings", async () => {
      const settingsData = [
        {
          title: "Morning Reminder",
          messageTemplate: "Good morning! Check your farm.",
          scheduledTime: "08:00:00",
          targetRole: "all",
          notificationType: "repeat",
        },
        {
          title: "Evening Reminder",
          messageTemplate: "Good evening! Review your farm.",
          scheduledTime: "18:00:00",
          targetRole: "pjawab",
          notificationType: "repeat",
        },
      ];

      const settings = await GlobalNotificationSetting.bulkCreate(settingsData);
      expect(settings.length).toBe(2);
      expect(settings[0].title).toBe("Morning Reminder");
      expect(settings[1].title).toBe("Evening Reminder");
    });

    it("should apply default values in bulkCreate", async () => {
      const settingsData = [
        {
          title: "Test",
          messageTemplate: "Test message",
          scheduledTime: "08:00:00",
          targetRole: "all",
          notificationType: "repeat",
        },
      ];

      const settings = await GlobalNotificationSetting.bulkCreate(settingsData);
      expect(settings[0].isActive).toBe(true);
      expect(settings[0].isDeleted).toBe(false);
      expect(isUUID(settings[0].id)).toBe(true);
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty string values appropriately", async () => {
      expect.assertions(1);
      try {
        await GlobalNotificationSetting.create({
          title: "",
          messageTemplate: "",
          scheduledTime: "08:00:00",
          targetRole: "all",
          notificationType: "repeat",
        });
      } catch (err) {
        // Should succeed as empty strings are technically valid for STRING and TEXT
        expect(err).toBeUndefined();
      }
    });

    it("should handle special characters in text fields", async () => {
      const specialTitle =
        "Test with special chars: àáâãäåæçèéêë 中文 العربية 🚀";
      const specialMessage =
        "Message with emojis: 🌱🌾🚜 and symbols: @#$%^&*()";

      const setting = await GlobalNotificationSetting.create({
        title: specialTitle,
        messageTemplate: specialMessage,
        scheduledTime: "08:00:00",
        targetRole: "all",
        notificationType: "repeat",
      });

      expect(setting.title).toBe(specialTitle);
      expect(setting.messageTemplate).toBe(specialMessage);
    });

    it("should handle message templates with placeholders", async () => {
      const templateMessage =
        "Hello {name}, you have {count} tasks pending. Check them at {url}.";

      const setting = await GlobalNotificationSetting.create({
        title: "Task Reminder",
        messageTemplate: templateMessage,
        scheduledTime: "08:00:00",
        targetRole: "all",
        notificationType: "repeat",
      });

      expect(setting.messageTemplate).toBe(templateMessage);
    });

    it("should handle timezone considerations for dates", async () => {
      const utcDate = new Date("2024-01-01T00:00:00.000Z");

      const setting = await GlobalNotificationSetting.create({
        title: "New Year Reminder",
        messageTemplate: "Happy New Year!",
        scheduledTime: "00:00:00",
        scheduledDate: utcDate,
        targetRole: "all",
        notificationType: "once",
      });

      expect(setting.scheduledDate).toEqual(utcDate);
    });
  });

  describe("Query Operations", () => {
    beforeEach(async () => {
      await GlobalNotificationSetting.bulkCreate([
        {
          title: "Active Notification 1",
          messageTemplate: "Message 1",
          scheduledTime: "08:00:00",
          targetRole: "all",
          notificationType: "repeat",
          isActive: true,
          isDeleted: false,
        },
        {
          title: "Inactive Notification",
          messageTemplate: "Message 2",
          scheduledTime: "09:00:00",
          targetRole: "pjawab",
          notificationType: "once",
          isActive: false,
          isDeleted: false,
        },
        {
          title: "Deleted Notification",
          messageTemplate: "Message 3",
          scheduledTime: "10:00:00",
          targetRole: "petugas",
          notificationType: "repeat",
          isActive: true,
          isDeleted: true,
        },
      ]);
    });

    it("should filter by isActive status", async () => {
      const activeSettings = await GlobalNotificationSetting.findAll({
        where: { isActive: true },
      });

      expect(activeSettings.length).toBe(2);
      activeSettings.forEach((setting) => {
        expect(setting.isActive).toBe(true);
      });
    });

    it("should filter by targetRole", async () => {
      const allTargetSettings = await GlobalNotificationSetting.findAll({
        where: { targetRole: "all" },
      });

      expect(allTargetSettings.length).toBe(1);
      expect(allTargetSettings[0].targetRole).toBe("all");
    });

    it("should filter by notificationType", async () => {
      const repeatSettings = await GlobalNotificationSetting.findAll({
        where: { notificationType: "repeat" },
      });

      expect(repeatSettings.length).toBe(2);
      repeatSettings.forEach((setting) => {
        expect(setting.notificationType).toBe("repeat");
      });
    });

    it("should combine multiple filters", async () => {
      const activeRepeatSettings = await GlobalNotificationSetting.findAll({
        where: {
          isActive: true,
          notificationType: "repeat",
          isDeleted: false,
        },
      });

      expect(activeRepeatSettings.length).toBe(1);
      expect(activeRepeatSettings[0].title).toBe("Active Notification 1");
    });
  });

  describe("Model Configuration", () => {
    it("should have correct table name configuration", () => {
      expect(GlobalNotificationSetting.tableName).toBe(
        "globalNotificationSetting"
      );
    });

    it("should have timestamps enabled", () => {
      expect(GlobalNotificationSetting.options.timestamps).toBe(true);
    });
  });

  describe("Model Associations", () => {
    it("should have associations defined (even if empty)", () => {
      // The associate function exists but doesn't define any associations
      expect(typeof GlobalNotificationSetting.associate).toBe("function");
    });
  });
});
