const request = require("supertest");
const express = require("express");

jest.mock("../../../model/index", () => {
  const mockArtikel = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
  };

  return {
    Artikel: mockArtikel,
    Sequelize: {
      Op: {
        like: "like",
      },
    },
    sequelize: {
      transaction: jest.fn(() => ({ commit: jest.fn(), rollback: jest.fn() })),
    },
    __esModule: true,
    default: {
      Artikel: mockArtikel,
      Sequelize: {
        Op: {
          like: "like",
        },
      },
      sequelize: {
        transaction: jest.fn(() => ({
          commit: jest.fn(),
          rollback: jest.fn(),
        })),
      },
    },
  };
});

jest.mock("../../../validation/dataValidation", () => ({
  dataValid: jest.fn(),
}));

const artikelController = require("../../../controller/store/artikel");
const originalSequelize = require("../../../model/index");
const { dataValid } = require("../../../validation/dataValidation");

const app = express();
app.use(express.json());
app.use((req, res, next) => {
  req.user = { id: "mockUserId123" };
  res.locals = {};
  next();
});

app.get("/artikel", artikelController.getAllArtikel);
app.get("/artikel/:id", artikelController.getArtikelById);
app.get("/artikel/search/:judul", artikelController.getArtikelByTitle);
app.post("/artikel", artikelController.createArtikel);
app.put("/artikel/:id", artikelController.updateArtikel);
app.delete("/artikel/:id", artikelController.deleteArtikel);

