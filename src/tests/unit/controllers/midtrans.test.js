const request = require("supertest");
const express = require("express");
const sequelize = require("../../../model/index");
const midtransController = require("../../../controller/store/midtrans");

// Mock midtrans-client
jest.mock("midtrans-client", () => ({
  Snap: jest.fn().mockImplementation(() => ({
    createTransaction: jest.fn(),
  })),
  CoreApi: jest.fn().mockImplementation(() => ({
    transaction: {
      status: jest.fn(),
    },
  })),
}));

// Mock sequelize models
jest.mock("../../../model/index", () => ({
  Produk: {
    findAll: jest.fn(),
  },
}));

jest.mock("../../../model", () => ({
  Pesanan: {
    findOne: jest.fn(),
    update: jest.fn(),
  },
  PesananDetail: {},
  MidtransOrder: {
    upsert: jest.fn(),
    destroy: jest.fn(),
  },
}));

const midtransClient = require("midtrans-client");
const { Pesanan, PesananDetail, MidtransOrder } = require("../../../model");

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
app.post("/midtrans/transaction", midtransController.createTransaction);
app.get("/midtrans/status/:id", midtransController.getTransactionStatus);
app.post("/midtrans/recreate", midtransController.recreateTransaction);
app.post("/midtrans/webhook", midtransController.handleWebhook);

