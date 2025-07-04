const { Sequelize, DataTypes } = require("sequelize");
const ProdukModel = require("../../../model/store/produk");

describe("Produk Model", () => {
  let sequelize;
  let Produk;

  beforeAll(async () => {
    // Setup in-memory SQLite database for testing
    sequelize = new Sequelize({
      dialect: "sqlite",
      storage: ":memory:",
      logging: false,
    });

    // Initialize the model
    Produk = ProdukModel(sequelize, DataTypes);

    // Sync the database
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    // Clean up data before each test
    await Produk.destroy({ where: {}, force: true });
  });

  describe("Model Definition", () => {
    it("should have correct table name", () => {
      expect(Produk.tableName).toBe("produk");
    });

    it("should have correct attributes", () => {
      const attributes = Produk.rawAttributes;

      expect(attributes.id).toBeDefined();
      expect(attributes.id.type).toBeInstanceOf(DataTypes.UUID);
      expect(attributes.id.primaryKey).toBe(true);
      expect(attributes.id.allowNull).toBe(false);
      expect(attributes.id.unique).toBe(true);
      expect(attributes.id.defaultValue).toBe(DataTypes.UUIDV4);

      expect(attributes.nama).toBeDefined();
      expect(attributes.nama.type).toBeInstanceOf(DataTypes.STRING);

      expect(attributes.deskripsi).toBeDefined();
      expect(attributes.deskripsi.type).toBeInstanceOf(DataTypes.TEXT);

      expect(attributes.gambar).toBeDefined();
      expect(attributes.gambar.type).toBeInstanceOf(DataTypes.STRING);

      expect(attributes.stok).toBeDefined();
      expect(attributes.stok.type).toBeInstanceOf(DataTypes.INTEGER);

      expect(attributes.satuan).toBeDefined();
      expect(attributes.satuan.type).toBeInstanceOf(DataTypes.STRING);

      expect(attributes.harga).toBeDefined();
      expect(attributes.harga.type).toBeInstanceOf(DataTypes.INTEGER);

      expect(attributes.isDeleted).toBeDefined();
      expect(attributes.isDeleted.type).toBeInstanceOf(DataTypes.BOOLEAN);
      expect(attributes.isDeleted.defaultValue).toBe(false);

      // Check for timestamps
      expect(attributes.createdAt).toBeDefined();
      expect(attributes.updatedAt).toBeDefined();
    });
  });

  describe("CRUD Operations", () => {
    it("should create a produk successfully", async () => {
      const produkData = {
        nama: "Pupuk Organik",
        deskripsi: "Pupuk organik berkualitas tinggi",
        gambar: "pupuk-organik.jpg",
        stok: 100,
        satuan: "kg",
        harga: 25000,
      };

      const produk = await Produk.create(produkData);

      expect(produk).toBeDefined();
      expect(produk.id).toBeDefined();
      expect(produk.nama).toBe("Pupuk Organik");
      expect(produk.deskripsi).toBe("Pupuk organik berkualitas tinggi");
      expect(produk.gambar).toBe("pupuk-organik.jpg");
      expect(produk.stok).toBe(100);
      expect(produk.satuan).toBe("kg");
      expect(produk.harga).toBe(25000);
      expect(produk.isDeleted).toBe(false);
      expect(produk.createdAt).toBeDefined();
      expect(produk.updatedAt).toBeDefined();
    });

    it("should generate UUID for id automatically", async () => {
      const produk1 = await Produk.create({ nama: "Produk 1" });
      const produk2 = await Produk.create({ nama: "Produk 2" });

      expect(produk1.id).toBeDefined();
      expect(produk2.id).toBeDefined();
      expect(produk1.id).not.toBe(produk2.id);
      expect(typeof produk1.id).toBe("string");
      expect(typeof produk2.id).toBe("string");
    });

    it("should set default values correctly", async () => {
      const produk = await Produk.create({
        nama: "Test Produk",
      });

      expect(produk.isDeleted).toBe(false);
    });

    it("should handle null values for optional fields", async () => {
      const produk = await Produk.create({
        nama: "Minimal Produk",
      });

      expect(produk.deskripsi).toBe(null);
      expect(produk.gambar).toBe(null);
      expect(produk.stok).toBe(null);
      expect(produk.satuan).toBe(null);
      expect(produk.harga).toBe(null);
    });

    it("should update produk successfully", async () => {
      const produk = await Produk.create({
        nama: "Original Name",
        harga: 10000,
      });

      await produk.update({
        nama: "Updated Name",
        harga: 15000,
      });

      expect(produk.nama).toBe("Updated Name");
      expect(produk.harga).toBe(15000);

      // Test with reload
      await produk.reload();
      expect(produk.nama).toBe("Updated Name");
      expect(produk.harga).toBe(15000);
    });

    it("should soft delete produk", async () => {
      const produk = await Produk.create({ nama: "To Delete" });

      await produk.update({ isDeleted: true });
      expect(produk.isDeleted).toBe(true);

      // Verify it still exists in database
      const found = await Produk.findByPk(produk.id);
      expect(found).toBeDefined();
      expect(found.isDeleted).toBe(true);
    });

    it("should find produk by conditions", async () => {
      await Produk.create({ nama: "Produk A", harga: 10000, isDeleted: false });
      await Produk.create({ nama: "Produk B", harga: 20000, isDeleted: true });
      await Produk.create({ nama: "Produk C", harga: 15000, isDeleted: false });

      const activeProduk = await Produk.findAll({
        where: { isDeleted: false },
      });

      expect(activeProduk).toHaveLength(2);
      expect(activeProduk.every((p) => !p.isDeleted)).toBe(true);

      const expensiveProduk = await Produk.findAll({
        where: {
          harga: { [sequelize.Sequelize.Op.gt]: 12000 },
          isDeleted: false,
        },
      });

      expect(expensiveProduk).toHaveLength(1);
      expect(expensiveProduk[0].nama).toBe("Produk C");
    });

    it("should count produk correctly", async () => {
      await Produk.create({ nama: "Produk 1" });
      await Produk.create({ nama: "Produk 2" });
      await Produk.create({ nama: "Produk 3", isDeleted: true });

      const totalCount = await Produk.count();
      expect(totalCount).toBe(3);

      const activeCount = await Produk.count({
        where: { isDeleted: false },
      });
      expect(activeCount).toBe(2);
    });

    it("should handle bulk operations", async () => {
      const produkData = [
        { nama: "Bulk 1", harga: 5000 },
        { nama: "Bulk 2", harga: 10000 },
        { nama: "Bulk 3", harga: 15000 },
      ];

      const createdProduk = await Produk.bulkCreate(produkData);
      expect(createdProduk).toHaveLength(3);

      // Bulk update
      await Produk.update(
        { isDeleted: true },
        { where: { harga: { [sequelize.Sequelize.Op.lt]: 10000 } } }
      );

      const remainingActive = await Produk.count({
        where: { isDeleted: false },
      });
      expect(remainingActive).toBe(2);
    });
  });

  describe("Data Types and Validation", () => {
    it("should handle text data type for deskripsi", async () => {
      const longDescription = "Lorem ipsum ".repeat(100); // Very long text

      const produk = await Produk.create({
        nama: "Test Produk",
        deskripsi: longDescription,
      });

      expect(produk.deskripsi).toBe(longDescription);
    });

    it("should handle integer data types", async () => {
      const produk = await Produk.create({
        nama: "Test Produk",
        stok: 50,
        harga: 25000,
      });

      expect(typeof produk.stok).toBe("number");
      expect(typeof produk.harga).toBe("number");
      expect(Number.isInteger(produk.stok)).toBe(true);
      expect(Number.isInteger(produk.harga)).toBe(true);
    });

    it("should validate data types at model level", () => {
      const attributes = Produk.rawAttributes;

      expect(attributes.nama.type).toBeInstanceOf(DataTypes.STRING);
      expect(attributes.deskripsi.type).toBeInstanceOf(DataTypes.TEXT);
      expect(attributes.gambar.type).toBeInstanceOf(DataTypes.STRING);
      expect(attributes.stok.type).toBeInstanceOf(DataTypes.INTEGER);
      expect(attributes.satuan.type).toBeInstanceOf(DataTypes.STRING);
      expect(attributes.harga.type).toBeInstanceOf(DataTypes.INTEGER);
      expect(attributes.isDeleted.type).toBeInstanceOf(DataTypes.BOOLEAN);
    });
  });

  describe("Associations", () => {
    it("should define associate function", () => {
      expect(typeof Produk.associate).toBe("function");
    });

    it("should set up associations when models are provided", () => {
      const mockModels = {
        Toko: { name: "Toko" },
        Keranjang: { name: "Keranjang" },
        PesananDetail: { name: "PesananDetail" },
      };

      // Mock the association methods
      const belongsToSpy = jest.spyOn(Produk, "belongsTo").mockImplementation();
      const hasManySpyKeranjang = jest
        .spyOn(Produk, "hasMany")
        .mockImplementation();

      Produk.associate(mockModels);

      expect(belongsToSpy).toHaveBeenCalledWith(mockModels.Toko);
      expect(hasManySpyKeranjang).toHaveBeenCalledWith(mockModels.Keranjang);
      expect(hasManySpyKeranjang).toHaveBeenCalledWith(
        mockModels.PesananDetail
      );

      expect(belongsToSpy).toHaveBeenCalledTimes(1);
      expect(hasManySpyKeranjang).toHaveBeenCalledTimes(2);

      belongsToSpy.mockRestore();
      hasManySpyKeranjang.mockRestore();
    });
  });

  describe("Timestamps", () => {
    it("should automatically set createdAt and updatedAt", async () => {
      const beforeCreate = new Date();
      const produk = await Produk.create({ nama: "Time Test" });
      const afterCreate = new Date();

      expect(produk.createdAt).toBeDefined();
      expect(produk.updatedAt).toBeDefined();
      expect(produk.createdAt.getTime()).toBeGreaterThanOrEqual(
        beforeCreate.getTime()
      );
      expect(produk.createdAt.getTime()).toBeLessThanOrEqual(
        afterCreate.getTime()
      );
      expect(produk.updatedAt.getTime()).toBeGreaterThanOrEqual(
        beforeCreate.getTime()
      );
      expect(produk.updatedAt.getTime()).toBeLessThanOrEqual(
        afterCreate.getTime()
      );
    });

    it("should update updatedAt on save", async () => {
      const produk = await Produk.create({ nama: "Update Test" });
      const originalUpdatedAt = produk.updatedAt;

      // Wait a bit to ensure different timestamp
      await new Promise((resolve) => setTimeout(resolve, 10));

      await produk.update({ nama: "Updated Name" });

      expect(produk.updatedAt.getTime()).toBeGreaterThan(
        originalUpdatedAt.getTime()
      );
    });
  });

  describe("Query Operations", () => {
    beforeEach(async () => {
      await Produk.bulkCreate([
        { nama: "Pupuk A", harga: 10000, stok: 50, isDeleted: false },
        { nama: "Pupuk B", harga: 25000, stok: 30, isDeleted: false },
        { nama: "Pupuk C", harga: 15000, stok: 0, isDeleted: true },
        { nama: "Bibit D", harga: 5000, stok: 100, isDeleted: false },
      ]);
    });

    it("should find products with complex conditions", async () => {
      const products = await Produk.findAll({
        where: {
          harga: { [sequelize.Sequelize.Op.between]: [10000, 20000] },
          isDeleted: false,
        },
      });

      expect(products).toHaveLength(2);
      expect(products.map((p) => p.nama).sort()).toEqual(
        ["Pupuk A", "Pupuk C"].sort()
      );
    });

    it("should search by name pattern", async () => {
      const pupukProducts = await Produk.findAll({
        where: {
          nama: { [sequelize.Sequelize.Op.like]: "%Pupuk%" },
          isDeleted: false,
        },
      });

      expect(pupukProducts).toHaveLength(2);
      expect(pupukProducts.every((p) => p.nama.includes("Pupuk"))).toBe(true);
    });

    it("should order results correctly", async () => {
      const products = await Produk.findAll({
        where: { isDeleted: false },
        order: [["harga", "DESC"]],
      });

      expect(products).toHaveLength(3);
      expect(products[0].harga).toBe(25000); // Pupuk B
      expect(products[1].harga).toBe(10000); // Pupuk A
      expect(products[2].harga).toBe(5000); // Bibit D
    });

    it("should limit and offset results", async () => {
      const page1 = await Produk.findAll({
        where: { isDeleted: false },
        order: [["nama", "ASC"]],
        limit: 2,
        offset: 0,
      });

      expect(page1).toHaveLength(2);

      const page2 = await Produk.findAll({
        where: { isDeleted: false },
        order: [["nama", "ASC"]],
        limit: 2,
        offset: 2,
      });

      expect(page2).toHaveLength(1);
    });

    it("should aggregate data correctly", async () => {
      const result = await Produk.findAll({
        attributes: [
          [sequelize.fn("COUNT", sequelize.col("id")), "totalProduk"],
          [sequelize.fn("SUM", sequelize.col("stok")), "totalStok"],
          [sequelize.fn("AVG", sequelize.col("harga")), "avgHarga"],
        ],
        where: { isDeleted: false },
        raw: true,
      });

      expect(result[0].totalProduk).toBe(3);
      expect(result[0].totalStok).toBe(180); // 50 + 30 + 100
      expect(Math.round(result[0].avgHarga)).toBe(13333); // (10000 + 25000 + 5000) / 3
    });

    it("should filter out of stock products", async () => {
      const inStockProducts = await Produk.findAll({
        where: {
          stok: { [sequelize.Sequelize.Op.gt]: 0 },
          isDeleted: false,
        },
      });

      expect(inStockProducts).toHaveLength(3);
      expect(inStockProducts.every((p) => p.stok > 0)).toBe(true);
    });

    it("should find low stock products", async () => {
      const lowStockProducts = await Produk.findAll({
        where: {
          stok: { [sequelize.Sequelize.Op.lt]: 40 },
          isDeleted: false,
        },
      });

      expect(lowStockProducts).toHaveLength(1);
      expect(lowStockProducts[0].nama).toBe("Pupuk B");
      expect(lowStockProducts[0].stok).toBe(30);
    });
  });

  describe("Business Logic Scenarios", () => {
    it("should handle product inventory updates", async () => {
      const produk = await Produk.create({
        nama: "Test Inventory",
        stok: 100,
        harga: 10000,
      });

      // Simulate purchase (reduce stock)
      const purchaseQuantity = 15;
      await produk.update({
        stok: produk.stok - purchaseQuantity,
      });

      expect(produk.stok).toBe(85);

      // Simulate restock
      const restockQuantity = 25;
      await produk.update({
        stok: produk.stok + restockQuantity,
      });

      expect(produk.stok).toBe(110);
    });

    it("should handle price updates", async () => {
      const produk = await Produk.create({
        nama: "Price Test",
        harga: 10000,
      });

      // Price increase
      const newPrice = Math.round(produk.harga * 1.1); // 10% increase
      await produk.update({ harga: newPrice });

      expect(produk.harga).toBe(11000);
    });

    it("should handle product categorization by name patterns", async () => {
      await Produk.bulkCreate([
        { nama: "Pupuk NPK", kategori: "pupuk" },
        { nama: "Bibit Tomat", kategori: "bibit" },
        { nama: "Pestisida Organik", kategori: "pestisida" },
        { nama: "Pupuk Kompos", kategori: "pupuk" },
      ]);

      // Find all pupuk products
      const pupukProducts = await Produk.findAll({
        where: {
          nama: { [sequelize.Sequelize.Op.like]: "%Pupuk%" },
        },
      });

      expect(pupukProducts).toHaveLength(2);
      expect(pupukProducts.every((p) => p.nama.includes("Pupuk"))).toBe(true);
    });
  });
});
