const request = require("supertest");
const express = require("express");
const sequelize = require("../../../model");
const pesananController = require("../../../controller/store/pesanan");

// Mock the external dependencies
jest.mock("../../../model", () => ({
  sequelize: {
    transaction: jest.fn(),
  },
  Pesanan: {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
  },
  PesananDetail: {
    create: jest.fn(),
  },
  Produk: {
    findOne: jest.fn(),
  },
  MidtransOrder: {
    findOrCreate: jest.fn(),
  },
  Toko: {},
  User: {},
  BuktiDiterima: {
    create: jest.fn(),
  },
}));

jest.mock("../../../services/notificationService", () => ({
  sendNotificationToSingleUserById: jest.fn(),
}));

jest.mock("../saldo.js", () => ({
  creditUserSaldo: jest.fn(),
}));

const {
  sendNotificationToSingleUserById,
} = require("../../../services/notificationService");
const { creditUserSaldo } = require("../saldo.js");

const app = express();
app.use(express.json());

// Mock authentication middleware
app.use((req, res, next) => {
  req.user = {
    id: "user-1",
    name: "Test User",
    email: "test@example.com",
  };
  next();
});

// Setup routes
app.post("/pesanan", pesananController.createPesanan);
app.get("/pesanan/user", pesananController.getPesananByUser);
app.get("/pesanan/:id", pesananController.getPesananById);
app.put("/pesanan/status", pesananController.updatePesananStatus);
app.put("/pesanan/status-notif", pesananController.updatePesananStatusandNotif);
app.get("/pesanan/toko/:tokoId", pesananController.getPesananByTokoId);
app.post("/pesanan/bukti", pesananController.CreatebuktiDiterima);

