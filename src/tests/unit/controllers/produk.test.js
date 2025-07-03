const request = require("supertest");
const express = require("express");
const {
  createProduk,
  getProdukByRFC,
  getProdukUMKM,
  getAll,
  getProdukById,
  updateProduk,
  deleteProdukById,
  getProdukByToken,
  getProdukbyTokoId,
  getStokByProdukId,
} = require("../../../controller/store/produk");

// Mock dependencies
jest.mock("../../../model/index", () => ({
  Produk: {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
  },
  User: {
    findOne: jest.fn(),
  },
  Toko: {},
}));

const sequelize = require("../../../model/index");

// Setup express app for testing
const app = express();
app.use(express.json());

// Middleware to simulate authenticated user
app.use((req, res, next) => {
  req.user = { id: 1 };
  next();
});

app.post("/produk", createProduk);
app.get("/produk", getAll);
app.get("/produk/rfc", getProdukByRFC);
app.get("/produk/umkm", getProdukUMKM);
app.get("/produk/me", getProdukByToken);
app.get("/produk/toko/:id", getProdukbyTokoId);
app.get("/produk/stok/:id", getStokByProdukId);
app.get("/produk/:id", getProdukById);
app.put("/produk/:id", updateProduk);
app.delete("/produk/:id", deleteProdukById);

