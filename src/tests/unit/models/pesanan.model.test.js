const { Sequelize, DataTypes } = require("sequelize");

// Create in-memory SQLite database for testing
const sequelize = new Sequelize("sqlite::memory:", {
  logging: false,
});

// Import the models
const PesananModel = require("../../../model/store/pesanan");
const UserModel = require("../../../model/user");
const TokoModel = require("../../../model/store/toko");
const PesananDetailModel = require("../../../model/store/pesananDetail");
const MidtransOrderModel = require("../../../model/store/midtransOrders");
const BuktiDiterimaModel = require("../../../model/store/buktiDiterima");

describe("Pesanan Model", () => {
  let Pesanan;
  let User;
  let Toko;
  let PesananDetail;
  let MidtransOrder;
  let BuktiDiterima;

  beforeAll(async () => {
    // Define models
    User = UserModel(sequelize, DataTypes);
    Toko = TokoModel(sequelize, DataTypes);
    PesananDetail = PesananDetailModel(sequelize, DataTypes);
    MidtransOrder = MidtransOrderModel(sequelize, DataTypes);
    BuktiDiterima = BuktiDiterimaModel(sequelize, DataTypes);
    Pesanan = PesananModel(sequelize, DataTypes);

    // Setup associations
    const models = {
      User,
      Toko,
      Pesanan,
      PesananDetail,
      MidtransOrder,
      BuktiDiterima,
    };

    Object.keys(models).forEach((modelName) => {
      if (models[modelName].associate) {
        models[modelName].associate(models);
      }
    });

    // Sync database
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    // Clean up data before each test
    await Pesanan.destroy({ where: {}, force: true });
    await PesananDetail.destroy({ where: {}, force: true });
    await MidtransOrder.destroy({ where: {}, force: true });
    await BuktiDiterima.destroy({ where: {}, force: true });
    await Toko.destroy({ where: {}, force: true });
    await User.destroy({ where: {}, force: true });
  });

  describe("Model Definition", () => {
    it("should be defined", () => {
      expect(Pesanan).toBeDefined();
    });

    it("should have correct table name", () => {
      expect(Pesanan.tableName).toBe("pesanan");
    });

    it("should have correct attributes", () => {
      const attributes = Pesanan.rawAttributes;

      expect(attributes.id).toBeDefined();
      expect(attributes.id.type).toBeInstanceOf(DataTypes.UUID);
      expect(attributes.id.primaryKey).toBe(true);
      expect(attributes.id.allowNull).toBe(false);

      expect(attributes.status).toBeDefined();
      expect(attributes.status.type.key).toBe("ENUM");
      expect(attributes.status.values).toEqual([
        "menunggu",
        "diterima",
        "selesai",
        "ditolak",
      ]);

      expect(attributes.totalHarga).toBeDefined();
      expect(attributes.totalHarga.type).toBeInstanceOf(DataTypes.INTEGER);

      expect(attributes.isDeleted).toBeDefined();
      expect(attributes.isDeleted.type).toBeInstanceOf(DataTypes.BOOLEAN);
      expect(attributes.isDeleted.defaultValue).toBe(false);
    });
  });

  describe("CRUD Operations", () => {
    let user;
    let toko;

    beforeEach(async () => {
      // Create dependencies for foreign key references
      user = await User.create({
        name: "Test User",
        email: "test@example.com",
        password: "hashedpassword",
        isDeleted: false,
      });

      toko = await Toko.create({
        nama: "Test Toko",
        alamat: "Test Address",
        isDeleted: false,
      });
    });

    it("should create a pesanan successfully", async () => {
      const pesananData = {
        UserId: user.id,
        TokoId: toko.id,
        status: "menunggu",
        totalHarga: 50000,
      };

      const pesanan = await Pesanan.create(pesananData);

      expect(pesanan.id).toBeDefined();
      expect(pesanan.UserId).toBe(user.id);
      expect(pesanan.TokoId).toBe(toko.id);
      expect(pesanan.status).toBe("menunggu");
      expect(pesanan.totalHarga).toBe(50000);
      expect(pesanan.isDeleted).toBe(false);
      expect(pesanan.createdAt).toBeDefined();
      expect(pesanan.updatedAt).toBeDefined();
    });

    it("should create pesanan with all valid status values", async () => {
      const validStatuses = ["menunggu", "diterima", "selesai", "ditolak"];

      for (const status of validStatuses) {
        const pesanan = await Pesanan.create({
          UserId: user.id,
          TokoId: toko.id,
          status: status,
          totalHarga: 25000,
        });

        expect(pesanan.status).toBe(status);
      }
    });

    it("should find pesanan by id", async () => {
      const pesananData = {
        UserId: user.id,
        TokoId: toko.id,
        status: "menunggu",
        totalHarga: 30000,
      };

      const created = await Pesanan.create(pesananData);
      const found = await Pesanan.findByPk(created.id);

      expect(found).toBeDefined();
      expect(found.id).toBe(created.id);
      expect(found.status).toBe("menunggu");
      expect(found.totalHarga).toBe(30000);
    });

    it("should update pesanan", async () => {
      const pesanan = await Pesanan.create({
        UserId: user.id,
        TokoId: toko.id,
        status: "menunggu",
        totalHarga: 40000,
      });

      await pesanan.update({
        status: "diterima",
        totalHarga: 45000,
      });

      expect(pesanan.status).toBe("diterima");
      expect(pesanan.totalHarga).toBe(45000);
    });

    it("should soft delete pesanan", async () => {
      const pesanan = await Pesanan.create({
        UserId: user.id,
        TokoId: toko.id,
        status: "menunggu",
        totalHarga: 35000,
      });

      await pesanan.update({ isDeleted: true });

      expect(pesanan.isDeleted).toBe(true);
    });

    it("should find all active pesanan for a user", async () => {
      await Pesanan.create({
        UserId: user.id,
        TokoId: toko.id,
        status: "menunggu",
        totalHarga: 25000,
        isDeleted: false,
      });

      await Pesanan.create({
        UserId: user.id,
        TokoId: toko.id,
        status: "diterima",
        totalHarga: 30000,
        isDeleted: false,
      });

      await Pesanan.create({
        UserId: user.id,
        TokoId: toko.id,
        status: "selesai",
        totalHarga: 35000,
        isDeleted: true, // This should be excluded
      });

      const userPesanan = await Pesanan.findAll({
        where: {
          UserId: user.id,
          isDeleted: false,
        },
      });

      expect(userPesanan).toHaveLength(2);
      expect(userPesanan.every((p) => p.UserId === user.id)).toBe(true);
      expect(userPesanan.every((p) => p.isDeleted === false)).toBe(true);
    });

    it("should find pesanan by status", async () => {
      await Pesanan.create({
        UserId: user.id,
        TokoId: toko.id,
        status: "menunggu",
        totalHarga: 25000,
      });

      await Pesanan.create({
        UserId: user.id,
        TokoId: toko.id,
        status: "diterima",
        totalHarga: 30000,
      });

      const menungguPesanan = await Pesanan.findAll({
        where: {
          status: "menunggu",
          isDeleted: false,
        },
      });

      expect(menungguPesanan).toHaveLength(1);
      expect(menungguPesanan[0].status).toBe("menunggu");
    });

    it("should find pesanan by toko", async () => {
      const anotherToko = await Toko.create({
        nama: "Another Toko",
        alamat: "Another Address",
        isDeleted: false,
      });

      await Pesanan.create({
        UserId: user.id,
        TokoId: toko.id,
        status: "menunggu",
        totalHarga: 25000,
      });

      await Pesanan.create({
        UserId: user.id,
        TokoId: anotherToko.id,
        status: "menunggu",
        totalHarga: 30000,
      });

      const tokoPesanan = await Pesanan.findAll({
        where: {
          TokoId: toko.id,
          isDeleted: false,
        },
      });

      expect(tokoPesanan).toHaveLength(1);
      expect(tokoPesanan[0].TokoId).toBe(toko.id);
    });
  });

  describe("Validations", () => {
    let user;
    let toko;

    beforeEach(async () => {
      user = await User.create({
        name: "Test User",
        email: "test@example.com",
        password: "hashedpassword",
        isDeleted: false,
      });

      toko = await Toko.create({
        nama: "Test Toko",
        alamat: "Test Address",
        isDeleted: false,
      });
    });

    it("should fail with invalid status", async () => {
      const pesananData = {
        UserId: user.id,
        TokoId: toko.id,
        status: "invalid_status",
        totalHarga: 25000,
      };

      await expect(Pesanan.create(pesananData)).rejects.toThrow();
    });

    it("should accept all valid status values", async () => {
      const validStatuses = ["menunggu", "diterima", "selesai", "ditolak"];

      for (const status of validStatuses) {
        const pesanan = await Pesanan.create({
          UserId: user.id,
          TokoId: toko.id,
          status: status,
          totalHarga: 25000,
        });

        expect(pesanan.status).toBe(status);
      }
    });
  });

  describe("Associations", () => {
    it("should have correct associations", () => {
      const associations = Pesanan.associations;

      expect(associations.User).toBeDefined();
      expect(associations.User.associationType).toBe("BelongsTo");

      expect(associations.Toko).toBeDefined();
      expect(associations.Toko.associationType).toBe("BelongsTo");

      expect(associations.PesananDetails).toBeDefined();
      expect(associations.PesananDetails.associationType).toBe("HasMany");

      expect(associations.MidtransOrder).toBeDefined();
      expect(associations.MidtransOrder.associationType).toBe("BelongsTo");

      expect(associations.BuktiDiterima).toBeDefined();
      expect(associations.BuktiDiterima.associationType).toBe("BelongsTo");
    });

    it("should include User data when requested", async () => {
      const user = await User.create({
        name: "Test User for Association",
        email: "assoc@example.com",
        password: "hashedpassword",
        isDeleted: false,
      });

      const toko = await Toko.create({
        nama: "Test Toko",
        alamat: "Test Address",
        isDeleted: false,
      });

      const pesanan = await Pesanan.create({
        UserId: user.id,
        TokoId: toko.id,
        status: "menunggu",
        totalHarga: 25000,
      });

      const pesananWithUser = await Pesanan.findOne({
        where: { id: pesanan.id },
        include: [User],
      });

      expect(pesananWithUser.User).toBeDefined();
      expect(pesananWithUser.User.name).toBe("Test User for Association");
    });

    it("should include Toko data when requested", async () => {
      const user = await User.create({
        name: "Test User",
        email: "test@example.com",
        password: "hashedpassword",
        isDeleted: false,
      });

      const toko = await Toko.create({
        nama: "Test Toko for Association",
        alamat: "Test Address",
        isDeleted: false,
      });

      const pesanan = await Pesanan.create({
        UserId: user.id,
        TokoId: toko.id,
        status: "menunggu",
        totalHarga: 25000,
      });

      const pesananWithToko = await Pesanan.findOne({
        where: { id: pesanan.id },
        include: [Toko],
      });

      expect(pesananWithToko.Toko).toBeDefined();
      expect(pesananWithToko.Toko.nama).toBe("Test Toko for Association");
    });

    it("should include multiple associations when requested", async () => {
      const user = await User.create({
        name: "Test User",
        email: "test@example.com",
        password: "hashedpassword",
        isDeleted: false,
      });

      const toko = await Toko.create({
        nama: "Test Toko",
        alamat: "Test Address",
        isDeleted: false,
      });

      const pesanan = await Pesanan.create({
        UserId: user.id,
        TokoId: toko.id,
        status: "menunggu",
        totalHarga: 25000,
      });

      const pesananWithAssociations = await Pesanan.findOne({
        where: { id: pesanan.id },
        include: [User, Toko],
      });

      expect(pesananWithAssociations.User).toBeDefined();
      expect(pesananWithAssociations.Toko).toBeDefined();
      expect(pesananWithAssociations.User.name).toBe("Test User");
      expect(pesananWithAssociations.Toko.nama).toBe("Test Toko");
    });
  });

  describe("Default Values", () => {
    let user;
    let toko;

    beforeEach(async () => {
      user = await User.create({
        name: "Test User",
        email: "test@example.com",
        password: "hashedpassword",
        isDeleted: false,
      });

      toko = await Toko.create({
        nama: "Test Toko",
        alamat: "Test Address",
        isDeleted: false,
      });
    });

    it("should set default values correctly", async () => {
      const pesananData = {
        UserId: user.id,
        TokoId: toko.id,
        status: "menunggu",
        totalHarga: 25000,
      };

      const pesanan = await Pesanan.create(pesananData);

      expect(pesanan.isDeleted).toBe(false);
      expect(pesanan.id).toBeDefined();
    });
  });

  describe("Business Logic", () => {
    let user;
    let toko;

    beforeEach(async () => {
      user = await User.create({
        name: "Test User",
        email: "test@example.com",
        password: "hashedpassword",
        isDeleted: false,
      });

      toko = await Toko.create({
        nama: "Test Toko",
        alamat: "Test Address",
        isDeleted: false,
      });
    });

    it("should track status progression", async () => {
      const pesanan = await Pesanan.create({
        UserId: user.id,
        TokoId: toko.id,
        status: "menunggu",
        totalHarga: 25000,
      });

      // Progress through statuses
      await pesanan.update({ status: "diterima" });
      expect(pesanan.status).toBe("diterima");

      await pesanan.update({ status: "selesai" });
      expect(pesanan.status).toBe("selesai");
    });

    it("should handle order rejection", async () => {
      const pesanan = await Pesanan.create({
        UserId: user.id,
        TokoId: toko.id,
        status: "menunggu",
        totalHarga: 25000,
      });

      await pesanan.update({ status: "ditolak" });
      expect(pesanan.status).toBe("ditolak");
    });

    it("should calculate total orders per user", async () => {
      await Pesanan.create({
        UserId: user.id,
        TokoId: toko.id,
        status: "selesai",
        totalHarga: 25000,
      });

      await Pesanan.create({
        UserId: user.id,
        TokoId: toko.id,
        status: "selesai",
        totalHarga: 35000,
      });

      const userOrders = await Pesanan.findAll({
        where: {
          UserId: user.id,
          status: "selesai",
          isDeleted: false,
        },
      });

      const totalValue = userOrders.reduce(
        (sum, pesanan) => sum + pesanan.totalHarga,
        0
      );
      expect(totalValue).toBe(60000);
      expect(userOrders).toHaveLength(2);
    });
  });
});