describe("Pesanan Controller", () => {
  let mockTransaction;

  beforeEach(() => {
    jest.clearAllMocks();

    mockTransaction = {
      commit: jest.fn(),
      rollback: jest.fn(),
    };

    sequelize.sequelize.transaction.mockResolvedValue(mockTransaction);
  });

  describe("POST /pesanan", () => {
    const mockProduk = {
      id: "prod-1",
      nama: "Test Product",
      harga: 10000,
      TokoId: "toko-1",
      isDeleted: false,
    };

    const orderData = {
      orderId: "order-123",
      items: [{ produkId: "prod-1", jumlah: 2 }],
    };

    const mockPesanan = {
      id: "pesanan-1",
      UserId: "user-1",
      status: "menunggu",
      totalHarga: 20000,
      MidtransOrderId: "order-123",
      TokoId: "toko-1",
    };

    it("should create pesanan successfully", async () => {
      sequelize.Produk.findOne.mockResolvedValue(mockProduk);
      sequelize.MidtransOrder.findOrCreate.mockResolvedValue([{}, true]);
      sequelize.Pesanan.create.mockResolvedValue(mockPesanan);
      sequelize.PesananDetail.create.mockResolvedValue({});

      const response = await request(app)
        .post("/pesanan")
        .send(orderData)
        .expect(201);

      expect(response.body).toEqual({
        message: "Pesanan berhasil dibuat",
        data: mockPesanan,
      });

      expect(sequelize.Produk.findOne).toHaveBeenCalledWith({
        where: { id: "prod-1", isDeleted: false },
      });

      expect(sequelize.Pesanan.create).toHaveBeenCalledWith(
        {
          UserId: "user-1",
          status: "menunggu",
          totalHarga: 20000,
          MidtransOrderId: "order-123",
          TokoId: "toko-1",
        },
        { transaction: mockTransaction, logging: console.log }
      );

      expect(sequelize.PesananDetail.create).toHaveBeenCalledWith(
        {
          ProdukId: "prod-1",
          jumlah: 2,
          PesananId: "pesanan-1",
        },
        { transaction: mockTransaction }
      );

      expect(mockTransaction.commit).toHaveBeenCalled();
    });

    it("should return 400 when items array is empty", async () => {
      const response = await request(app)
        .post("/pesanan")
        .send({ orderId: "order-123", items: [] })
        .expect(400);

      expect(response.body).toEqual({
        message: "Item pesanan tidak boleh kosong",
      });
    });

    it("should return 400 when items is not an array", async () => {
      const response = await request(app)
        .post("/pesanan")
        .send({ orderId: "order-123", items: "not-array" })
        .expect(400);

      expect(response.body).toEqual({
        message: "Item pesanan tidak boleh kosong",
      });
    });

    it("should return 400 when item has invalid data", async () => {
      const response = await request(app)
        .post("/pesanan")
        .send({
          orderId: "order-123",
          items: [{ produkId: "prod-1" }], // missing jumlah
        })
        .expect(400);

      expect(response.body).toEqual({
        message: "Setiap item harus memiliki produkId dan jumlah minimal 1",
      });
    });

    it("should return 400 when item quantity is less than 1", async () => {
      const response = await request(app)
        .post("/pesanan")
        .send({
          orderId: "order-123",
          items: [{ produkId: "prod-1", jumlah: 0 }],
        })
        .expect(400);

      expect(response.body).toEqual({
        message: "Setiap item harus memiliki produkId dan jumlah minimal 1",
      });
    });

    it("should return 404 when product not found", async () => {
      sequelize.Produk.findOne.mockResolvedValue(null);

      const response = await request(app)
        .post("/pesanan")
        .send(orderData)
        .expect(404);

      expect(response.body).toEqual({
        message: "Produk dengan ID prod-1 tidak ditemukan",
      });
    });

    it("should handle database errors and rollback transaction", async () => {
      sequelize.Produk.findOne.mockRejectedValue(new Error("Database Error"));

      const response = await request(app)
        .post("/pesanan")
        .send(orderData)
        .expect(500);

      expect(response.body).toEqual({
        message: "Gagal membuat pesanan",
        detail: "Database Error",
      });

      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    it("should calculate total price correctly with multiple items", async () => {
      const multipleItemsOrder = {
        orderId: "order-123",
        items: [
          { produkId: "prod-1", jumlah: 2 },
          { produkId: "prod-2", jumlah: 3 },
        ],
      };

      const mockProduk2 = {
        id: "prod-2",
        nama: "Test Product 2",
        harga: 15000,
        TokoId: "toko-1",
        isDeleted: false,
      };

      sequelize.Produk.findOne
        .mockResolvedValueOnce(mockProduk)
        .mockResolvedValueOnce(mockProduk2);

      sequelize.MidtransOrder.findOrCreate.mockResolvedValue([{}, true]);
      sequelize.Pesanan.create.mockResolvedValue({
        ...mockPesanan,
        totalHarga: 65000, // 2*10000 + 3*15000
      });
      sequelize.PesananDetail.create.mockResolvedValue({});

      await request(app).post("/pesanan").send(multipleItemsOrder).expect(201);

      expect(sequelize.Pesanan.create).toHaveBeenCalledWith(
        expect.objectContaining({
          totalHarga: 65000,
        }),
        expect.any(Object)
      );
    });
  });

  describe("GET /pesanan/user", () => {
    const mockPesananList = [
      {
        id: "pesanan-1",
        UserId: "user-1",
        status: "menunggu",
        totalHarga: 20000,
        PesananDetails: [],
        Toko: { id: "toko-1", nama: "Test Toko" },
        MidtransOrder: { transaction_status: "pending" },
      },
    ];

    it("should get user pesanan successfully", async () => {
      sequelize.Pesanan.findAll.mockResolvedValue(mockPesananList);

      const response = await request(app).get("/pesanan/user").expect(200);

      expect(response.body).toEqual({
        message: "Berhasil mengambil daftar pesanan",
        data: mockPesananList,
      });

      expect(sequelize.Pesanan.findAll).toHaveBeenCalledWith({
        where: { UserId: "user-1", isDeleted: false },
        include: expect.any(Array),
        order: [["createdAt", "DESC"]],
      });
    });

    it("should handle database errors", async () => {
      sequelize.Pesanan.findAll.mockRejectedValue(new Error("Database Error"));

      const response = await request(app).get("/pesanan/user").expect(500);

      expect(response.body).toEqual({
        message: "Gagal mengambil pesanan",
        detail: "Database Error",
      });
    });
  });

  describe("GET /pesanan/:id", () => {
    const mockPesanan = {
      id: "pesanan-1",
      UserId: "user-1",
      status: "menunggu",
      totalHarga: 20000,
      PesananDetails: [],
      User: { id: "user-1", name: "Test User" },
      MidtransOrder: { transaction_status: "pending" },
    };

    it("should get pesanan by id successfully", async () => {
      sequelize.Pesanan.findOne.mockResolvedValue(mockPesanan);

      const response = await request(app).get("/pesanan/pesanan-1").expect(200);

      expect(response.body).toEqual({
        message: "Berhasil mengambil detail pesanan",
        data: mockPesanan,
      });

      expect(sequelize.Pesanan.findOne).toHaveBeenCalledWith({
        where: { id: "pesanan-1", isDeleted: false },
        include: expect.any(Array),
      });
    });

    it("should return 404 when pesanan not found", async () => {
      sequelize.Pesanan.findOne.mockResolvedValue(null);

      const response = await request(app)
        .get("/pesanan/pesanan-999")
        .expect(404);

      expect(response.body).toEqual({
        message: "Pesanan tidak ditemukan",
      });
    });

    it("should handle database errors", async () => {
      sequelize.Pesanan.findOne.mockRejectedValue(new Error("Database Error"));

      const response = await request(app).get("/pesanan/pesanan-1").expect(500);

      expect(response.body).toEqual({
        message: "Gagal mengambil detail pesanan",
        detail: "Database Error",
      });
    });
  });

  describe("PUT /pesanan/status", () => {
    const updateData = {
      pesananId: "pesanan-1",
      status: "selesai",
    };

    const mockPesanan = {
      id: "pesanan-1",
      UserId: "user-1",
      status: "menunggu",
      totalHarga: 20000,
      update: jest.fn(),
    };

    it("should update pesanan status successfully", async () => {
      sequelize.Pesanan.findOne.mockResolvedValue(mockPesanan);
      mockPesanan.update.mockResolvedValue();

      const response = await request(app)
        .put("/pesanan/status")
        .send(updateData)
        .expect(200);

      expect(response.body).toEqual({
        message: "Status pesanan berhasil diperbarui",
        data: mockPesanan,
      });

      expect(mockPesanan.update).toHaveBeenCalledWith(
        { status: "selesai" },
        { transaction: mockTransaction }
      );

      expect(mockTransaction.commit).toHaveBeenCalled();
    });

    it("should return 400 when pesananId is missing", async () => {
      const response = await request(app)
        .put("/pesanan/status")
        .send({ status: "selesai" })
        .expect(400);

      expect(response.body).toEqual({
        message: "ID pesanan diperlukan",
      });

      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    it("should handle database errors and rollback transaction", async () => {
      sequelize.Pesanan.findOne.mockRejectedValue(new Error("Database Error"));

      const response = await request(app)
        .put("/pesanan/status")
        .send(updateData)
        .expect(500);

      expect(response.body).toEqual({
        message: "Gagal memperbarui status pesanan",
        detail: "Database Error",
      });

      expect(mockTransaction.rollback).toHaveBeenCalled();
    });
  });

  describe("PUT /pesanan/status-notif", () => {
    const updateData = {
      pesananId: "pesanan-1",
      status: "diterima",
    };

    const mockPesanan = {
      id: "pesanan-1",
      UserId: "user-2",
      status: "dikirim",
      totalHarga: 20000,
      update: jest.fn(),
    };

    it("should update status and send notification successfully", async () => {
      sequelize.Pesanan.findOne.mockResolvedValue(mockPesanan);
      mockPesanan.update.mockResolvedValue();
      sendNotificationToSingleUserById.mockResolvedValue();
      creditUserSaldo.mockResolvedValue();

      const response = await request(app)
        .put("/pesanan/status-notif")
        .send(updateData)
        .expect(200);

      expect(response.body).toEqual({
        message: "Status pesanan berhasil diperbarui",
        data: mockPesanan,
      });

      expect(mockPesanan.update).toHaveBeenCalledWith(
        { status: "diterima" },
        { transaction: mockTransaction }
      );

      expect(sendNotificationToSingleUserById).toHaveBeenCalledWith(
        "user-2",
        "Pesanan Diterima",
        "Pesanan Anda telah diterima. Terima kasih telah berbelanja!"
      );

      expect(creditUserSaldo).toHaveBeenCalledWith(
        "user-1",
        20000,
        mockTransaction
      );
      expect(mockTransaction.commit).toHaveBeenCalled();
    });

    it("should handle notification errors gracefully", async () => {
      sequelize.Pesanan.findOne.mockResolvedValue(mockPesanan);
      mockPesanan.update.mockResolvedValue();
      sendNotificationToSingleUserById.mockRejectedValue(
        new Error("Notification Error")
      );
      creditUserSaldo.mockResolvedValue();

      const response = await request(app)
        .put("/pesanan/status-notif")
        .send(updateData)
        .expect(200);

      expect(response.body.message).toBe("Status pesanan berhasil diperbarui");
      expect(mockTransaction.commit).toHaveBeenCalled();
    });
  });

  describe("GET /pesanan/toko/:tokoId", () => {
    const mockPesananList = [
      {
        id: "pesanan-1",
        TokoId: "toko-1",
        status: "menunggu",
        PesananDetails: [],
      },
    ];

    it("should get pesanan by toko id successfully", async () => {
      sequelize.Pesanan.findAll.mockResolvedValue(mockPesananList);

      const response = await request(app)
        .get("/pesanan/toko/toko-1")
        .expect(200);

      expect(response.body).toEqual({
        message: "Berhasil mengambil daftar pesanan",
        data: mockPesananList,
      });

      expect(sequelize.Pesanan.findAll).toHaveBeenCalledWith({
        where: { TokoId: "toko-1", isDeleted: false },
        include: expect.any(Array),
        order: [["createdAt", "DESC"]],
      });
    });

    it("should handle database errors", async () => {
      sequelize.Pesanan.findAll.mockRejectedValue(new Error("Database Error"));

      const response = await request(app)
        .get("/pesanan/toko/toko-1")
        .expect(500);

      expect(response.body).toEqual({
        message: "Gagal mengambil pesanan",
        detail: "Database Error",
      });
    });
  });

  describe("POST /pesanan/bukti", () => {
    const buktiData = {
      pesananId: "pesanan-1",
      gambar: "bukti.jpg",
    };

    const mockPesanan = {
      id: "pesanan-1",
      status: "dikirim",
      update: jest.fn(),
    };

    it("should create bukti diterima successfully", async () => {
      sequelize.Pesanan.findOne.mockResolvedValue(mockPesanan);
      sequelize.BuktiDiterima.create.mockResolvedValue({ id: "bukti-1" });
      mockPesanan.update.mockResolvedValue();

      const response = await request(app)
        .post("/pesanan/bukti")
        .send(buktiData)
        .expect(201);

      expect(response.body).toEqual({
        message: "Bukti diterima berhasil dibuat",
        data: { id: "bukti-1" },
      });

      expect(sequelize.BuktiDiterima.create).toHaveBeenCalledWith(
        {
          PesananId: "pesanan-1",
          gambar: "bukti.jpg",
        },
        { transaction: mockTransaction }
      );

      expect(mockPesanan.update).toHaveBeenCalledWith(
        { status: "diterima" },
        { transaction: mockTransaction }
      );

      expect(mockTransaction.commit).toHaveBeenCalled();
    });

    it("should return 400 when required fields are missing", async () => {
      const response = await request(app)
        .post("/pesanan/bukti")
        .send({ pesananId: "pesanan-1" }) // missing gambar
        .expect(400);

      expect(response.body).toEqual({
        message: "ID pesanan dan gambar diperlukan",
      });

      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    it("should return 404 when pesanan not found", async () => {
      sequelize.Pesanan.findOne.mockResolvedValue(null);

      const response = await request(app)
        .post("/pesanan/bukti")
        .send(buktiData)
        .expect(404);

      expect(response.body).toEqual({
        message: "Pesanan tidak ditemukan",
      });

      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    it("should handle database errors and rollback transaction", async () => {
      sequelize.Pesanan.findOne.mockRejectedValue(new Error("Database Error"));

      const response = await request(app)
        .post("/pesanan/bukti")
        .send(buktiData)
        .expect(500);

      expect(response.body).toEqual({
        message: "Gagal membuat bukti diterima",
        detail: "Database Error",
      });

      expect(mockTransaction.rollback).toHaveBeenCalled();
    });
  });
});
