const request = require("supertest");
const express = require("express");

jest.mock("../../../model/index", () => {
  const mockObjekBudidaya = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
  };

  const mockUnitBudidaya = {
    findOne: jest.fn(),
  };

  const mockJenisBudidaya = {
    findOne: jest.fn(),
  };

  return {
    ObjekBudidaya: mockObjekBudidaya,
    UnitBudidaya: mockUnitBudidaya,
    JenisBudidaya: mockJenisBudidaya,
    sequelize: {
      transaction: jest.fn(() => ({ commit: jest.fn(), rollback: jest.fn() })),
      fn: jest.fn(),
      col: jest.fn(),
    },
    __esModule: true,
    default: {
      ObjekBudidaya: mockObjekBudidaya,
      UnitBudidaya: mockUnitBudidaya,
      JenisBudidaya: mockJenisBudidaya,
      sequelize: {
        transaction: jest.fn(() => ({
          commit: jest.fn(),
          rollback: jest.fn(),
        })),
        fn: jest.fn(),
        col: jest.fn(),
      },
    },
  };
});

const objekBudidayaController = require("../../../controller/farm/objekBudidaya");
const originalSequelize = require("../../../model/index");

const app = express();
app.use(express.json());
app.use((req, res, next) => {
  res.locals = {};
  next();
});

app.get("/objek-budidaya", objekBudidayaController.getAllObjekBudidaya);
app.get("/objek-budidaya/:id", objekBudidayaController.getObjekBudidayaById);
app.get(
  "/objek-budidaya/unit/:id",
  objekBudidayaController.getObjekBudidayaByUnitBudidaya
);
app.post("/objek-budidaya", objekBudidayaController.createObjekBudidaya);
app.put("/objek-budidaya/:id", objekBudidayaController.updateObjekBudidaya);
app.delete("/objek-budidaya/:id", objekBudidayaController.deleteObjekBudidaya);

