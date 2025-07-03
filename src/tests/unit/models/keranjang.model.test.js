const { Sequelize, DataTypes } = require("sequelize");
const KeranjangModel = require("../../../model/store/keranjang");

describe("Keranjang Model", () => {
  let sequelize;
  let Keranjang;

  beforeAll(async () => {
    // Setup in-memory SQLite database for testing
    sequelize = new Sequelize({
      dialect: "sqlite",
      storage: ":memory:",
      logging: false,
    });

    // Initialize the model
    Keranjang = KeranjangModel(sequelize, DataTypes);

    // Sync the database
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    // Clean up data before each test
    await Keranjang.destroy({ where: {}, force: true });
  });

  describe("Model Definition", () => {
    it("should have correct table name", () => {
      expect(Keranjang.tableName).toBe("keranjang");
    });

    it("should have correct attributes", () => {
      const attributes = Keranjang.rawAttributes;

      expect(attributes.id).toBeDefined();
      expect(attributes.id.type).toBeInstanceOf(DataTypes.UUID);
      expect(attributes.id.primaryKey).toBe(true);
      expect(attributes.id.allowNull).toBe(false);
      expect(attributes.id.unique).toBe(true);
      expect(attributes.id.defaultValue).toBe(DataTypes.UUIDV4);

      expect(attributes.jumlah).toBeDefined();
      expect(attributes.jumlah.type).toBeInstanceOf(DataTypes.INTEGER);

      expect(attributes.isDeleted).toBeDefined();
      expect(attributes.isDeleted.type).toBeInstanceOf(DataTypes.BOOLEAN);
      expect(attributes.isDeleted.defaultValue).toBe(false);

      // Check for timestamps
      expect(attributes.createdAt).toBeDefined();
      expect(attributes.updatedAt).toBeDefined();
    });
  });

  describe("CRUD Operations", () => {
    it("should create a keranjang item successfully", async () => {
      const keranjangData = {
        jumlah: 5,
      };

      const keranjang = await Keranjang.create(keranjangData);

      expect(keranjang).toBeDefined();
      expect(keranjang.id).toBeDefined();
      expect(keranjang.jumlah).toBe(5);
      expect(keranjang.isDeleted).toBe(false);
      expect(keranjang.createdAt).toBeDefined();
      expect(keranjang.updatedAt).toBeDefined();
    });

    it("should generate UUID for id automatically", async () => {
      const keranjang1 = await Keranjang.create({ jumlah: 1 });
      const keranjang2 = await Keranjang.create({ jumlah: 2 });

      expect(keranjang1.id).toBeDefined();
      expect(keranjang2.id).toBeDefined();
      expect(keranjang1.id).not.toBe(keranjang2.id);
      expect(typeof keranjang1.id).toBe("string");
      expect(typeof keranjang2.id).toBe("string");
    });

    it("should set default values correctly", async () => {
      const keranjang = await Keranjang.create({
        jumlah: 3,
      });

      expect(keranjang.isDeleted).toBe(false);
    });

    it("should update keranjang item successfully", async () => {
      const keranjang = await Keranjang.create({ jumlah: 2 });

      await keranjang.update({ jumlah: 10 });
      expect(keranjang.jumlah).toBe(10);

      // Test with reload
      await keranjang.reload();
      expect(keranjang.jumlah).toBe(10);
    });

    it("should soft delete keranjang item", async () => {
      const keranjang = await Keranjang.create({ jumlah: 1 });

      await keranjang.update({ isDeleted: true });
      expect(keranjang.isDeleted).toBe(true);

      // Verify it still exists in database
      const found = await Keranjang.findByPk(keranjang.id);
      expect(found).toBeDefined();
      expect(found.isDeleted).toBe(true);
    });

    it("should find keranjang items by conditions", async () => {
      await Keranjang.create({ jumlah: 1, isDeleted: false });
      await Keranjang.create({ jumlah: 2, isDeleted: true });
      await Keranjang.create({ jumlah: 3, isDeleted: false });

      const activeItems = await Keranjang.findAll({
        where: { isDeleted: false },
      });

      expect(activeItems).toHaveLength(2);
      expect(activeItems.every((item) => !item.isDeleted)).toBe(true);

      const deletedItems = await Keranjang.findAll({
        where: { isDeleted: true },
      });

      expect(deletedItems).toHaveLength(1);
      expect(deletedItems[0].isDeleted).toBe(true);
    });

    it("should count keranjang items correctly", async () => {
      await Keranjang.create({ jumlah: 1 });
      await Keranjang.create({ jumlah: 2 });
      await Keranjang.create({ jumlah: 3, isDeleted: true });

      const totalCount = await Keranjang.count();
      expect(totalCount).toBe(3);

      const activeCount = await Keranjang.count({
        where: { isDeleted: false },
      });
      expect(activeCount).toBe(2);
    });

    it("should handle bulk operations", async () => {
      const keranjangItems = [{ jumlah: 1 }, { jumlah: 2 }, { jumlah: 3 }];

      const createdItems = await Keranjang.bulkCreate(keranjangItems);
      expect(createdItems).toHaveLength(3);

      // Bulk update
      await Keranjang.update(
        { isDeleted: true },
        { where: { jumlah: { [sequelize.Sequelize.Op.gt]: 1 } } }
      );

      const remainingActive = await Keranjang.count({
        where: { isDeleted: false },
      });
      expect(remainingActive).toBe(1);
    });
  });

  describe("Validation", () => {
    it("should allow null jumlah", async () => {
      const keranjang = await Keranjang.create({});
      expect(keranjang.jumlah).toBe(null);
    });

    it("should validate jumlah as integer", async () => {
      // This test depends on database-level validation
      // SQLite is lenient with types, so we test the model definition
      const attributes = Keranjang.rawAttributes;
      expect(attributes.jumlah.type).toBeInstanceOf(DataTypes.INTEGER);
    });

    it("should validate isDeleted as boolean", async () => {
      const attributes = Keranjang.rawAttributes;
      expect(attributes.isDeleted.type).toBeInstanceOf(DataTypes.BOOLEAN);
    });
  });

  describe("Associations", () => {
    it("should define associate function", () => {
      expect(typeof Keranjang.associate).toBe("function");
    });

    it("should set up associations when models are provided", () => {
      const mockModels = {
        User: { name: "User" },
        Produk: { name: "Produk" },
      };

      // Mock the belongsTo method
      const belongsToSpy = jest
        .spyOn(Keranjang, "belongsTo")
        .mockImplementation();

      Keranjang.associate(mockModels);

      expect(belongsToSpy).toHaveBeenCalledWith(mockModels.User);
      expect(belongsToSpy).toHaveBeenCalledWith(mockModels.Produk);
      expect(belongsToSpy).toHaveBeenCalledTimes(2);

      belongsToSpy.mockRestore();
    });
  });

  describe("Timestamps", () => {
    it("should automatically set createdAt and updatedAt", async () => {
      const beforeCreate = new Date();
      const keranjang = await Keranjang.create({ jumlah: 1 });
      const afterCreate = new Date();

      expect(keranjang.createdAt).toBeDefined();
      expect(keranjang.updatedAt).toBeDefined();
      expect(keranjang.createdAt.getTime()).toBeGreaterThanOrEqual(
        beforeCreate.getTime()
      );
      expect(keranjang.createdAt.getTime()).toBeLessThanOrEqual(
        afterCreate.getTime()
      );
      expect(keranjang.updatedAt.getTime()).toBeGreaterThanOrEqual(
        beforeCreate.getTime()
      );
      expect(keranjang.updatedAt.getTime()).toBeLessThanOrEqual(
        afterCreate.getTime()
      );
    });

    it("should update updatedAt on save", async () => {
      const keranjang = await Keranjang.create({ jumlah: 1 });
      const originalUpdatedAt = keranjang.updatedAt;

      // Wait a bit to ensure different timestamp
      await new Promise((resolve) => setTimeout(resolve, 10));

      await keranjang.update({ jumlah: 2 });

      expect(keranjang.updatedAt.getTime()).toBeGreaterThan(
        originalUpdatedAt.getTime()
      );
    });
  });

  describe("Query Operations", () => {
    beforeEach(async () => {
      await Keranjang.bulkCreate([
        { jumlah: 1, isDeleted: false },
        { jumlah: 5, isDeleted: false },
        { jumlah: 10, isDeleted: true },
        { jumlah: 3, isDeleted: false },
      ]);
    });

    it("should find items with complex conditions", async () => {
      const items = await Keranjang.findAll({
        where: {
          jumlah: { [sequelize.Sequelize.Op.gte]: 3 },
          isDeleted: false,
        },
      });

      expect(items).toHaveLength(1);
      expect(items[0].jumlah).toBe(5);
    });

    it("should order results correctly", async () => {
      const items = await Keranjang.findAll({
        where: { isDeleted: false },
        order: [["jumlah", "DESC"]],
      });

      expect(items).toHaveLength(3);
      expect(items[0].jumlah).toBe(5);
      expect(items[1].jumlah).toBe(3);
      expect(items[2].jumlah).toBe(1);
    });

    it("should limit and offset results", async () => {
      const page1 = await Keranjang.findAll({
        where: { isDeleted: false },
        order: [["jumlah", "ASC"]],
        limit: 2,
        offset: 0,
      });

      expect(page1).toHaveLength(2);
      expect(page1[0].jumlah).toBe(1);
      expect(page1[1].jumlah).toBe(3);

      const page2 = await Keranjang.findAll({
        where: { isDeleted: false },
        order: [["jumlah", "ASC"]],
        limit: 2,
        offset: 2,
      });

      expect(page2).toHaveLength(1);
      expect(page2[0].jumlah).toBe(5);
    });
  });
});
