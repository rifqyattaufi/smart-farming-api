const request = require("supertest");
const express = require("express");

jest.mock("../../../model/index", () => {
  const mockUnitBudidaya = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    findAndCountAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
  };

  const mockJenisBudidaya = {
    findOne: jest.fn(),
  };

  const mockObjekBudidaya = {
    findAll: jest.fn(),
  };

  const mockScheduledUnitNotification = {
    create: jest.fn(),
    destroy: jest.fn(),
  };

  const mockLogs = {
    create: jest.fn(),
  };

  return {
    UnitBudidaya: mockUnitBudidaya,
    JenisBudidaya: mockJenisBudidaya,
    ObjekBudidaya: mockObjekBudidaya,
    ScheduledUnitNotification: mockScheduledUnitNotification,
    Logs: mockLogs,
    sequelize: {
      transaction: jest.fn(() => ({ commit: jest.fn(), rollback: jest.fn() })),
      fn: jest.fn(),
      col: jest.fn(),
    },
    Sequelize: {
      Op: {
        like: "like",
        iLike: "iLike",
      },
    },
    __esModule: true,
    default: {
      UnitBudidaya: mockUnitBudidaya,
      JenisBudidaya: mockJenisBudidaya,
      ObjekBudidaya: mockObjekBudidaya,
      ScheduledUnitNotification: mockScheduledUnitNotification,
      Logs: mockLogs,
      sequelize: {
        transaction: jest.fn(() => ({
          commit: jest.fn(),
          rollback: jest.fn(),
        })),
        fn: jest.fn(),
        col: jest.fn(),
      },
      Sequelize: {
        Op: {
          like: "like",
          iLike: "iLike",
        },
      },
    },
  };
});

jest.mock("../../../utils/paginationUtils", () => ({
  getPaginationOptions: jest.fn(),
}));

const unitBudidayaController = require("../../../controller/farm/unitBudidaya");
const originalSequelize = require("../../../model/index");
const { getPaginationOptions } = require("../../../utils/paginationUtils");

const app = express();
app.use(express.json());
app.use((req, res, next) => {
  req.user = { id: "mockUserId123" };
  res.locals = {};
  next();
});

app.get("/unit-budidaya", unitBudidayaController.getAllUnitBudidaya);
app.get("/unit-budidaya/:id", unitBudidayaController.getUnitBudidayaById);
app.get(
  "/unit-budidaya/search/:nama",
  unitBudidayaController.getUnitBudidayaByName
);
app.get(
  "/unit-budidaya/jenis/:jenisId",
  unitBudidayaController.getUnitBudidayaByJenis
);
app.post("/unit-budidaya", unitBudidayaController.createUnitBudidaya);
app.put("/unit-budidaya/:id", unitBudidayaController.updateUnitBudidaya);
app.delete("/unit-budidaya/:id", unitBudidayaController.deleteUnitBudidaya);

