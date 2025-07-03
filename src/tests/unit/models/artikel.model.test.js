const { Sequelize, DataTypes } = require("sequelize");
const defineArtikel = require("../../../model/store/artikel");
const { isUUID } = require("validator");

describe("Artikel Model", () => {
  let sequelize;
  let Artikel;

  beforeAll(async () => {
    sequelize = new Sequelize({
      dialect: "sqlite",
      storage: ":memory:",
      logging: false,
    });

    // Create mock User model for association
    const User = sequelize.define("User", {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    });

    Artikel = defineArtikel(sequelize, DataTypes);

    // Set up associations
    Artikel.associate({ User });

    await sequelize.sync();
  });

  beforeEach(async () => {
    await Artikel.destroy({ where: {} });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe("Artikel Creation", () => {
    it("should create an artikel with valid data", async () => {
      const artikel = await Artikel.create({
        judul: "Tips Menanam Tomat",
        images: "tomat.jpg",
        deskripsi: "Panduan lengkap menanam tomat organik",
      });

      expect(artikel.judul).toBe("Tips Menanam Tomat");
      expect(artikel.images).toBe("tomat.jpg");
      expect(artikel.deskripsi).toBe("Panduan lengkap menanam tomat organik");
      expect(artikel.isDeleted).toBe(false);
      expect(isUUID(artikel.id)).toBe(true);
    });

    it("should set isDeleted to false by default", async () => {
      const artikel = await Artikel.create({
        judul: "Test Artikel",
        deskripsi: "Test description",
      });

      expect(artikel.isDeleted).toBe(false);
    });

    it("should generate UUID for id field", async () => {
      const artikel = await Artikel.create({
        judul: "Test Artikel",
        deskripsi: "Test description",
      });

      expect(isUUID(artikel.id)).toBe(true);
    });

    it("should allow null values for optional fields", async () => {
      const artikel = await Artikel.create({
        judul: null,
        images: null,
        deskripsi: null,
      });

      expect(artikel.judul).toBeNull();
      expect(artikel.images).toBeNull();
      expect(artikel.deskripsi).toBeNull();
      expect(artikel.isDeleted).toBe(false);
    });

    it("should allow empty strings for fields", async () => {
      const artikel = await Artikel.create({
        judul: "",
        images: "",
        deskripsi: "",
      });

      expect(artikel.judul).toBe("");
      expect(artikel.images).toBe("");
      expect(artikel.deskripsi).toBe("");
    });
  });

  describe("Data Types and Constraints", () => {
    it("should store judul as STRING", async () => {
      const longJudul = "a".repeat(255); // Standard STRING length
      const artikel = await Artikel.create({
        judul: longJudul,
        deskripsi: "Test description",
      });

      expect(artikel.judul).toBe(longJudul);
    });

    it("should store images as STRING", async () => {
      const imageUrl =
        "https://example.com/very/long/image/path/to/test/string/length/image.jpg";
      const artikel = await Artikel.create({
        judul: "Test",
        images: imageUrl,
        deskripsi: "Test description",
      });

      expect(artikel.images).toBe(imageUrl);
    });

    it("should store deskripsi as TEXT (long content)", async () => {
      const longDescription = "a".repeat(10000); // TEXT can handle much longer content
      const artikel = await Artikel.create({
        judul: "Test",
        deskripsi: longDescription,
      });

      expect(artikel.deskripsi).toBe(longDescription);
    });

    it("should store isDeleted as BOOLEAN", async () => {
      const artikel = await Artikel.create({
        judul: "Test",
        deskripsi: "Test description",
        isDeleted: true,
      });

      expect(typeof artikel.isDeleted).toBe("boolean");
      expect(artikel.isDeleted).toBe(true);
    });
  });

  describe("Primary Key and Unique Constraints", () => {
    it("should have id as primary key", async () => {
      const artikel = await Artikel.create({
        judul: "Test",
        deskripsi: "Test description",
      });

      expect(artikel.id).toBeDefined();
      expect(isUUID(artikel.id)).toBe(true);
    });

    it("should enforce unique constraint on id", async () => {
      const artikel1 = await Artikel.create({
        judul: "Test 1",
        deskripsi: "Test description 1",
      });

      // Try to create another artikel with the same ID should fail
      // Note: In practice, UUID collision is extremely unlikely
      expect.assertions(1);
      try {
        await Artikel.create({
          id: artikel1.id,
          judul: "Test 2",
          deskripsi: "Test description 2",
        });
      } catch (err) {
        expect(err.message).toMatch(/UNIQUE constraint failed/);
      }
    });

    it("should allow multiple artikels with different IDs", async () => {
      const artikel1 = await Artikel.create({
        judul: "Test 1",
        deskripsi: "Test description 1",
      });

      const artikel2 = await Artikel.create({
        judul: "Test 2",
        deskripsi: "Test description 2",
      });

      expect(artikel1.id).not.toBe(artikel2.id);
      expect(isUUID(artikel1.id)).toBe(true);
      expect(isUUID(artikel2.id)).toBe(true);
    });
  });

  describe("Default Values", () => {
    it("should set correct default value for isDeleted", async () => {
      const artikel = await Artikel.create({
        judul: "Test",
        deskripsi: "Test description",
      });

      expect(artikel.isDeleted).toBe(false);
    });

    it("should allow overriding default value for isDeleted", async () => {
      const artikel = await Artikel.create({
        judul: "Test",
        deskripsi: "Test description",
        isDeleted: true,
      });

      expect(artikel.isDeleted).toBe(true);
    });

    it("should generate unique UUID by default", async () => {
      const artikel1 = await Artikel.create({
        judul: "Test 1",
        deskripsi: "Test description 1",
      });

      const artikel2 = await Artikel.create({
        judul: "Test 2",
        deskripsi: "Test description 2",
      });

      expect(artikel1.id).not.toBe(artikel2.id);
      expect(isUUID(artikel1.id)).toBe(true);
      expect(isUUID(artikel2.id)).toBe(true);
    });
  });

  describe("Timestamps", () => {
    it("should include createdAt and updatedAt timestamps", async () => {
      const artikel = await Artikel.create({
        judul: "Test",
        deskripsi: "Test description",
      });

      expect(artikel.createdAt).toBeInstanceOf(Date);
      expect(artikel.updatedAt).toBeInstanceOf(Date);
    });

    it("should update updatedAt on save", async () => {
      const artikel = await Artikel.create({
        judul: "Test",
        deskripsi: "Test description",
      });

      const originalUpdatedAt = artikel.updatedAt;

      // Wait a bit to ensure timestamp difference
      await new Promise((resolve) => setTimeout(resolve, 10));

      artikel.judul = "Updated Test";
      await artikel.save();

      expect(artikel.updatedAt.getTime()).toBeGreaterThan(
        originalUpdatedAt.getTime()
      );
    });
  });

  describe("CRUD Operations", () => {
    it("should support findAll operation", async () => {
      await Artikel.create({
        judul: "Test 1",
        deskripsi: "Test description 1",
      });

      await Artikel.create({
        judul: "Test 2",
        deskripsi: "Test description 2",
      });

      const artikels = await Artikel.findAll();
      expect(artikels.length).toBe(2);
    });

    it("should support findOne operation", async () => {
      const created = await Artikel.create({
        judul: "Test",
        deskripsi: "Test description",
      });

      const found = await Artikel.findOne({ where: { id: created.id } });
      expect(found.judul).toBe("Test");
    });

    it("should support update operation", async () => {
      const artikel = await Artikel.create({
        judul: "Original Title",
        deskripsi: "Original description",
      });

      await Artikel.update(
        { judul: "Updated Title" },
        { where: { id: artikel.id } }
      );

      const updated = await Artikel.findByPk(artikel.id);
      expect(updated.judul).toBe("Updated Title");
      expect(updated.deskripsi).toBe("Original description");
    });

    it("should support destroy operation", async () => {
      const artikel = await Artikel.create({
        judul: "Test",
        deskripsi: "Test description",
      });

      await artikel.destroy();

      const found = await Artikel.findByPk(artikel.id);
      expect(found).toBeNull();
    });

    it("should support soft delete using isDeleted flag", async () => {
      const artikel = await Artikel.create({
        judul: "Test",
        deskripsi: "Test description",
      });

      artikel.isDeleted = true;
      await artikel.save();

      const found = await Artikel.findByPk(artikel.id);
      expect(found.isDeleted).toBe(true);
    });
  });

  describe("BulkCreate Operations", () => {
    it("should support bulkCreate for multiple artikels", async () => {
      const artikelsData = [
        {
          judul: "Artikel 1",
          deskripsi: "Description 1",
        },
        {
          judul: "Artikel 2",
          deskripsi: "Description 2",
        },
      ];

      const artikels = await Artikel.bulkCreate(artikelsData);
      expect(artikels.length).toBe(2);
      expect(artikels[0].judul).toBe("Artikel 1");
      expect(artikels[1].judul).toBe("Artikel 2");
    });

    it("should apply default values in bulkCreate", async () => {
      const artikelsData = [
        {
          judul: "Artikel 1",
          deskripsi: "Description 1",
        },
      ];

      const artikels = await Artikel.bulkCreate(artikelsData);
      expect(artikels[0].isDeleted).toBe(false);
      expect(isUUID(artikels[0].id)).toBe(true);
    });
  });

  describe("Edge Cases", () => {
    it("should handle very long judul", async () => {
      const longJudul = "a".repeat(500);

      const artikel = await Artikel.create({
        judul: longJudul,
        deskripsi: "Test description",
      });

      expect(artikel.judul).toBe(longJudul);
    });

    it("should handle very long deskripsi", async () => {
      const longDeskripsi = "a".repeat(50000);

      const artikel = await Artikel.create({
        judul: "Test",
        deskripsi: longDeskripsi,
      });

      expect(artikel.deskripsi).toBe(longDeskripsi);
    });

    it("should handle special characters in text fields", async () => {
      const specialJudul =
        "Test with special chars: àáâãäåæçèéêë 中文 العربية 🚀";
      const specialDeskripsi =
        "Description with emojis: 🌱🌾🚜 and symbols: @#$%^&*()";

      const artikel = await Artikel.create({
        judul: specialJudul,
        deskripsi: specialDeskripsi,
      });

      expect(artikel.judul).toBe(specialJudul);
      expect(artikel.deskripsi).toBe(specialDeskripsi);
    });

    it("should handle HTML content in deskripsi", async () => {
      const htmlContent =
        '<p>This is <strong>bold</strong> text with <a href="http://example.com">links</a></p>';

      const artikel = await Artikel.create({
        judul: "HTML Test",
        deskripsi: htmlContent,
      });

      expect(artikel.deskripsi).toBe(htmlContent);
    });

    it("should handle newlines and formatting in deskripsi", async () => {
      const formattedText =
        "Line 1\nLine 2\n\nParagraph break\n\tTabbed content";

      const artikel = await Artikel.create({
        judul: "Formatting Test",
        deskripsi: formattedText,
      });

      expect(artikel.deskripsi).toBe(formattedText);
    });
  });

  describe("Model Associations", () => {
    it("should have correct association with User model", () => {
      const associations = Artikel.associations;
      expect(associations.User).toBeDefined();
      expect(associations.User.associationType).toBe("BelongsTo");
    });

    it("should allow setting User association", async () => {
      // First create a User
      const User = sequelize.models.User;
      const user = await User.create({
        name: "Test User",
      });

      const artikel = await Artikel.create({
        judul: "Test",
        deskripsi: "Test description",
        UserId: user.id,
      });

      expect(artikel.UserId).toBe(user.id);
    });
  });

  describe("Model Configuration", () => {
    it("should have correct table name configuration", () => {
      expect(Artikel.tableName).toBe("artikel");
    });

    it("should have freezeTableName set to true", () => {
      expect(Artikel.options.freezeTableName).toBe(true);
    });
  });

  describe("Querying with Conditions", () => {
    beforeEach(async () => {
      await Artikel.bulkCreate([
        {
          judul: "Active Article 1",
          deskripsi: "Description 1",
          isDeleted: false,
        },
        {
          judul: "Active Article 2",
          deskripsi: "Description 2",
          isDeleted: false,
        },
        {
          judul: "Deleted Article",
          deskripsi: "Description 3",
          isDeleted: true,
        },
      ]);
    });

    it("should filter by isDeleted = false", async () => {
      const activeArtikels = await Artikel.findAll({
        where: { isDeleted: false },
      });

      expect(activeArtikels.length).toBe(2);
      activeArtikels.forEach((artikel) => {
        expect(artikel.isDeleted).toBe(false);
      });
    });

    it("should filter by isDeleted = true", async () => {
      const deletedArtikels = await Artikel.findAll({
        where: { isDeleted: true },
      });

      expect(deletedArtikels.length).toBe(1);
      expect(deletedArtikels[0].judul).toBe("Deleted Article");
    });

    it("should support partial text matching on judul", async () => {
      const Op = Sequelize.Op;
      const matchingArtikels = await Artikel.findAll({
        where: {
          judul: {
            [Op.like]: "%Active%",
          },
        },
      });

      expect(matchingArtikels.length).toBe(2);
      matchingArtikels.forEach((artikel) => {
        expect(artikel.judul).toContain("Active");
      });
    });
  });
});