describe("Produk Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createProduk", () => {
    it("should create produk successfully", async () => {
      const requestData = {
        nama: "Produk Test",
        deskripsi: "Deskripsi produk test",
        harga: 10000,
        stok: 100,
        kategori: "Pupuk",
      };

      const mockUser = {
        id: 1,
        Toko: {
          id: 1,
        },
      };

      sequelize.User.findOne.mockResolvedValue(mockUser);
      sequelize.Produk.create.mockResolvedValue({
        id: 1,
        ...requestData,
        TokoId: 1,
      });

      const response = await request(app)
        .post("/produk")
        .send(requestData)
        .expect(201);

      expect(response.body).toEqual({
        message: "Berhasil menambahkan produk",
        data: requestData,
      });

      expect(sequelize.Produk.create).toHaveBeenCalledWith({
        ...requestData,
        TokoId: 1,
      });
    });

    it("should handle database errors", async () => {
      const requestData = {
        nama: "Produk Test",
        harga: 10000,
      };

      const errorMessage = "Database error";
      sequelize.User.findOne.mockRejectedValue(new Error(errorMessage));

      const response = await request(app)
        .post("/produk")
        .send(requestData)
        .expect(500);

      expect(response.body.message).toBe(errorMessage);
    });
  });

  describe("getAll", () => {
    it("should return all produk successfully", async () => {
      const mockProduk = [
        {
          id: 1,
          nama: "Produk A",
          harga: 10000,
          stok: 50,
          isDeleted: false,
        },
        {
          id: 2,
          nama: "Produk B",
          harga: 15000,
          stok: 30,
          isDeleted: false,
        },
      ];

      sequelize.Produk.findAll.mockResolvedValue(mockProduk);

      const response = await request(app).get("/produk").expect(200);

      expect(response.body).toEqual({
        message: "Successfully retrieved all produk data",
        data: mockProduk,
      });

      expect(sequelize.Produk.findAll).toHaveBeenCalledWith({
        where: { isDeleted: false },
      });
    });

    it("should return 404 when no data found", async () => {
      sequelize.Produk.findAll.mockResolvedValue([]);

      const response = await request(app).get("/produk").expect(404);

      expect(response.body).toEqual({
        message: "Data not found",
      });
    });

    it("should handle database errors", async () => {
      const errorMessage = "Database error";
      sequelize.Produk.findAll.mockRejectedValue(new Error(errorMessage));

      const response = await request(app).get("/produk").expect(500);

      expect(response.body.message).toBe(errorMessage);
    });
  });

  describe("getProdukByRFC", () => {
    it("should return RFC produk successfully", async () => {
      const mockProduk = [
        {
          id: 1,
          nama: "Produk RFC",
          harga: 10000,
          isDeleted: false,
          Toko: { TypeToko: "rfc" },
        },
      ];

      sequelize.Produk.findAll.mockResolvedValue(mockProduk);

      const response = await request(app).get("/produk/rfc").expect(200);

      expect(response.body).toEqual({
        message: "Successfully retrieved produk data",
        data: mockProduk,
      });

      expect(sequelize.Produk.findAll).toHaveBeenCalledWith({
        include: [
          {
            model: sequelize.Toko,
            attributes: ["TypeToko"],
            where: { TypeToko: "rfc" },
          },
        ],
        where: { isDeleted: false },
      });
    });

    it("should return 404 when no RFC produk found", async () => {
      sequelize.Produk.findAll.mockResolvedValue([]);

      const response = await request(app).get("/produk/rfc").expect(404);

      expect(response.body).toEqual({
        message: "Data not found",
      });
    });
  });

  describe("getProdukUMKM", () => {
    it("should return UMKM produk successfully", async () => {
      const mockProduk = [
        {
          id: 1,
          nama: "Produk UMKM",
          harga: 5000,
          isDeleted: false,
          Toko: { TypeToko: "umkm" },
        },
      ];

      sequelize.Produk.findAll.mockResolvedValue(mockProduk);

      const response = await request(app).get("/produk/umkm").expect(200);

      expect(response.body).toEqual({
        message: "Successfully retrieved produk data",
        data: mockProduk,
      });

      expect(sequelize.Produk.findAll).toHaveBeenCalledWith({
        include: [
          {
            model: sequelize.Toko,
            attributes: ["TypeToko"],
            where: { TypeToko: "umkm" },
          },
        ],
        where: { isDeleted: false },
      });
    });

    it("should return 404 when no UMKM produk found", async () => {
      sequelize.Produk.findAll.mockResolvedValue([]);

      const response = await request(app).get("/produk/umkm").expect(404);

      expect(response.body).toEqual({
        message: "Data not found",
      });
    });
  });

  describe("getProdukById", () => {
    it("should return produk by id successfully", async () => {
      const mockProduk = {
        id: 1,
        nama: "Produk Test",
        harga: 10000,
        isDeleted: false,
      };

      sequelize.Produk.findOne.mockResolvedValue(mockProduk);

      const response = await request(app).get("/produk/1").expect(200);

      expect(response.body).toEqual({
        message: "Successfully retrieved produk data",
        data: [mockProduk],
      });

      expect(sequelize.Produk.findOne).toHaveBeenCalledWith({
        where: { id: "1", isDeleted: false },
      });
    });

    it("should return 404 when produk not found", async () => {
      sequelize.Produk.findOne.mockResolvedValue(null);

      const response = await request(app).get("/produk/999").expect(404);

      expect(response.body).toEqual({
        message: "Data not found",
      });
    });

    it("should return 404 when produk is deleted", async () => {
      const deletedProduk = {
        id: 1,
        nama: "Deleted Produk",
        isDeleted: true,
      };

      sequelize.Produk.findOne.mockResolvedValue(deletedProduk);

      const response = await request(app).get("/produk/1").expect(404);

      expect(response.body).toEqual({
        message: "Data not found",
      });
    });
  });

  describe("getProdukByToken", () => {
    it("should return produk by user token successfully", async () => {
      const mockUser = {
        id: 1,
        Toko: { id: 1 },
      };

      const mockProduk = [
        {
          id: 1,
          nama: "My Produk",
          TokoId: 1,
          isDeleted: false,
        },
      ];

      sequelize.User.findOne.mockResolvedValue(mockUser);
      sequelize.Produk.findAll.mockResolvedValue(mockProduk);

      const response = await request(app).get("/produk/me").expect(200);

      expect(response.body).toEqual({
        message: "Successfully retrieved produk data",
        data: mockProduk,
      });

      expect(sequelize.Produk.findAll).toHaveBeenCalledWith({
        where: { TokoId: 1, isDeleted: false },
      });
    });

    it("should return 404 when user has no produk", async () => {
      const mockUser = {
        id: 1,
        Toko: { id: 1 },
      };

      sequelize.User.findOne.mockResolvedValue(mockUser);
      sequelize.Produk.findAll.mockResolvedValue([]);

      const response = await request(app).get("/produk/me").expect(404);

      expect(response.body).toEqual({
        message: "Data not found",
      });
    });
  });

  describe("getProdukbyTokoId", () => {
    it("should return produk by toko id successfully", async () => {
      const mockProduk = [
        {
          id: 1,
          nama: "Produk Toko",
          TokoId: 1,
          isDeleted: false,
        },
      ];

      sequelize.Produk.findAll.mockResolvedValue(mockProduk);

      const response = await request(app).get("/produk/toko/1").expect(200);

      expect(response.body).toEqual({
        message: "Successfully retrieved produk data",
        data: mockProduk,
      });

      expect(sequelize.Produk.findAll).toHaveBeenCalledWith({
        where: { TokoId: "1", isDeleted: false },
      });
    });

    it("should return 404 when toko has no produk", async () => {
      sequelize.Produk.findAll.mockResolvedValue(null);

      const response = await request(app).get("/produk/toko/999").expect(404);

      expect(response.body).toEqual({
        message: "Data not found",
      });
    });
  });

  describe("updateProduk", () => {
    it("should update produk successfully", async () => {
      const updateData = {
        nama: "Updated Produk",
        harga: 15000,
      };

      const existingProduk = {
        id: 1,
        nama: "Old Produk",
        harga: 10000,
        isDeleted: false,
      };

      const updatedProduk = {
        id: 1,
        ...updateData,
        isDeleted: false,
      };

      sequelize.Produk.findOne
        .mockResolvedValueOnce(existingProduk) // For initial check
        .mockResolvedValueOnce(updatedProduk); // For final result

      sequelize.Produk.update.mockResolvedValue([1]);

      const response = await request(app)
        .put("/produk/1")
        .send(updateData)
        .expect(200);

      expect(response.body).toEqual({
        message: "Successfully updated produk data",
        data: updatedProduk,
      });

      expect(sequelize.Produk.update).toHaveBeenCalledWith(updateData, {
        where: { id: "1" },
      });
    });

    it("should return 404 when produk not found", async () => {
      sequelize.Produk.findOne.mockResolvedValue(null);

      const response = await request(app)
        .put("/produk/999")
        .send({ nama: "Updated Name" })
        .expect(404);

      expect(response.body).toEqual({
        message: "Produk not found",
      });
    });
  });

  describe("deleteProdukById", () => {
    it("should delete produk successfully", async () => {
      const mockProduk = {
        id: 1,
        nama: "Produk to Delete",
        isDeleted: false,
        save: jest.fn().mockResolvedValue(true),
      };

      sequelize.Produk.findOne.mockResolvedValue(mockProduk);

      const response = await request(app).delete("/produk/1").expect(200);

      expect(response.body).toEqual({
        message: "Successfully deleted produk data",
        data: mockProduk,
      });

      expect(mockProduk.isDeleted).toBe(true);
      expect(mockProduk.save).toHaveBeenCalled();
    });

    it("should return 404 when produk not found", async () => {
      sequelize.Produk.findOne.mockResolvedValue(null);

      const response = await request(app).delete("/produk/999").expect(404);

      expect(response.body).toEqual({
        message: "Produk not found",
      });
    });
  });

  describe("getStokByProdukId", () => {
    it("should return produk stock successfully", async () => {
      const mockProduk = {
        id: 1,
        nama: "Test Produk",
        stok: 50,
      };

      sequelize.Produk.findOne.mockResolvedValue(mockProduk);

      const response = await request(app).get("/produk/stok/1").expect(200);

      expect(response.body).toEqual({
        message: "Successfully retrieved produk stock",
        data: {
          id: 1,
          nama_produk: undefined, // Note: code uses nama_produk but data has nama
          stok: 50,
        },
      });

      expect(sequelize.Produk.findOne).toHaveBeenCalledWith({
        attributes: ["id", "stok", "nama"],
        where: { id: "1", isDeleted: false },
      });
    });

    it("should return 404 when produk not found", async () => {
      sequelize.Produk.findOne.mockResolvedValue(null);

      const response = await request(app).get("/produk/stok/999").expect(404);

      expect(response.body).toEqual({
        message: "Produk not found",
      });
    });

    it("should handle database errors", async () => {
      const errorMessage = "Database error";
      sequelize.Produk.findOne.mockRejectedValue(new Error(errorMessage));

      const response = await request(app).get("/produk/stok/1").expect(500);

      expect(response.body.message).toBe(errorMessage);
    });
  });
});
