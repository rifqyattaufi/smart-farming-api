const { Sequelize, DataTypes } = require("sequelize");
const defineUser = require("../../../model/user");
const { isEmail, isUUID } = require("validator");

// Mock bcrypt
jest.mock("../../../config/bcrypt", () => ({
  encrypt: jest.fn((value) => `encrypted_${value}`),
}));

describe("User Model", () => {
  let sequelize;
  let User;

  beforeAll(async () => {
    sequelize = new Sequelize({
      dialect: "sqlite",
      storage: ":memory:",
      logging: false,
    });

    // Create mock associated models
    const Laporan = sequelize.define("Laporan", {});
    const Artikel = sequelize.define("Artikel", {});
    const Keranjang = sequelize.define("Keranjang", {});
    const Rekening = sequelize.define("Rekening", {});
    const Pesanan = sequelize.define("Pesanan", {});
    const Toko = sequelize.define("Toko", {});

    User = defineUser(sequelize, DataTypes);

    // Set up associations
    User.associate({
      Laporan,
      Artikel,
      Keranjang,
      Rekening,
      Pesanan,
      Toko,
    });

    await sequelize.sync();
  });

  beforeEach(async () => {
    await User.destroy({ where: {} });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe("User Creation", () => {
    it("should create a user with valid data", async () => {
      const user = await User.create({
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
        phone: "1234567890",
        role: "user",
      });

      expect(user.name).toBe("John Doe");
      expect(user.email).toBe("john@example.com");
      expect(user.phone).toBe("1234567890");
      expect(user.role).toBe("user");
      expect(user.isActive).toBe(false);
      expect(user.isDeleted).toBe(false);
      expect(user.oAuthStatus).toBe(false);
      expect(isUUID(user.id)).toBe(true);
    });

    it("should set default avatarUrl when not provided", async () => {
      const user = await User.create({
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
        role: "user",
      });

      expect(user.avatarUrl).toMatch(/api\.dicebear\.com/);
    });

    it("should set isActive to false by default", async () => {
      const user = await User.create({
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
        role: "user",
      });

      expect(user.isActive).toBe(false);
    });

    it("should set isDeleted to false by default", async () => {
      const user = await User.create({
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
        role: "user",
      });

      expect(user.isDeleted).toBe(false);
    });

    it("should set oAuthStatus to false by default", async () => {
      const user = await User.create({
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
        role: "user",
      });

      expect(user.oAuthStatus).toBe(false);
    });

    it("should generate UUID for id field", async () => {
      const user = await User.create({
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
        role: "user",
      });

      expect(isUUID(user.id)).toBe(true);
    });
  });

  describe("Email Validation and Processing", () => {
    it("should convert email to lowercase", async () => {
      const user = await User.create({
        name: "John Doe",
        email: "JOHN@EXAMPLE.COM",
        password: "password123",
        role: "user",
      });

      expect(user.email).toBe("john@example.com");
    });

    it("should validate email format", async () => {
      expect.assertions(1);
      try {
        await User.create({
          name: "John Doe",
          email: "invalid-email",
          password: "password123",
          role: "user",
        });
      } catch (err) {
        expect(err.message).toMatch(/Validation/);
      }
    });

    it("should enforce unique email constraint", async () => {
      await User.create({
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
        role: "user",
      });

      expect.assertions(1);
      try {
        await User.create({
          name: "Jane Doe",
          email: "john@example.com",
          password: "password456",
          role: "user",
        });
      } catch (err) {
        expect(err.message).toMatch(/unique/);
      }
    });

    it("should allow case-insensitive unique email", async () => {
      await User.create({
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
        role: "user",
      });

      expect.assertions(1);
      try {
        await User.create({
          name: "Jane Doe",
          email: "JOHN@EXAMPLE.COM",
          password: "password456",
          role: "user",
        });
      } catch (err) {
        expect(err.message).toMatch(/unique/);
      }
    });
  });

  describe("Password Encryption", () => {
    it("should encrypt password on creation", async () => {
      const user = await User.create({
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
        role: "user",
      });

      expect(user.password).toBe("encrypted_password123");
    });

    it("should encrypt password on update", async () => {
      const user = await User.create({
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
        role: "user",
      });

      user.password = "newpassword456";
      await user.save();

      expect(user.password).toBe("encrypted_newpassword456");
    });

    it("should allow null password", async () => {
      const user = await User.create({
        name: "John Doe",
        email: "john@example.com",
        password: null,
        role: "user",
      });

      expect(user.password).toBeNull();
    });

    it("should not encrypt null password", async () => {
      const user = await User.create({
        name: "John Doe",
        email: "john@example.com",
        password: null,
        role: "user",
      });

      user.password = null;
      await user.save();

      expect(user.password).toBeNull();
    });
  });

  describe("Phone Validation", () => {
    it("should validate phone to be numeric", async () => {
      expect.assertions(1);
      try {
        await User.create({
          name: "John Doe",
          email: "john@example.com",
          password: "password123",
          phone: "abc123",
          role: "user",
        });
      } catch (err) {
        expect(err.message).toMatch(/Validation/);
      }
    });

    it("should allow valid numeric phone", async () => {
      const user = await User.create({
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
        phone: "1234567890",
        role: "user",
      });

      expect(user.phone).toBe("1234567890");
    });

    it("should allow null phone", async () => {
      const user = await User.create({
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
        phone: null,
        role: "user",
      });

      expect(user.phone).toBeNull();
    });
  });

  describe("Role Validation", () => {
    const validRoles = ["inventor", "user", "penjual", "petugas", "pjawab"];

    validRoles.forEach((role) => {
      it(`should accept role: ${role}`, async () => {
        const user = await User.create({
          name: "John Doe",
          email: `john${role}@example.com`,
          password: "password123",
          role: role,
        });

        expect(user.role).toBe(role);
      });
    });

    it("should reject invalid role", async () => {
      expect.assertions(1);
      try {
        await User.create({
          name: "John Doe",
          email: "john@example.com",
          password: "password123",
          role: "invalid_role",
        });
      } catch (err) {
        expect(err.message).toMatch(/invalid input value for enum/);
      }
    });

    it("should require role field", async () => {
      expect.assertions(1);
      try {
        await User.create({
          name: "John Doe",
          email: "john@example.com",
          password: "password123",
        });
      } catch (err) {
        expect(err.message).toMatch(/notNull/);
      }
    });
  });

  describe("Expired Time Processing", () => {
    it("should add 1 hour to expiredTime when set", async () => {
      const baseTime = new Date("2023-01-01T12:00:00Z");
      const user = await User.create({
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
        role: "user",
        expiredTime: baseTime,
      });

      const expectedTime = new Date("2023-01-01T13:00:00Z");
      expect(user.expiredTime).toEqual(expectedTime);
    });

    it("should set expiredTime to null when null is provided", async () => {
      const user = await User.create({
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
        role: "user",
        expiredTime: null,
      });

      expect(user.expiredTime).toBeNull();
    });

    it("should update expiredTime correctly", async () => {
      const user = await User.create({
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
        role: "user",
        expiredTime: null,
      });

      const baseTime = new Date("2023-01-01T12:00:00Z");
      user.expiredTime = baseTime;
      await user.save();

      const expectedTime = new Date("2023-01-01T13:00:00Z");
      expect(user.expiredTime).toEqual(expectedTime);
    });
  });

  describe("Required Fields", () => {
    it("should require name field", async () => {
      expect.assertions(1);
      try {
        await User.create({
          email: "john@example.com",
          password: "password123",
          role: "user",
        });
      } catch (err) {
        expect(err.message).toMatch(/notNull/);
      }
    });

    it("should require email field", async () => {
      expect.assertions(1);
      try {
        await User.create({
          name: "John Doe",
          password: "password123",
          role: "user",
        });
      } catch (err) {
        expect(err.message).toMatch(/notNull/);
      }
    });

    it("should allow password to be null", async () => {
      const user = await User.create({
        name: "John Doe",
        email: "john@example.com",
        password: null,
        role: "user",
      });

      expect(user.password).toBeNull();
    });
  });

  describe("Default Values", () => {
    it("should set correct default values", async () => {
      const user = await User.create({
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
        role: "user",
      });

      expect(user.isActive).toBe(false);
      expect(user.isDeleted).toBe(false);
      expect(user.oAuthStatus).toBe(false);
      expect(user.fcmToken).toBeNull();
      expect(user.avatarUrl).toMatch(/dicebear/);
    });

    it("should allow overriding default values", async () => {
      const customAvatarUrl = "https://example.com/custom-avatar.jpg";
      const user = await User.create({
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
        role: "user",
        isActive: true,
        isDeleted: true,
        oAuthStatus: true,
        fcmToken: "test-fcm-token",
        avatarUrl: customAvatarUrl,
      });

      expect(user.isActive).toBe(true);
      expect(user.isDeleted).toBe(true);
      expect(user.oAuthStatus).toBe(true);
      expect(user.fcmToken).toBe("test-fcm-token");
      expect(user.avatarUrl).toBe(customAvatarUrl);
    });
  });

  describe("Timestamps", () => {
    it("should include createdAt and updatedAt timestamps", async () => {
      const user = await User.create({
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
        role: "user",
      });

      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
    });

    it("should update updatedAt on save", async () => {
      const user = await User.create({
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
        role: "user",
      });

      const originalUpdatedAt = user.updatedAt;

      // Wait a bit to ensure timestamp difference
      await new Promise((resolve) => setTimeout(resolve, 10));

      user.name = "Jane Doe";
      await user.save();

      expect(user.updatedAt.getTime()).toBeGreaterThan(
        originalUpdatedAt.getTime()
      );
    });
  });

  describe("BulkCreate Operations", () => {
    it("should support bulkCreate for multiple users", async () => {
      const usersData = [
        {
          name: "User 1",
          email: "user1@example.com",
          password: "password123",
          role: "user",
        },
        {
          name: "User 2",
          email: "user2@example.com",
          password: "password456",
          role: "penjual",
        },
      ];

      const users = await User.bulkCreate(usersData);
      expect(users.length).toBe(2);
      expect(users[0].email).toBe("user1@example.com");
      expect(users[1].email).toBe("user2@example.com");
    });

    it("should apply transformations in bulkCreate", async () => {
      const usersData = [
        {
          name: "User 1",
          email: "USER1@EXAMPLE.COM",
          password: "password123",
          role: "user",
        },
      ];

      const users = await User.bulkCreate(usersData);
      expect(users[0].email).toBe("user1@example.com");
      expect(users[0].password).toBe("encrypted_password123");
    });
  });

  describe("Edge Cases", () => {
    it("should handle very long names", async () => {
      const longName = "a".repeat(1000);

      const user = await User.create({
        name: longName,
        email: "john@example.com",
        password: "password123",
        role: "user",
      });

      expect(user.name).toBe(longName);
    });

    it("should handle special characters in name", async () => {
      const specialName = "John Döe-Smith O'Connor";

      const user = await User.create({
        name: specialName,
        email: "john@example.com",
        password: "password123",
        role: "user",
      });

      expect(user.name).toBe(specialName);
    });

    it("should handle international email domains", async () => {
      const internationalEmail = "test@münchen.de";

      const user = await User.create({
        name: "Test User",
        email: internationalEmail,
        password: "password123",
        role: "user",
      });

      expect(user.email).toBe(internationalEmail);
    });

    it("should handle very long phone numbers", async () => {
      const longPhone = "1234567890123456789012345";

      const user = await User.create({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
        phone: longPhone,
        role: "user",
      });

      expect(user.phone).toBe(longPhone);
    });
  });

  describe("Model Associations", () => {
    it("should have correct associations defined", () => {
      const associations = User.associations;

      expect(associations.Laporans).toBeDefined();
      expect(associations.Laporans.associationType).toBe("HasMany");

      expect(associations.Artikels).toBeDefined();
      expect(associations.Artikels.associationType).toBe("HasMany");

      expect(associations.Keranjangs).toBeDefined();
      expect(associations.Keranjangs.associationType).toBe("HasMany");

      expect(associations.Rekening).toBeDefined();
      expect(associations.Rekening.associationType).toBe("HasOne");

      expect(associations.Pesanans).toBeDefined();
      expect(associations.Pesanans.associationType).toBe("HasMany");

      expect(associations.Toko).toBeDefined();
      expect(associations.Toko.associationType).toBe("HasOne");
    });
  });

  describe("Model Configuration", () => {
    it("should have correct table name configuration", () => {
      expect(User.tableName).toBe("user");
    });

    it("should have freezeTableName set to true", () => {
      expect(User.options.freezeTableName).toBe(true);
    });
  });
});
