const request = require("supertest");
const express = require("express");
const {
  dashboardInventaris,
} = require("../../../controller/farm/dashboardInv");

// Mock dependencies
jest.mock("../../../model/index", () => ({
  Inventaris: {
    count: jest.fn(),
    findAll: jest.fn(),
  },
  KategoriInventaris: {
    count: jest.fn(),
  },
  PenggunaanInventaris: {
    findAll: jest.fn(),
  },
  Satuan: {},
  Laporan: {},
  User: {},
}));

const sequelize = require("../../../model/index");

// Setup express app for testing
const app = express();
app.use(express.json());
app.get("/dashboard", dashboardInventaris);

describe("DashboardInv Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("dashboardInventaris", () => {
    it("should return dashboard data successfully", async () => {
      // Mock all database queries
      sequelize.Inventaris.count
        .mockResolvedValueOnce(100) // totalItem
        .mockResolvedValueOnce(5) // stokRendah
        .mockResolvedValueOnce(3) // stokHabis
        .mockResolvedValueOnce(10) // itemBaru
        .mockResolvedValueOnce(20); // itemTersedia

      sequelize.KategoriInventaris.count.mockResolvedValue(15); // totalKategori

      // Mock penggunaan data
      const mockPenggunaan = [
        { id: 1, totalJumlah: 100 },
        { id: 2, totalJumlah: 80 },
        { id: 3, totalJumlah: 60 },
        { id: 4, totalJumlah: 40 },
        { id: 5, totalJumlah: 20 },
      ];
      sequelize.Inventaris.findAll
        .mockResolvedValueOnce(mockPenggunaan)
        .mockResolvedValueOnce([
          {
            id: 1,
            nama: "Pupuk A",
            jumlah: 50,
            gambar: "pupuk-a.jpg",
            satuanId: 1,
            Satuan: { lambang: "kg" },
          },
        ]);

      // Mock daftar pemakaian terbaru
      const mockPemakaianTerbaru = [
        {
          id: 1,
          jumlah: 10,
          createdAt: new Date(),
          inventaris: { id: 1, nama: "Pupuk A" },
          laporan: {
            id: 1,
            userId: 1,
            gambar: "laporan.jpg",
            createdAt: new Date(),
            user: { name: "John Doe" },
          },
          toJSON: function () {
            return {
              id: this.id,
              jumlah: this.jumlah,
              createdAt: this.createdAt,
              inventaris: this.inventaris,
              laporan: this.laporan,
            };
          },
        },
      ];
      sequelize.PenggunaanInventaris.findAll.mockResolvedValue(
        mockPemakaianTerbaru
      );

      const response = await request(app).get("/dashboard").expect(200);

      expect(response.body).toEqual({
        status: "success",
        message: "Dashboard data retrieved successfully",
        data: {
          totalItem: 100,
          stokRendah: 5,
          stokHabis: 3,
          itemBaru: 10,
          totalKategori: 15,
          itemTersedia: 20,
          seringDigunakanCount: 1, // 20% of 5 items = 1
          jarangDigunakanCount: 4,
          daftarInventaris: [
            {
              id: 1,
              nama: "Pupuk A",
              jumlah: 50,
              gambar: "pupuk-a.jpg",
              satuanId: 1,
              Satuan: { lambang: "kg" },
            },
          ],
          daftarPemakaianTerbaru: expect.any(Array),
        },
      });

      // Verify all database calls were made
      expect(sequelize.Inventaris.count).toHaveBeenCalledTimes(5);
      expect(sequelize.KategoriInventaris.count).toHaveBeenCalledTimes(1);
      expect(sequelize.Inventaris.findAll).toHaveBeenCalledTimes(2);
      expect(sequelize.PenggunaanInventaris.findAll).toHaveBeenCalledTimes(1);
    });

    it("should handle empty penggunaan array", async () => {
      // Mock all database queries with zero penggunaan
      sequelize.Inventaris.count
        .mockResolvedValueOnce(50) // totalItem
        .mockResolvedValueOnce(2) // stokRendah
        .mockResolvedValueOnce(1) // stokHabis
        .mockResolvedValueOnce(5) // itemBaru
        .mockResolvedValueOnce(10); // itemTersedia

      sequelize.KategoriInventaris.count.mockResolvedValue(8);

      // Empty penggunaan array
      sequelize.Inventaris.findAll
        .mockResolvedValueOnce([]) // penggunaan
        .mockResolvedValueOnce([]); // daftarInventaris

      sequelize.PenggunaanInventaris.findAll.mockResolvedValue([]);

      const response = await request(app).get("/dashboard").expect(200);

      expect(response.body.data.seringDigunakanCount).toBe(0);
      expect(response.body.data.jarangDigunakanCount).toBe(0);
    });

    it("should handle date formatting errors gracefully", async () => {
      // Mock console.warn to avoid test output
      const consoleSpy = jest.spyOn(console, "warn").mockImplementation();

      // Mock all required database queries
      sequelize.Inventaris.count
        .mockResolvedValueOnce(10)
        .mockResolvedValueOnce(1)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(2)
        .mockResolvedValueOnce(8);

      sequelize.KategoriInventaris.count.mockResolvedValue(5);
      sequelize.Inventaris.findAll
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      // Mock with invalid date to trigger error
      const mockPemakaianWithInvalidDate = [
        {
          id: 1,
          jumlah: 5,
          createdAt: new Date("invalid"),
          inventaris: { id: 1, nama: "Test Item" },
          laporan: {
            id: 1,
            userId: 1,
            gambar: "test.jpg",
            createdAt: new Date("invalid"),
            user: { name: "Test User" },
          },
          toJSON: function () {
            return {
              id: this.id,
              jumlah: this.jumlah,
              createdAt: this.createdAt,
              inventaris: this.inventaris,
              laporan: this.laporan,
            };
          },
        },
      ];

      // Mock toLocaleDateString to throw error
      jest
        .spyOn(Date.prototype, "toLocaleDateString")
        .mockImplementation(() => {
          throw new Error("Locale not supported");
        });

      sequelize.PenggunaanInventaris.findAll.mockResolvedValue(
        mockPemakaianWithInvalidDate
      );

      const response = await request(app).get("/dashboard").expect(200);

      expect(response.body.status).toBe("success");

      // Restore mocks
      consoleSpy.mockRestore();
      Date.prototype.toLocaleDateString.mockRestore();
    });

    it("should handle database errors", async () => {
      const errorMessage = "Database connection failed";
      sequelize.Inventaris.count.mockRejectedValue(new Error(errorMessage));

      // Mock NODE_ENV for development
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "development";

      const response = await request(app).get("/dashboard").expect(500);

      expect(response.body).toEqual({
        message: errorMessage,
        detail: expect.any(Object),
      });

      // Restore environment
      process.env.NODE_ENV = originalEnv;
    });

    it("should handle production environment errors", async () => {
      const errorMessage = "Database connection failed";
      sequelize.Inventaris.count.mockRejectedValue(new Error(errorMessage));

      // Mock NODE_ENV for production
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "production";

      const response = await request(app).get("/dashboard").expect(500);

      expect(response.body).toEqual({
        message: "Internal server error",
        detail: {},
      });

      // Restore environment
      process.env.NODE_ENV = originalEnv;
    });

    it("should calculate top percentage correctly for small arrays", async () => {
      // Mock all required database queries
      sequelize.Inventaris.count
        .mockResolvedValueOnce(30)
        .mockResolvedValueOnce(3)
        .mockResolvedValueOnce(2)
        .mockResolvedValueOnce(4)
        .mockResolvedValueOnce(25);

      sequelize.KategoriInventaris.count.mockResolvedValue(6);

      // Small penggunaan array (less than 5 items)
      const smallPenggunaan = [
        { id: 1, totalJumlah: 50 },
        { id: 2, totalJumlah: 30 },
      ];

      sequelize.Inventaris.findAll
        .mockResolvedValueOnce(smallPenggunaan)
        .mockResolvedValueOnce([]);

      sequelize.PenggunaanInventaris.findAll.mockResolvedValue([]);

      const response = await request(app).get("/dashboard").expect(200);

      // 20% of 2 items = 0.4, ceiling = 1
      expect(response.body.data.seringDigunakanCount).toBe(1);
      expect(response.body.data.jarangDigunakanCount).toBe(1);
    });

    it("should handle large penggunaan arrays", async () => {
      // Mock all required database queries
      sequelize.Inventaris.count
        .mockResolvedValueOnce(100)
        .mockResolvedValueOnce(10)
        .mockResolvedValueOnce(5)
        .mockResolvedValueOnce(15)
        .mockResolvedValueOnce(80);

      sequelize.KategoriInventaris.count.mockResolvedValue(20);

      // Large penggunaan array (10 items)
      const largePenggunaan = Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        totalJumlah: 100 - i * 10,
      }));

      sequelize.Inventaris.findAll
        .mockResolvedValueOnce(largePenggunaan)
        .mockResolvedValueOnce([]);

      sequelize.PenggunaanInventaris.findAll.mockResolvedValue([]);

      const response = await request(app).get("/dashboard").expect(200);

      // 20% of 10 items = 2
      expect(response.body.data.seringDigunakanCount).toBe(2);
      expect(response.body.data.jarangDigunakanCount).toBe(8);
    });
  });
});
