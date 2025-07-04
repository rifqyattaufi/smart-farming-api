const request = require("supertest");
const express = require("express");
const {
  createKeranjang,
  getKeranjangByUserId,
  updateKeranjang,
  deleteKeranjang,
} = require("../../../controller/store/keranjang");

// Mock dependencies
jest.mock("../../../model/index", () => ({
  Keranjang: {
    findOne: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
  },
  Produk: {},
  Toko: {},
}));

jest.mock("../../../validation/dataValidation", () => ({
  dataValid: jest.fn(),
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

app.post("/keranjang", createKeranjang);
app.get("/keranjang", getKeranjangByUserId);
app.put("/keranjang/:id", updateKeranjang);
app.delete("/keranjang/:id", deleteKeranjang);

describe("Keranjang Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock console.error to avoid test output
    jest.spyOn(console, "error").mockImplementation();
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  describe("createKeranjang", () => {
    it("should create new cart item successfully", async () => {
      const requestData = {
        produkId: 1,
        jumlah: 2,
      };

      const mockCreatedData = {
        id: 1,
        ProdukId: 1,
        UserId: 1,
        jumlah: 2,
        isDeleted: false,
      };

      sequelize.Keranjang.findOne.mockResolvedValue(null); // No existing item
      sequelize.Keranjang.create.mockResolvedValue(mockCreatedData);

      const response = await request(app)
        .post("/keranjang")
        .send(requestData)
        .expect(201);

      expect(response.body).toEqual({
        message: "Successfully added to cart",
        data: mockCreatedData,
      });

      expect(sequelize.Keranjang.findOne).toHaveBeenCalledWith({
        where: {
          ProdukId: 1,
          UserId: 1,
          isDeleted: false,
        },
      });

      expect(sequelize.Keranjang.create).toHaveBeenCalledWith({
        ProdukId: 1,
        jumlah: 2,
        UserId: 1,
      });
    });

    it("should update existing cart item quantity", async () => {
      const requestData = {
        produkId: 1,
        jumlah: 3,
      };

      const existingCartItem = {
        id: 1,
        ProdukId: 1,
        UserId: 1,
        jumlah: 2,
        save: jest.fn().mockResolvedValue(true),
      };

      sequelize.Keranjang.findOne.mockResolvedValue(existingCartItem);

      const response = await request(app)
        .post("/keranjang")
        .send(requestData)
        .expect(200);

      expect(response.body).toEqual({
        message: "Cart quantity updated successfully",
        data: existingCartItem,
      });

      expect(existingCartItem.jumlah).toBe(5); // 2 + 3
      expect(existingCartItem.save).toHaveBeenCalled();
    });

    it("should return 400 for missing produkId", async () => {
      const requestData = {
        jumlah: 2,
      };

      const response = await request(app)
        .post("/keranjang")
        .send(requestData)
        .expect(400);

      expect(response.body).toEqual({
        message: "Product ID and quantity greater than 0 are required",
      });
    });

    it("should return 400 for missing jumlah", async () => {
      const requestData = {
        produkId: 1,
      };

      const response = await request(app)
        .post("/keranjang")
        .send(requestData)
        .expect(400);

      expect(response.body).toEqual({
        message: "Product ID and quantity greater than 0 are required",
      });
    });

    it("should return 400 for invalid jumlah (less than 1)", async () => {
      const requestData = {
        produkId: 1,
        jumlah: 0,
      };

      const response = await request(app)
        .post("/keranjang")
        .send(requestData)
        .expect(400);

      expect(response.body).toEqual({
        message: "Product ID and quantity greater than 0 are required",
      });
    });

    it("should handle database errors", async () => {
      const requestData = {
        produkId: 1,
        jumlah: 2,
      };

      const errorMessage = "Database error";
      sequelize.Keranjang.findOne.mockRejectedValue(new Error(errorMessage));

      const response = await request(app)
        .post("/keranjang")
        .send(requestData)
        .expect(500);

      expect(response.body.message).toBe(errorMessage);
    });
  });

  describe("getKeranjangByUserId", () => {
    it("should return cart items successfully", async () => {
      const mockCartItems = [
        {
          id: 1,
          ProdukId: 1,
          UserId: 1,
          jumlah: 2,
          isDeleted: false,
          Produk: {
            id: 1,
            nama: "Produk A",
            harga: 10000,
            isDeleted: false,
            Toko: {
              id: 1,
              nama: "Toko A",
              logoToko: "logo-a.jpg",
              alamat: "Alamat A",
            },
          },
        },
        {
          id: 2,
          ProdukId: 2,
          UserId: 1,
          jumlah: 1,
          isDeleted: false,
          Produk: {
            id: 2,
            nama: "Produk B",
            harga: 15000,
            isDeleted: false,
            Toko: {
              id: 2,
              nama: "Toko B",
              logoToko: "logo-b.jpg",
              alamat: "Alamat B",
            },
          },
        },
      ];

      sequelize.Keranjang.findAll.mockResolvedValue(mockCartItems);

      const response = await request(app).get("/keranjang").expect(200);

      expect(response.body).toEqual({
        message: "Successfully retrieved cart items",
        data: mockCartItems,
      });

      expect(sequelize.Keranjang.findAll).toHaveBeenCalledWith({
        where: {
          UserId: 1,
          isDeleted: false,
        },
        include: [
          {
            model: sequelize.Produk,
            where: {
              isDeleted: false,
            },
            include: [
              {
                model: sequelize.Toko,
                attributes: ["id", "nama", "logoToko", "alamat"],
              },
            ],
          },
        ],
        order: [[sequelize.Produk, "createdAt", "DESC"]],
      });
    });

    it("should return empty array when cart is empty", async () => {
      sequelize.Keranjang.findAll.mockResolvedValue([]);

      const response = await request(app).get("/keranjang").expect(200);

      expect(response.body).toEqual({
        message: "Cart is empty",
        data: [],
      });
    });

    it("should handle database errors", async () => {
      const errorMessage = "Database error";
      sequelize.Keranjang.findAll.mockRejectedValue(new Error(errorMessage));

      const response = await request(app).get("/keranjang").expect(500);

      expect(response.body).toEqual({
        message: "Error retrieving cart items",
        detail: errorMessage,
      });
    });
  });

  describe("updateKeranjang", () => {
    it("should update cart item successfully", async () => {
      const updateData = {
        jumlah: 5,
      };

      const mockCartItem = {
        id: 1,
        ProdukId: 1,
        UserId: 1,
        jumlah: 2,
        isDeleted: false,
        save: jest.fn().mockResolvedValue(true),
      };

      sequelize.Keranjang.findOne.mockResolvedValue(mockCartItem);

      const response = await request(app)
        .put("/keranjang/1")
        .send(updateData)
        .expect(200);

      expect(response.body).toEqual({
        message: "Cart item updated successfully",
        data: mockCartItem,
      });

      expect(mockCartItem.jumlah).toBe(5);
      expect(mockCartItem.save).toHaveBeenCalled();

      expect(sequelize.Keranjang.findOne).toHaveBeenCalledWith({
        where: {
          id: "1",
          UserId: 1,
          isDeleted: false,
        },
      });
    });

    it("should return 400 for missing jumlah", async () => {
      const response = await request(app)
        .put("/keranjang/1")
        .send({})
        .expect(400);

      expect(response.body).toEqual({
        message: "Jumlah salah, keranjang tidak bisa berjumlah 0.",
      });
    });

    it("should return 400 for invalid jumlah (less than 1)", async () => {
      const updateData = {
        jumlah: 0,
      };

      const response = await request(app)
        .put("/keranjang/1")
        .send(updateData)
        .expect(400);

      expect(response.body).toEqual({
        message: "Jumlah salah, keranjang tidak bisa berjumlah 0.",
      });
    });

    it("should return 404 when cart item not found", async () => {
      const updateData = {
        jumlah: 5,
      };

      sequelize.Keranjang.findOne.mockResolvedValue(null);

      const response = await request(app)
        .put("/keranjang/999")
        .send(updateData)
        .expect(404);

      expect(response.body).toEqual({
        message: "Cart item not found",
      });
    });

    it("should handle database errors", async () => {
      const updateData = {
        jumlah: 5,
      };

      const errorMessage = "Database error";
      sequelize.Keranjang.findOne.mockRejectedValue(new Error(errorMessage));

      const response = await request(app)
        .put("/keranjang/1")
        .send(updateData)
        .expect(500);

      expect(response.body).toEqual({
        message: "Error updating cart item",
        detail: errorMessage,
      });
    });
  });

  describe("deleteKeranjang", () => {
    it("should delete cart item successfully", async () => {
      const mockCartItem = {
        id: 1,
        ProdukId: 1,
        UserId: 1,
        jumlah: 2,
        isDeleted: false,
        save: jest.fn().mockResolvedValue(true),
      };

      sequelize.Keranjang.findOne.mockResolvedValue(mockCartItem);

      const response = await request(app).delete("/keranjang/1").expect(200);

      expect(response.body).toEqual({
        message: "Cart item deleted successfully",
      });

      expect(mockCartItem.isDeleted).toBe(true);
      expect(mockCartItem.save).toHaveBeenCalled();

      expect(sequelize.Keranjang.findOne).toHaveBeenCalledWith({
        where: {
          id: "1",
          UserId: 1,
          isDeleted: false,
        },
      });
    });

    it("should return 404 when cart item not found", async () => {
      sequelize.Keranjang.findOne.mockResolvedValue(null);

      const response = await request(app).delete("/keranjang/999").expect(404);

      expect(response.body).toEqual({
        message: "Cart item not found",
      });
    });

    it("should handle database errors", async () => {
      const errorMessage = "Database error";
      sequelize.Keranjang.findOne.mockRejectedValue(new Error(errorMessage));

      const response = await request(app).delete("/keranjang/1").expect(500);

      expect(response.body).toEqual({
        message: "Error deleting cart item",
        detail: errorMessage,
      });
    });
  });
});