describe("Midtrans Controller", () => {
  let mockSnap;
  let mockCoreApi;

  beforeEach(() => {
    jest.clearAllMocks();

    mockSnap = {
      createTransaction: jest.fn(),
    };

    mockCoreApi = {
      transaction: {
        status: jest.fn(),
      },
    };

    midtransClient.Snap.mockImplementation(() => mockSnap);
    midtransClient.CoreApi.mockImplementation(() => mockCoreApi);
  });

  describe("POST /midtrans/transaction", () => {
    const mockProducts = [
      {
        id: "prod-1",
        nama: "Product 1",
        harga: 10000,
      },
      {
        id: "prod-2",
        nama: "Product 2",
        harga: 15000,
      },
    ];

    const orderData = {
      orderId: "order-123",
      items: [
        { id: "prod-1", jumlah: 2 },
        { id: "prod-2", jumlah: 1 },
      ],
    };

    it("should create transaction successfully", async () => {
      sequelize.Produk.findAll.mockResolvedValue(mockProducts);
      mockSnap.createTransaction.mockResolvedValue({
        token: "mock-token",
        redirect_url: "https://sandbox.midtrans.com/snap/v1/payment",
      });

      const response = await request(app)
        .post("/midtrans/transaction")
        .send(orderData)
        .expect(201);

      expect(response.body).toEqual({
        message: "Transaksi berhasil dibuat",
        token: "mock-token",
        redirect_url: "https://sandbox.midtrans.com/snap/v1/payment",
        order_items: [
          {
            id: "prod-1",
            price: 10000,
            quantity: 2,
            name: "Product 1",
          },
          {
            id: "prod-2",
            price: 15000,
            quantity: 1,
            name: "Product 2",
          },
        ],
        order_id: "order-123",
      });

      expect(sequelize.Produk.findAll).toHaveBeenCalledWith({
        where: { id: ["prod-1", "prod-2"] },
        attributes: ["id", "nama", "harga"],
      });

      expect(mockSnap.createTransaction).toHaveBeenCalledWith({
        transaction_details: {
          order_id: "order-123",
          gross_amount: 35000, // 2*10000 + 1*15000
        },
        item_details: [
          {
            id: "prod-1",
            price: 10000,
            quantity: 2,
            name: "Product 1",
          },
          {
            id: "prod-2",
            price: 15000,
            quantity: 1,
            name: "Product 2",
          },
        ],
        customer_details: {
          first_name: "Test User",
          email: "test@example.com",
        },
      });
    });

    it("should return 400 when items array is empty", async () => {
      const response = await request(app)
        .post("/midtrans/transaction")
        .send({ orderId: "order-123", items: [] })
        .expect(400);

      expect(response.body).toEqual({
        message: "Daftar produk tidak boleh kosong",
      });
    });

    it("should return 400 when items is not an array", async () => {
      const response = await request(app)
        .post("/midtrans/transaction")
        .send({ orderId: "order-123", items: "not-array" })
        .expect(400);

      expect(response.body).toEqual({
        message: "Daftar produk tidak boleh kosong",
      });
    });

    it("should return 400 when some products not found", async () => {
      sequelize.Produk.findAll.mockResolvedValue([mockProducts[0]]); // Only return first product

      const response = await request(app)
        .post("/midtrans/transaction")
        .send(orderData)
        .expect(400);

      expect(response.body).toEqual({
        message: "Beberapa produk tidak ditemukan",
      });
    });

    it("should handle midtrans API errors", async () => {
      sequelize.Produk.findAll.mockResolvedValue(mockProducts);
      mockSnap.createTransaction.mockRejectedValue(
        new Error("Midtrans API Error")
      );

      const response = await request(app)
        .post("/midtrans/transaction")
        .send(orderData)
        .expect(500);

      expect(response.body).toEqual({
        message: "Gagal membuat transaksi",
        detail: "Midtrans API Error",
      });
    });

    it("should handle database errors", async () => {
      sequelize.Produk.findAll.mockRejectedValue(new Error("Database Error"));

      const response = await request(app)
        .post("/midtrans/transaction")
        .send(orderData)
        .expect(500);

      expect(response.body).toEqual({
        message: "Gagal membuat transaksi",
        detail: "Database Error",
      });
    });

    it("should use default user details when not provided", async () => {
      // Override user for this test
      app.use((req, res, next) => {
        req.user = {};
        next();
      });

      sequelize.Produk.findAll.mockResolvedValue(mockProducts);
      mockSnap.createTransaction.mockResolvedValue({
        token: "mock-token",
        redirect_url: "https://sandbox.midtrans.com/snap/v1/payment",
      });

      await request(app)
        .post("/midtrans/transaction")
        .send(orderData)
        .expect(201);

      expect(mockSnap.createTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          customer_details: {
            first_name: "User",
            email: "user@example.com",
          },
        })
      );
    });
  });

  describe("GET /midtrans/status/:id", () => {
    it("should get transaction status successfully", async () => {
      const mockStatus = {
        order_id: "order-123",
        transaction_status: "settlement",
        payment_type: "bank_transfer",
      };

      mockCoreApi.transaction.status.mockResolvedValue(mockStatus);

      const response = await request(app)
        .get("/midtrans/status/order-123")
        .expect(200);

      expect(response.body).toEqual({
        message: "Status transaksi berhasil diambil",
        data: mockStatus,
      });

      expect(mockCoreApi.transaction.status).toHaveBeenCalledWith("order-123");
    });

    it("should return 400 when order ID is not provided", async () => {
      const response = await request(app).get("/midtrans/status/").expect(404); // Express returns 404 for missing route params
    });

    it("should handle midtrans API errors", async () => {
      mockCoreApi.transaction.status.mockRejectedValue(
        new Error("Transaction not found")
      );

      const response = await request(app)
        .get("/midtrans/status/order-123")
        .expect(500);

      expect(response.body).toEqual({
        message: "Gagal mengambil status transaksi",
        detail: "Transaction not found",
      });
    });
  });

  describe("POST /midtrans/recreate", () => {
    const mockPesanan = {
      id: "pesanan-1",
      totalHarga: 25000,
      MidtransOrderId: "old-order-123",
      PesananDetails: [
        {
          jumlah: 2,
          Produk: {
            id: "prod-1",
            nama: "Product 1",
            harga: 10000,
          },
        },
        {
          jumlah: 1,
          Produk: {
            id: "prod-2",
            nama: "Product 2",
            harga: 5000,
          },
        },
      ],
    };

    it("should recreate transaction successfully", async () => {
      Pesanan.findOne.mockResolvedValue(mockPesanan);
      mockSnap.createTransaction.mockResolvedValue({
        redirect_url: "https://sandbox.midtrans.com/snap/v1/payment",
      });
      MidtransOrder.upsert.mockResolvedValue([{}, true]);
      MidtransOrder.destroy.mockResolvedValue(1);
      Pesanan.update.mockResolvedValue([1]);

      const response = await request(app)
        .post("/midtrans/recreate")
        .send({
          orderId: "new-order-123",
          pesananId: "pesanan-1",
        })
        .expect(201);

      expect(response.body).toEqual({
        order_id: "pesanan-1",
        redirect_url: "https://sandbox.midtrans.com/snap/v1/payment",
      });

      expect(Pesanan.findOne).toHaveBeenCalledWith({
        where: { id: "pesanan-1" },
        include: [
          {
            model: PesananDetail,
            include: [expect.anything()], // Produk model
          },
        ],
      });

      expect(mockSnap.createTransaction).toHaveBeenCalledWith({
        transaction_details: {
          order_id: expect.stringMatching(/^new-order-123\d+$/),
          gross_amount: 25000,
        },
        item_details: [
          {
            id: "prod-1",
            name: "Product 1",
            quantity: 2,
            price: 10000,
          },
          {
            id: "prod-2",
            name: "Product 2",
            quantity: 1,
            price: 5000,
          },
        ],
        customer_details: {
          first_name: "Test User",
          email: "test@example.com",
        },
      });
    });

    it("should return 404 when pesanan not found", async () => {
      Pesanan.findOne.mockResolvedValue(null);

      const response = await request(app)
        .post("/midtrans/recreate")
        .send({
          orderId: "new-order-123",
          pesananId: "pesanan-999",
        })
        .expect(404);

      expect(response.body).toEqual({
        message: "Pesanan tidak ditemukan",
      });
    });

    it("should handle midtrans API errors", async () => {
      Pesanan.findOne.mockResolvedValue(mockPesanan);
      mockSnap.createTransaction.mockRejectedValue(
        new Error("Midtrans API Error")
      );

      const response = await request(app)
        .post("/midtrans/recreate")
        .send({
          orderId: "new-order-123",
          pesananId: "pesanan-1",
        })
        .expect(500);

      expect(response.body).toEqual({
        message: "Gagal membuat transaksi",
        detail: "Midtrans API Error",
      });
    });
  });

  describe("POST /midtrans/webhook", () => {
    const webhookData = {
      order_id: "order-123",
      transaction_status: "settlement",
      transaction_id: "midtrans-123",
      payment_type: "bank_transfer",
      va_numbers: [
        {
          bank: "bca",
          va_number: "12345678901",
        },
      ],
      gross_amount: "25000.00",
      transaction_time: "2024-01-01 10:00:00",
      expiry_time: "2024-01-01 23:59:59",
      fraud_status: "accept",
    };

    it("should handle webhook successfully", async () => {
      MidtransOrder.upsert.mockResolvedValue([{}, true]);

      const response = await request(app)
        .post("/midtrans/webhook")
        .send(webhookData)
        .expect(200);

      expect(response.body).toEqual({
        message: "Webhook diterima",
      });

      expect(MidtransOrder.upsert).toHaveBeenCalledWith({
        id: "order-123",
        transaction_id: "midtrans-123",
        transaction_status: "settlement",
        payment_type: "bank_transfer",
        bank: "bca",
        va_number: "12345678901",
        gross_amount: "25000.00",
        transaction_time: "2024-01-01 10:00:00",
        expiry_time: "2024-01-01 23:59:59",
        fraud_status: "accept",
      });
    });

    it("should handle webhook without va_numbers", async () => {
      const webhookDataWithoutVA = {
        ...webhookData,
        va_numbers: undefined,
      };

      MidtransOrder.upsert.mockResolvedValue([{}, true]);

      const response = await request(app)
        .post("/midtrans/webhook")
        .send(webhookDataWithoutVA)
        .expect(200);

      expect(MidtransOrder.upsert).toHaveBeenCalledWith({
        id: "order-123",
        transaction_id: "midtrans-123",
        transaction_status: "settlement",
        payment_type: "bank_transfer",
        bank: null,
        va_number: null,
        gross_amount: "25000.00",
        transaction_time: "2024-01-01 10:00:00",
        expiry_time: "2024-01-01 23:59:59",
        fraud_status: "accept",
      });
    });

    it("should handle database errors in webhook", async () => {
      MidtransOrder.upsert.mockRejectedValue(new Error("Database Error"));

      const response = await request(app)
        .post("/midtrans/webhook")
        .send(webhookData)
        .expect(500);

      expect(response.body).toEqual({
        message: "Gagal proses webhook",
        detail: "Database Error",
      });
    });

    it("should handle webhook with empty va_numbers array", async () => {
      const webhookDataWithEmptyVA = {
        ...webhookData,
        va_numbers: [],
      };

      MidtransOrder.upsert.mockResolvedValue([{}, true]);

      await request(app)
        .post("/midtrans/webhook")
        .send(webhookDataWithEmptyVA)
        .expect(200);

      expect(MidtransOrder.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          bank: null,
          va_number: null,
        })
      );
    });
  });
});