describe("Artikel Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockDate = new Date();
  const mockArtikelData = [
    {
      id: "1",
      judul: "Tips Menanam Tomat",
      images: "tomat.jpg",
      deskripsi: "Panduan lengkap menanam tomat organik",
      UserId: "user1",
      isDeleted: false,
      createdAt: mockDate,
      updatedAt: mockDate,
    },
    {
      id: "2",
      judul: "Cara Merawat Ayam Petelur",
      images: "ayam.jpg",
      deskripsi: "Tips merawat ayam petelur agar produktif",
      UserId: "user2",
      isDeleted: false,
      createdAt: mockDate,
      updatedAt: mockDate,
    },
  ];

  describe("GET /artikel", () => {
    it("should return 200 and all artikel when data exists", async () => {
      originalSequelize.Artikel.findAll.mockResolvedValue(mockArtikelData);

      const response = await request(app).get("/artikel");

      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe(
        "Successfully retrieved all artikel data"
      );
      expect(response.body.data).toEqual(mockArtikelData);
      expect(originalSequelize.Artikel.findAll).toHaveBeenCalledWith({
        where: {
          isDeleted: false,
        },
      });
    });

    it("should return 404 when no artikel found", async () => {
      originalSequelize.Artikel.findAll.mockResolvedValue([]);

      const response = await request(app).get("/artikel");

      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe("Data not found");
    });

    it("should return 500 on database error", async () => {
      originalSequelize.Artikel.findAll.mockRejectedValue(
        new Error("Database error")
      );

      const response = await request(app).get("/artikel");

      expect(response.statusCode).toBe(500);
      expect(response.body.message).toBe("Database error");
    });
  });

  describe("GET /artikel/:id", () => {
    it("should return artikel by id when found", async () => {
      const mockArtikel = mockArtikelData[0];
      originalSequelize.Artikel.findOne.mockResolvedValue(mockArtikel);

      const response = await request(app).get("/artikel/1");

      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe("Successfully retrieved artikel data");
      expect(response.body.data).toEqual(mockArtikel);
      expect(originalSequelize.Artikel.findOne).toHaveBeenCalledWith({
        where: {
          id: "1",
          isDeleted: false,
        },
      });
    });

    it("should return 404 when artikel not found", async () => {
      originalSequelize.Artikel.findOne.mockResolvedValue(null);

      const response = await request(app).get("/artikel/999");

      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe("Data not found");
    });

    it("should return 404 when artikel is deleted", async () => {
      const deletedArtikel = { ...mockArtikelData[0], isDeleted: true };
      originalSequelize.Artikel.findOne.mockResolvedValue(deletedArtikel);

      const response = await request(app).get("/artikel/1");

      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe("Data not found");
    });

    it("should handle database errors", async () => {
      originalSequelize.Artikel.findOne.mockRejectedValue(
        new Error("Database error")
      );

      const response = await request(app).get("/artikel/1");

      expect(response.statusCode).toBe(500);
      expect(response.body.message).toBe("Database error");
    });
  });

  describe("GET /artikel/search/:judul", () => {
    it("should return artikel matching search term", async () => {
      const searchResults = [mockArtikelData[0]];
      originalSequelize.Artikel.findAll.mockResolvedValue(searchResults);

      const response = await request(app).get("/artikel/search/tomat");

      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe("Successfully retrieved artikel data");
      expect(response.body.data).toEqual(searchResults);
      expect(originalSequelize.Artikel.findAll).toHaveBeenCalledWith({
        where: {
          judul: {
            like: "%tomat%",
          },
          isDeleted: false,
        },
      });
    });

    it("should return 404 when no matches found", async () => {
      originalSequelize.Artikel.findAll.mockResolvedValue([]);

      const response = await request(app).get("/artikel/search/nonexistent");

      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe("Data not found");
    });

    it("should handle database errors in search", async () => {
      originalSequelize.Artikel.findAll.mockRejectedValue(
        new Error("Search error")
      );

      const response = await request(app).get("/artikel/search/tomat");

      expect(response.statusCode).toBe(500);
      expect(response.body.message).toBe("Search error");
    });

    it("should handle special characters in search term", async () => {
      originalSequelize.Artikel.findAll.mockResolvedValue([]);

      const response = await request(app).get("/artikel/search/@#$%");

      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe("Data not found");
    });

    it("should handle empty search term", async () => {
      originalSequelize.Artikel.findAll.mockResolvedValue(mockArtikelData);

      const response = await request(app).get("/artikel/search/");

      expect(response.statusCode).toBe(404);
    });
  });

  describe("POST /artikel", () => {
    it("should create artikel successfully", async () => {
      const newArtikel = {
        id: "3",
        judul: "Budidaya Cabai",
        images: "cabai.jpg",
        deskripsi: "Cara budidaya cabai yang baik",
        UserId: "user1",
        isDeleted: false,
        createdAt: mockDate,
        updatedAt: mockDate,
      };

      originalSequelize.Artikel.create.mockResolvedValue(newArtikel);

      const response = await request(app).post("/artikel").send({
        judul: "Budidaya Cabai",
        images: "cabai.jpg",
        deskripsi: "Cara budidaya cabai yang baik",
      });

      expect(response.statusCode).toBe(201);
      expect(response.body.message).toBe(
        "Successfully created new artikel data"
      );
      expect(response.body.data).toEqual(newArtikel);
      expect(originalSequelize.Artikel.create).toHaveBeenCalledWith({
        judul: "Budidaya Cabai",
        images: "cabai.jpg",
        deskripsi: "Cara budidaya cabai yang baik",
        UserId: "mockUserId123",
      });
    });

    it("should return 400 when judul is missing", async () => {
      const response = await request(app).post("/artikel").send({
        images: "test.jpg",
        deskripsi: "Test description",
      });

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe(
        "Fields judul and deskripsi are required."
      );
    });

    it("should return 400 when deskripsi is missing", async () => {
      const response = await request(app).post("/artikel").send({
        judul: "Test Title",
        images: "test.jpg",
      });

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe(
        "Fields judul and deskripsi are required."
      );
    });

    it("should return 400 when both judul and deskripsi are missing", async () => {
      const response = await request(app).post("/artikel").send({
        images: "test.jpg",
      });

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe(
        "Fields judul and deskripsi are required."
      );
    });

    it("should handle database errors during creation", async () => {
      originalSequelize.Artikel.create.mockRejectedValue(
        new Error("Database error")
      );

      const response = await request(app).post("/artikel").send({
        judul: "Test Title",
        deskripsi: "Test description",
      });

      expect(response.statusCode).toBe(500);
      expect(response.body.message).toBe("Database error");
    });

    it("should create artikel without images", async () => {
      const newArtikel = {
        id: "3",
        judul: "Budidaya Cabai",
        images: null,
        deskripsi: "Cara budidaya cabai yang baik",
        UserId: "user1",
        isDeleted: false,
        createdAt: mockDate,
        updatedAt: mockDate,
      };

      originalSequelize.Artikel.create.mockResolvedValue(newArtikel);

      const response = await request(app).post("/artikel").send({
        judul: "Budidaya Cabai",
        deskripsi: "Cara budidaya cabai yang baik",
      });

      expect(response.statusCode).toBe(201);
      expect(response.body.data.images).toBeUndefined();
    });
  });

  describe("PUT /artikel/:id", () => {
    it("should update artikel successfully", async () => {
      originalSequelize.Artikel.update.mockResolvedValue([1]);

      const response = await request(app).put("/artikel/1").send({
        judul: "Updated Title",
        deskripsi: "Updated description",
      });

      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe("Successfully updated artikel data");
      expect(originalSequelize.Artikel.update).toHaveBeenCalledWith(
        { judul: "Updated Title", deskripsi: "Updated description" },
        { where: { id: "1" } }
      );
    });

    it("should return 404 when artikel not found for update", async () => {
      originalSequelize.Artikel.update.mockResolvedValue([0]);

      const response = await request(app).put("/artikel/999").send({
        judul: "Updated Title",
      });

      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe("Data not found");
    });

    it("should handle database errors during update", async () => {
      originalSequelize.Artikel.update.mockRejectedValue(
        new Error("Database error")
      );

      const response = await request(app).put("/artikel/1").send({
        judul: "Updated Title",
      });

      expect(response.statusCode).toBe(500);
      expect(response.body.message).toBe("Database error");
    });

    it("should handle empty update data", async () => {
      originalSequelize.Artikel.update.mockResolvedValue([1]);

      const response = await request(app).put("/artikel/1").send({});

      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe("Successfully updated artikel data");
    });

    it("should handle partial updates", async () => {
      originalSequelize.Artikel.update.mockResolvedValue([1]);

      const response = await request(app).put("/artikel/1").send({
        judul: "Only Title Updated",
      });

      expect(response.statusCode).toBe(200);
      expect(originalSequelize.Artikel.update).toHaveBeenCalledWith(
        { judul: "Only Title Updated" },
        { where: { id: "1" } }
      );
    });
  });

  describe("DELETE /artikel/:id", () => {
    it("should delete artikel successfully (soft delete)", async () => {
      originalSequelize.Artikel.update.mockResolvedValue([1]);

      const response = await request(app).delete("/artikel/1");

      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe("Successfully deleted artikel data");
      expect(originalSequelize.Artikel.update).toHaveBeenCalledWith(
        { isDeleted: true },
        { where: { id: "1" } }
      );
    });

    it("should return 404 when artikel not found for deletion", async () => {
      originalSequelize.Artikel.update.mockResolvedValue([0]);

      const response = await request(app).delete("/artikel/999");

      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe("Data not found");
    });

    it("should handle database errors during deletion", async () => {
      originalSequelize.Artikel.update.mockRejectedValue(
        new Error("Database error")
      );

      const response = await request(app).delete("/artikel/1");

      expect(response.statusCode).toBe(500);
      expect(response.body.message).toBe("Database error");
    });
  });

  describe("Edge cases and boundary testing", () => {
    it("should handle very long judul in creation", async () => {
      const longJudul = "a".repeat(1000);
      originalSequelize.Artikel.create.mockRejectedValue(
        new Error("Value too long for column judul")
      );

      const response = await request(app).post("/artikel").send({
        judul: longJudul,
        deskripsi: "Test description",
      });

      expect(response.statusCode).toBe(500);
      expect(response.body.message).toBe("Value too long for column judul");
    });

    it("should handle very long deskripsi in creation", async () => {
      const longDeskripsi = "a".repeat(10000);
      originalSequelize.Artikel.create.mockRejectedValue(
        new Error("Value too long for column deskripsi")
      );

      const response = await request(app).post("/artikel").send({
        judul: "Test Title",
        deskripsi: longDeskripsi,
      });

      expect(response.statusCode).toBe(500);
      expect(response.body.message).toBe("Value too long for column deskripsi");
    });

    it("should handle null values in request body", async () => {
      const response = await request(app).post("/artikel").send({
        judul: null,
        deskripsi: null,
        images: null,
      });

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe(
        "Fields judul and deskripsi are required."
      );
    });

    it("should handle undefined values in request body", async () => {
      const response = await request(app).post("/artikel").send({
        judul: undefined,
        deskripsi: undefined,
        images: undefined,
      });

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe(
        "Fields judul and deskripsi are required."
      );
    });

    it("should handle empty string values", async () => {
      const response = await request(app).post("/artikel").send({
        judul: "",
        deskripsi: "",
        images: "",
      });

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe(
        "Fields judul and deskripsi are required."
      );
    });

    it("should handle whitespace-only values", async () => {
      const response = await request(app).post("/artikel").send({
        judul: "   ",
        deskripsi: "   ",
        images: "   ",
      });

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe(
        "Fields judul and deskripsi are required."
      );
    });
  });

  describe("Search functionality edge cases", () => {
    it("should handle case-insensitive search", async () => {
      originalSequelize.Artikel.findAll.mockResolvedValue([mockArtikelData[0]]);

      const response = await request(app).get("/artikel/search/TOMAT");

      expect(response.statusCode).toBe(200);
      expect(originalSequelize.Artikel.findAll).toHaveBeenCalledWith({
        where: {
          judul: {
            like: "%TOMAT%",
          },
          isDeleted: false,
        },
      });
    });

    it("should handle search with spaces", async () => {
      originalSequelize.Artikel.findAll.mockResolvedValue([mockArtikelData[0]]);

      const response = await request(app).get("/artikel/search/tips menanam");

      expect(response.statusCode).toBe(200);
      expect(originalSequelize.Artikel.findAll).toHaveBeenCalledWith({
        where: {
          judul: {
            like: "%tips menanam%",
          },
          isDeleted: false,
        },
      });
    });

    it("should handle search with encoded characters", async () => {
      originalSequelize.Artikel.findAll.mockResolvedValue([]);

      const response = await request(app).get("/artikel/search/%20test%20");

      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe("Data not found");
    });
  });

  describe("User context testing", () => {
    it("should use correct user ID from request context", async () => {
      const newArtikel = {
        id: "3",
        judul: "Test Title",
        deskripsi: "Test description",
        UserId: "mockUserId123",
      };

      originalSequelize.Artikel.create.mockResolvedValue(newArtikel);

      const response = await request(app).post("/artikel").send({
        judul: "Test Title",
        deskripsi: "Test description",
      });

      expect(response.statusCode).toBe(201);
      expect(originalSequelize.Artikel.create).toHaveBeenCalledWith({
        judul: "Test Title",
        deskripsi: "Test description",
        UserId: "mockUserId123",
      });
    });
  });
});