describe("ObjekBudidaya Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock functions for sequelize functions
    originalSequelize.sequelize.fn.mockReturnValue("fn_mock");
    originalSequelize.sequelize.col.mockReturnValue("col_mock");
  });

  const mockDate = new Date();
  const mockObjekBudidayaData = [
    {
      id: "1",
      namaId: "A001",
      nama: "Tanaman Tomat 1",
      UnitBudidayaId: "unit1",
      status: "active",
      isDeleted: false,
      createdAt: mockDate,
      updatedAt: mockDate,
    },
    {
      id: "2",
      namaId: "A002",
      nama: "Tanaman Tomat 2",
      UnitBudidayaId: "unit1",
      status: "active",
      isDeleted: false,
      createdAt: mockDate,
      updatedAt: mockDate,
    },
  ];

  const mockObjekBudidayaWithIncludes = [
    {
      id: "1",
      namaId: "A001",
      nama: "Tanaman Tomat 1",
      UnitBudidayaId: "unit1",
      status: "active",
      isDeleted: false,
      UnitBudidaya: {
        id: "unit1",
        JenisBudidaya: {
          nama: "Sayuran",
          gambar: "sayuran.jpg",
        },
      },
      createdAt: mockDate,
      updatedAt: mockDate,
    },
  ];

  describe("GET /objek-budidaya", () => {
    it("should return 200 and all objek budidaya when data exists", async () => {
      originalSequelize.ObjekBudidaya.findAll.mockResolvedValue(
        mockObjekBudidayaData
      );

      const response = await request(app).get("/objek-budidaya");

      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe(
        "Successfully retrieved all unit budidaya data"
      );
      expect(response.body.data).toEqual(mockObjekBudidayaData);
      expect(originalSequelize.ObjekBudidaya.findAll).toHaveBeenCalledWith({
        where: {
          isDeleted: false,
        },
        order: [["createdAt", "DESC"]],
      });
    });

    it("should return 404 when no objek budidaya found", async () => {
      originalSequelize.ObjekBudidaya.findAll.mockResolvedValue([]);

      const response = await request(app).get("/objek-budidaya");

      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe("Data not found");
    });

    it("should return 500 on database error", async () => {
      originalSequelize.ObjekBudidaya.findAll.mockRejectedValue(
        new Error("Database error")
      );

      const response = await request(app).get("/objek-budidaya");

      expect(response.statusCode).toBe(500);
      expect(response.body.message).toBe("Database error");
    });
  });

  describe("GET /objek-budidaya/:id", () => {
    it("should return objek budidaya by id when found", async () => {
      const mockObjek = mockObjekBudidayaData[0];
      originalSequelize.ObjekBudidaya.findOne.mockResolvedValue(mockObjek);

      const response = await request(app).get("/objek-budidaya/1");

      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe(
        "Successfully retrieved objek budidaya data"
      );
      expect(response.body.data).toEqual(mockObjek);
      expect(originalSequelize.ObjekBudidaya.findOne).toHaveBeenCalledWith({
        where: { id: "1", isDeleted: false },
        order: [["createdAt", "DESC"]],
      });
    });

    it("should return 404 when objek budidaya not found", async () => {
      originalSequelize.ObjekBudidaya.findOne.mockResolvedValue(null);

      const response = await request(app).get("/objek-budidaya/999");

      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe("Data not found");
    });

    it("should handle database errors", async () => {
      originalSequelize.ObjekBudidaya.findOne.mockRejectedValue(
        new Error("Database error")
      );

      const response = await request(app).get("/objek-budidaya/1");

      expect(response.statusCode).toBe(500);
      expect(response.body.message).toBe("Database error");
    });
  });

  describe("GET /objek-budidaya/unit/:id", () => {
    it("should return objek budidaya by unit budidaya with includes", async () => {
      originalSequelize.ObjekBudidaya.findAll.mockResolvedValue(
        mockObjekBudidayaWithIncludes
      );

      const response = await request(app).get("/objek-budidaya/unit/unit1");

      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe(
        "Successfully retrieved objek budidaya data"
      );
      expect(response.body.data).toEqual(mockObjekBudidayaWithIncludes);
      expect(originalSequelize.ObjekBudidaya.findAll).toHaveBeenCalledWith({
        include: [
          {
            model: originalSequelize.UnitBudidaya,
            attributes: ["id"],
            required: true,
            include: [
              {
                model: originalSequelize.JenisBudidaya,
                attributes: ["nama", "gambar"],
                required: true,
              },
            ],
          },
        ],
        where: {
          UnitBudidayaId: "unit1",
          isDeleted: false,
        },
        order: [
          ["fn_mock", "ASC"],
          ["namaId", "ASC"],
        ],
      });
    });

    it("should return 404 when no objek budidaya found for unit", async () => {
      originalSequelize.ObjekBudidaya.findAll.mockResolvedValue([]);

      const response = await request(app).get(
        "/objek-budidaya/unit/nonexistent"
      );

      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe("Data not found");
    });

    it("should handle database errors for unit query", async () => {
      originalSequelize.ObjekBudidaya.findAll.mockRejectedValue(
        new Error("Database error")
      );

      const response = await request(app).get("/objek-budidaya/unit/unit1");

      expect(response.statusCode).toBe(500);
      expect(response.body.message).toBe("Database error");
    });
  });

  describe("POST /objek-budidaya", () => {
    it("should create objek budidaya successfully", async () => {
      const newObjekBudidaya = {
        id: "3",
        namaId: "A003",
        nama: "Tanaman Cabai 1",
        UnitBudidayaId: "unit2",
        status: "active",
        isDeleted: false,
        createdAt: mockDate,
        updatedAt: mockDate,
      };

      originalSequelize.ObjekBudidaya.create.mockResolvedValue(
        newObjekBudidaya
      );

      const response = await request(app).post("/objek-budidaya").send({
        namaId: "A003",
        nama: "Tanaman Cabai 1",
        UnitBudidayaId: "unit2",
        status: "active",
      });

      expect(response.statusCode).toBe(201);
      expect(response.body.message).toBe(
        "Successfully created new objek budidaya data"
      );
      expect(response.body.data).toEqual(newObjekBudidaya);
    });

    it("should handle validation errors during creation", async () => {
      originalSequelize.ObjekBudidaya.create.mockRejectedValue(
        new Error("Validation error: nama is required")
      );

      const response = await request(app).post("/objek-budidaya").send({
        namaId: "A003",
        // missing required fields
      });

      expect(response.statusCode).toBe(500);
      expect(response.body.message).toBe("Validation error: nama is required");
    });

    it("should handle database errors during creation", async () => {
      originalSequelize.ObjekBudidaya.create.mockRejectedValue(
        new Error("Database connection failed")
      );

      const response = await request(app).post("/objek-budidaya").send({
        namaId: "A003",
        nama: "Tanaman Cabai 1",
        UnitBudidayaId: "unit2",
      });

      expect(response.statusCode).toBe(500);
      expect(response.body.message).toBe("Database connection failed");
    });
  });

  describe("PUT /objek-budidaya/:id", () => {
    it("should update objek budidaya successfully", async () => {
      originalSequelize.ObjekBudidaya.update.mockResolvedValue([1]);

      const response = await request(app).put("/objek-budidaya/1").send({
        nama: "Updated Tanaman Tomat 1",
        status: "inactive",
      });

      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe(
        "Successfully updated objek budidaya data"
      );
      expect(originalSequelize.ObjekBudidaya.update).toHaveBeenCalledWith(
        { nama: "Updated Tanaman Tomat 1", status: "inactive" },
        { where: { id: "1" } }
      );
    });

    it("should return 404 when objek budidaya not found for update", async () => {
      originalSequelize.ObjekBudidaya.update.mockResolvedValue([0]);

      const response = await request(app).put("/objek-budidaya/999").send({
        nama: "Updated Name",
      });

      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe("Data not found");
    });

    it("should handle database errors during update", async () => {
      originalSequelize.ObjekBudidaya.update.mockRejectedValue(
        new Error("Database error")
      );

      const response = await request(app).put("/objek-budidaya/1").send({
        nama: "Updated Name",
      });

      expect(response.statusCode).toBe(500);
      expect(response.body.message).toBe("Database error");
    });
  });

  describe("DELETE /objek-budidaya/:id", () => {
    it("should delete objek budidaya successfully (soft delete)", async () => {
      originalSequelize.ObjekBudidaya.update.mockResolvedValue([1]);

      const response = await request(app).delete("/objek-budidaya/1");

      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe(
        "Successfully deleted objek budidaya data"
      );
      expect(originalSequelize.ObjekBudidaya.update).toHaveBeenCalledWith(
        { isDeleted: true },
        { where: { id: "1" } }
      );
    });

    it("should return 404 when objek budidaya not found for deletion", async () => {
      originalSequelize.ObjekBudidaya.update.mockResolvedValue([0]);

      const response = await request(app).delete("/objek-budidaya/999");

      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe("Data not found");
    });

    it("should handle database errors during deletion", async () => {
      originalSequelize.ObjekBudidaya.update.mockRejectedValue(
        new Error("Database error")
      );

      const response = await request(app).delete("/objek-budidaya/1");

      expect(response.statusCode).toBe(500);
      expect(response.body.message).toBe("Database error");
    });
  });

  describe("Edge cases and boundary testing", () => {
    it("should handle empty request body for POST", async () => {
      originalSequelize.ObjekBudidaya.create.mockRejectedValue(
        new Error("Missing required fields")
      );

      const response = await request(app).post("/objek-budidaya").send({});

      expect(response.statusCode).toBe(500);
      expect(response.body.message).toBe("Missing required fields");
    });

    it("should handle empty request body for PUT", async () => {
      originalSequelize.ObjekBudidaya.update.mockResolvedValue([1]);

      const response = await request(app).put("/objek-budidaya/1").send({});

      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe(
        "Successfully updated objek budidaya data"
      );
    });

    it("should handle invalid ID parameters", async () => {
      originalSequelize.ObjekBudidaya.findOne.mockResolvedValue(null);

      const response = await request(app).get("/objek-budidaya/invalid-id");

      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe("Data not found");
    });

    it("should handle very long namaId values", async () => {
      const longNamaId = "A".repeat(1000);

      originalSequelize.ObjekBudidaya.create.mockRejectedValue(
        new Error("Value too long for column namaId")
      );

      const response = await request(app).post("/objek-budidaya").send({
        namaId: longNamaId,
        nama: "Test Name",
        UnitBudidayaId: "unit1",
      });

      expect(response.statusCode).toBe(500);
      expect(response.body.message).toBe("Value too long for column namaId");
    });

    it("should handle null UnitBudidayaId in unit query", async () => {
      originalSequelize.ObjekBudidaya.findAll.mockResolvedValue([]);

      const response = await request(app).get("/objek-budidaya/unit/null");

      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe("Data not found");
    });
  });

  describe("Complex query scenarios", () => {
    it("should properly handle ordering with sequelize functions", async () => {
      const mockDataWithVariousIds = [
        { id: "1", namaId: "A1", nama: "Short ID" },
        { id: "2", namaId: "AAAA1", nama: "Long ID" },
        { id: "3", namaId: "B1", nama: "Another Short ID" },
      ];

      originalSequelize.ObjekBudidaya.findAll.mockResolvedValue(
        mockDataWithVariousIds
      );

      const response = await request(app).get("/objek-budidaya/unit/unit1");

      expect(response.statusCode).toBe(200);
      expect(originalSequelize.sequelize.fn).toHaveBeenCalledWith(
        "length",
        "col_mock"
      );
      expect(originalSequelize.sequelize.col).toHaveBeenCalledWith("namaId");
    });

    it("should handle complex include relationships", async () => {
      const complexIncludeData = [
        {
          id: "1",
          namaId: "A001",
          UnitBudidaya: {
            id: "unit1",
            JenisBudidaya: {
              nama: "Sayuran",
              gambar: "sayuran.jpg",
            },
          },
        },
      ];

      originalSequelize.ObjekBudidaya.findAll.mockResolvedValue(
        complexIncludeData
      );

      const response = await request(app).get("/objek-budidaya/unit/unit1");

      expect(response.statusCode).toBe(200);
      expect(response.body.data[0].UnitBudidaya.JenisBudidaya.nama).toBe(
        "Sayuran"
      );
    });
  });

  describe("Data consistency checks", () => {
    it("should maintain isDeleted false on creation", async () => {
      const newObjek = {
        id: "4",
        namaId: "A004",
        nama: "New Objek",
        isDeleted: false,
      };

      originalSequelize.ObjekBudidaya.create.mockResolvedValue(newObjek);

      const response = await request(app).post("/objek-budidaya").send({
        namaId: "A004",
        nama: "New Objek",
      });

      expect(response.statusCode).toBe(201);
      expect(response.body.data.isDeleted).toBe(false);
    });

    it("should filter out deleted records in findAll", async () => {
      originalSequelize.ObjekBudidaya.findAll.mockResolvedValue(
        mockObjekBudidayaData
      );

      await request(app).get("/objek-budidaya");

      expect(originalSequelize.ObjekBudidaya.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isDeleted: false,
          }),
        })
      );
    });
  });
});