describe("UnitBudidaya Controller", () => {
  let mockTransaction;

  beforeEach(() => {
    jest.clearAllMocks();
    mockTransaction = { commit: jest.fn(), rollback: jest.fn() };
    originalSequelize.sequelize.transaction.mockReturnValue(mockTransaction);

    // Setup mock functions for sequelize functions
    originalSequelize.sequelize.fn.mockReturnValue("fn_mock");
    originalSequelize.sequelize.col.mockReturnValue("col_mock");

    getPaginationOptions.mockReturnValue({
      limit: 10,
      offset: 0,
    });
  });

  const mockDate = new Date();
  const mockUnitBudidayaData = [
    {
      id: "1",
      nama: "Kebun Tomat A",
      lokasi: "Blok A1",
      ukuran: "100m2",
      jumlahHewan: null,
      deskripsi: "Kebun tomat organik",
      gambar: "kebun-tomat.jpg",
      JenisBudidayaId: "jenis1",
      isDeleted: false,
      createdAt: mockDate,
      updatedAt: mockDate,
      JenisBudidaya: {
        id: "jenis1",
        nama: "Sayuran",
        tipe: "tumbuhan",
      },
    },
    {
      id: "2",
      nama: "Kandang Ayam B",
      lokasi: "Blok B1",
      ukuran: "50m2",
      jumlahHewan: 100,
      deskripsi: "Kandang ayam petelur",
      gambar: "kandang-ayam.jpg",
      JenisBudidayaId: "jenis2",
      isDeleted: false,
      createdAt: mockDate,
      updatedAt: mockDate,
      JenisBudidaya: {
        id: "jenis2",
        nama: "Ayam",
        tipe: "hewan",
      },
    },
  ];

  const mockObjekBudidayaData = [
    {
      id: "1",
      namaId: "A001",
      nama: "Tanaman Tomat 1",
      UnitBudidayaId: "1",
      isDeleted: false,
      UnitBudidaya: {
        id: "1",
        JenisBudidaya: {
          nama: "Sayuran",
          gambar: "sayuran.jpg",
        },
      },
    },
  ];

  describe("GET /unit-budidaya", () => {
    it("should return 200 and all unit budidaya when data exists", async () => {
      originalSequelize.UnitBudidaya.findAll.mockResolvedValue(
        mockUnitBudidayaData
      );

      const response = await request(app).get("/unit-budidaya");

      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe(
        "Successfully retrieved all unit budidaya data"
      );
      expect(response.body.data).toEqual(mockUnitBudidayaData);
      expect(originalSequelize.UnitBudidaya.findAll).toHaveBeenCalledWith({
        where: {
          isDeleted: false,
        },
        order: [["createdAt", "DESC"]],
      });
    });

    it("should return 404 when no unit budidaya found", async () => {
      originalSequelize.UnitBudidaya.findAll.mockResolvedValue([]);

      const response = await request(app).get("/unit-budidaya");

      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe("Data not found");
    });

    it("should return 500 on database error", async () => {
      originalSequelize.UnitBudidaya.findAll.mockRejectedValue(
        new Error("Database error")
      );

      const response = await request(app).get("/unit-budidaya");

      expect(response.statusCode).toBe(500);
      expect(response.body.message).toBe("Database error");
    });
  });

  describe("GET /unit-budidaya/:id", () => {
    it("should return unit budidaya with objek budidaya when found", async () => {
      const mockUnit = mockUnitBudidayaData[0];
      originalSequelize.UnitBudidaya.findOne.mockResolvedValue(mockUnit);
      originalSequelize.ObjekBudidaya.findAll.mockResolvedValue(
        mockObjekBudidayaData
      );

      const response = await request(app).get("/unit-budidaya/1");

      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe(
        "Successfully retrieved unit budidaya data"
      );
      expect(response.body.data.unitBudidaya).toEqual(mockUnit);
      expect(response.body.data.objekBudidaya).toEqual(mockObjekBudidayaData);
    });

    it("should return 404 when unit budidaya not found", async () => {
      originalSequelize.UnitBudidaya.findOne.mockResolvedValue(null);

      const response = await request(app).get("/unit-budidaya/999");

      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe("Data not found");
    });

    it("should return 404 when unit budidaya is deleted", async () => {
      const deletedUnit = { ...mockUnitBudidayaData[0], isDeleted: true };
      originalSequelize.UnitBudidaya.findOne.mockResolvedValue(deletedUnit);

      const response = await request(app).get("/unit-budidaya/1");

      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe("Data not found");
    });

    it("should handle database errors", async () => {
      originalSequelize.UnitBudidaya.findOne.mockRejectedValue(
        new Error("Database error")
      );

      const response = await request(app).get("/unit-budidaya/1");

      expect(response.statusCode).toBe(500);
      expect(response.body.message).toBe("Database error");
    });
  });

  describe("GET /unit-budidaya/search/:nama", () => {
    it("should return unit budidaya matching search term", async () => {
      const searchResults = [mockUnitBudidayaData[0]];
      originalSequelize.UnitBudidaya.findAll.mockResolvedValue(searchResults);

      const response = await request(app).get("/unit-budidaya/search/tomat");

      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe(
        "Successfully retrieved unit budidaya data"
      );
      expect(response.body.data).toEqual(searchResults);
      expect(originalSequelize.UnitBudidaya.findAll).toHaveBeenCalledWith({
        include: [
          {
            model: originalSequelize.JenisBudidaya,
            required: true,
          },
        ],
        where: {
          nama: { like: "%tomat%" },
          isDeleted: false,
        },
        order: [["createdAt", "DESC"]],
      });
    });

    it("should return 404 when no matches found", async () => {
      originalSequelize.UnitBudidaya.findAll.mockResolvedValue([]);

      const response = await request(app).get(
        "/unit-budidaya/search/nonexistent"
      );

      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe("Data not found");
    });

    it("should handle database errors in search", async () => {
      originalSequelize.UnitBudidaya.findAll.mockRejectedValue(
        new Error("Search error")
      );

      const response = await request(app).get("/unit-budidaya/search/tomat");

      expect(response.statusCode).toBe(500);
      expect(response.body.message).toBe("Search error");
    });
  });

  describe("GET /unit-budidaya/jenis/:jenisId", () => {
    it("should return unit budidaya by jenis with pagination", async () => {
      const paginatedResults = {
        count: 5,
        rows: [mockUnitBudidayaData[0]],
      };

      originalSequelize.UnitBudidaya.findAndCountAll.mockResolvedValue(
        paginatedResults
      );

      const response = await request(app).get(
        "/unit-budidaya/jenis/jenis1?page=1&limit=10"
      );

      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe(
        "Successfully retrieved unit budidaya data"
      );
      expect(response.body.data.data).toEqual(paginatedResults.rows);
      expect(response.body.data.totalItems).toBe(5);
    });

    it("should return 404 when no unit budidaya found for jenis", async () => {
      originalSequelize.UnitBudidaya.findAndCountAll.mockResolvedValue({
        count: 0,
        rows: [],
      });

      const response = await request(app).get(
        "/unit-budidaya/jenis/nonexistent"
      );

      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe("Data not found");
    });
  });

  describe("POST /unit-budidaya", () => {
    it("should create unit budidaya successfully", async () => {
      const newUnitBudidaya = {
        id: "3",
        nama: "Kebun Cabai C",
        lokasi: "Blok C1",
        ukuran: "75m2",
        JenisBudidayaId: "jenis1",
        isDeleted: false,
        createdAt: mockDate,
        updatedAt: mockDate,
      };

      originalSequelize.UnitBudidaya.create.mockResolvedValue(newUnitBudidaya);

      const response = await request(app).post("/unit-budidaya").send({
        nama: "Kebun Cabai C",
        lokasi: "Blok C1",
        ukuran: "75m2",
        JenisBudidayaId: "jenis1",
      });

      expect(response.statusCode).toBe(201);
      expect(response.body.message).toBe(
        "Successfully created new unit budidaya data"
      );
      expect(response.body.data).toEqual(newUnitBudidaya);
    });

    it("should handle validation errors during creation", async () => {
      originalSequelize.UnitBudidaya.create.mockRejectedValue(
        new Error("Validation error: nama is required")
      );

      const response = await request(app).post("/unit-budidaya").send({
        lokasi: "Blok C1",
        // missing required fields
      });

      expect(response.statusCode).toBe(500);
      expect(response.body.message).toBe("Validation error: nama is required");
    });

    it("should handle database errors during creation", async () => {
      originalSequelize.UnitBudidaya.create.mockRejectedValue(
        new Error("Database connection failed")
      );

      const response = await request(app).post("/unit-budidaya").send({
        nama: "Kebun Cabai C",
        lokasi: "Blok C1",
        JenisBudidayaId: "jenis1",
      });

      expect(response.statusCode).toBe(500);
      expect(response.body.message).toBe("Database connection failed");
    });
  });

  describe("PUT /unit-budidaya/:id", () => {
    it("should update unit budidaya successfully", async () => {
      originalSequelize.UnitBudidaya.update.mockResolvedValue([1]);

      const response = await request(app).put("/unit-budidaya/1").send({
        nama: "Updated Kebun Tomat A",
        lokasi: "Updated Blok A1",
      });

      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe(
        "Successfully updated unit budidaya data"
      );
      expect(originalSequelize.UnitBudidaya.update).toHaveBeenCalledWith(
        { nama: "Updated Kebun Tomat A", lokasi: "Updated Blok A1" },
        { where: { id: "1" } }
      );
    });

    it("should return 404 when unit budidaya not found for update", async () => {
      originalSequelize.UnitBudidaya.update.mockResolvedValue([0]);

      const response = await request(app).put("/unit-budidaya/999").send({
        nama: "Updated Name",
      });

      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe("Data not found");
    });

    it("should handle database errors during update", async () => {
      originalSequelize.UnitBudidaya.update.mockRejectedValue(
        new Error("Database error")
      );

      const response = await request(app).put("/unit-budidaya/1").send({
        nama: "Updated Name",
      });

      expect(response.statusCode).toBe(500);
      expect(response.body.message).toBe("Database error");
    });
  });

  describe("DELETE /unit-budidaya/:id", () => {
    it("should delete unit budidaya successfully (soft delete)", async () => {
      originalSequelize.UnitBudidaya.update.mockResolvedValue([1]);

      const response = await request(app).delete("/unit-budidaya/1");

      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe(
        "Successfully deleted unit budidaya data"
      );
      expect(originalSequelize.UnitBudidaya.update).toHaveBeenCalledWith(
        { isDeleted: true },
        { where: { id: "1" } }
      );
    });

    it("should return 404 when unit budidaya not found for deletion", async () => {
      originalSequelize.UnitBudidaya.update.mockResolvedValue([0]);

      const response = await request(app).delete("/unit-budidaya/999");

      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe("Data not found");
    });

    it("should handle database errors during deletion", async () => {
      originalSequelize.UnitBudidaya.update.mockRejectedValue(
        new Error("Database error")
      );

      const response = await request(app).delete("/unit-budidaya/1");

      expect(response.statusCode).toBe(500);
      expect(response.body.message).toBe("Database error");
    });
  });

  describe("Complex scenarios with transactions", () => {
    it("should handle transaction commits properly", async () => {
      const newUnit = { id: "4", nama: "New Unit" };
      originalSequelize.UnitBudidaya.create.mockResolvedValue(newUnit);

      const response = await request(app).post("/unit-budidaya").send({
        nama: "New Unit",
        lokasi: "Test Location",
        JenisBudidayaId: "jenis1",
      });

      expect(response.statusCode).toBe(201);
    });

    it("should handle transaction rollbacks on errors", async () => {
      originalSequelize.UnitBudidaya.create.mockRejectedValue(
        new Error("Transaction failed")
      );

      const response = await request(app).post("/unit-budidaya").send({
        nama: "New Unit",
        lokasi: "Test Location",
      });

      expect(response.statusCode).toBe(500);
    });
  });

  describe("Edge cases and boundary testing", () => {
    it("should handle empty search terms", async () => {
      originalSequelize.UnitBudidaya.findAll.mockResolvedValue([]);

      const response = await request(app).get("/unit-budidaya/search/");

      expect(response.statusCode).toBe(404);
    });

    it("should handle special characters in search", async () => {
      originalSequelize.UnitBudidaya.findAll.mockResolvedValue([]);

      const response = await request(app).get("/unit-budidaya/search/@#$%");

      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe("Data not found");
    });

    it("should handle very long search terms", async () => {
      const longSearchTerm = "a".repeat(1000);
      originalSequelize.UnitBudidaya.findAll.mockResolvedValue([]);

      const response = await request(app).get(
        `/unit-budidaya/search/${longSearchTerm}`
      );

      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe("Data not found");
    });

    it("should handle null or undefined values in request body", async () => {
      originalSequelize.UnitBudidaya.create.mockRejectedValue(
        new Error("Null value in non-null column")
      );

      const response = await request(app).post("/unit-budidaya").send({
        nama: null,
        lokasi: undefined,
        JenisBudidayaId: "jenis1",
      });

      expect(response.statusCode).toBe(500);
      expect(response.body.message).toBe("Null value in non-null column");
    });
  });

  describe("Include relationships testing", () => {
    it("should properly include JenisBudidaya in search results", async () => {
      const resultsWithJenis = [
        {
          ...mockUnitBudidayaData[0],
          JenisBudidaya: {
            id: "jenis1",
            nama: "Sayuran",
            tipe: "tumbuhan",
          },
        },
      ];

      originalSequelize.UnitBudidaya.findAll.mockResolvedValue(
        resultsWithJenis
      );

      const response = await request(app).get("/unit-budidaya/search/tomat");

      expect(response.statusCode).toBe(200);
      expect(response.body.data[0].JenisBudidaya).toBeDefined();
      expect(response.body.data[0].JenisBudidaya.nama).toBe("Sayuran");
    });

    it("should handle missing relationships gracefully", async () => {
      const resultWithoutJenis = [
        {
          ...mockUnitBudidayaData[0],
          JenisBudidaya: null,
        },
      ];

      originalSequelize.UnitBudidaya.findAll.mockResolvedValue(
        resultWithoutJenis
      );

      const response = await request(app).get("/unit-budidaya/search/tomat");

      expect(response.statusCode).toBe(200);
      expect(response.body.data[0].JenisBudidaya).toBeNull();
    });
  });

  describe("Pagination testing", () => {
    it("should handle pagination parameters correctly", async () => {
      getPaginationOptions.mockReturnValue({
        limit: 5,
        offset: 10,
      });

      const paginatedResults = {
        count: 25,
        rows: [mockUnitBudidayaData[0]],
      };

      originalSequelize.UnitBudidaya.findAndCountAll.mockResolvedValue(
        paginatedResults
      );

      const response = await request(app).get(
        "/unit-budidaya/jenis/jenis1?page=3&limit=5"
      );

      expect(response.statusCode).toBe(200);
      expect(response.body.data.totalItems).toBe(25);
      expect(response.body.data.totalPages).toBe(5);
      expect(response.body.data.currentPage).toBe(3);
    });

    it("should handle invalid pagination parameters", async () => {
      getPaginationOptions.mockReturnValue({
        limit: 10,
        offset: 0,
      });

      const response = await request(app).get(
        "/unit-budidaya/jenis/jenis1?page=-1&limit=0"
      );

      expect(getPaginationOptions).toHaveBeenCalled();
    });
  });
});
