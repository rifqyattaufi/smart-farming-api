const request = require('supertest');
const express = require('express');
const { Op } = require('sequelize');

jest.mock('../../../model/index', () => {
  const ActualOpFromSequelizeLib = require('sequelize').Op;
  const mockJenisBudidaya = {
    findAndCountAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    save: jest.fn(),
  };
  const mockUnitBudidaya = {
    findAll: jest.fn(),
    update: jest.fn(),
  };
  const mockObjekBudidaya = {
    update: jest.fn(),
  };
  const mockTransaction = {
    commit: jest.fn(),
    rollback: jest.fn(),
  };
  const mockSequelizeInstance = {
    query: jest.fn(),
    transaction: jest.fn(() => mockTransaction),
  };

  return {
    JenisBudidaya: mockJenisBudidaya,
    UnitBudidaya: mockUnitBudidaya,
    ObjekBudidaya: mockObjekBudidaya,
    sequelize: mockSequelizeInstance,
    Sequelize: {
      Op: ActualOpFromSequelizeLib,
    },
    __esModule: true,
    default: {
      JenisBudidaya: mockJenisBudidaya,
      UnitBudidaya: mockUnitBudidaya,
      ObjekBudidaya: mockObjekBudidaya,
      sequelize: mockSequelizeInstance,
      Sequelize: {
        Op: ActualOpFromSequelizeLib,
      },
    }
  };
});

jest.mock('../../../utils/paginationUtils', () => ({
  getPaginationOptions: jest.fn(),
}));

jest.mock('../../../validation/dataValidation', () => ({
  dataValid: jest.fn(),
}));

const jenisBudidayaController = require('../../../controller/farm/jenisBudidaya');
const originalSequelize = require('../../../model/index');
const { getPaginationOptions } = require('../../../utils/paginationUtils');

const app = express();
app.use(express.json());
app.use((req, res, next) => {
  res.locals = {};
  next();
});

app.get('/jenis-budidaya', jenisBudidayaController.getAllJenisBudidaya);
app.get('/jenis-budidaya/search/:nama/:tipe', jenisBudidayaController.getJenisBudidayaSearch);
app.get('/jenis-budidaya/tipe/:tipe', jenisBudidayaController.getJenisBudidayaByTipe);
app.get('/jenis-budidaya/:id', jenisBudidayaController.getJenisBudidayaById);
app.post('/jenis-budidaya', jenisBudidayaController.createJenisBudidaya);
app.put('/jenis-budidaya/:id', jenisBudidayaController.updateJenisBudidaya);
app.delete('/jenis-budidaya/:id', jenisBudidayaController.deleteJenisBudidaya);

describe('Jenis Budidaya Controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const mockDate = new Date();
  const mockDateString = mockDate.toISOString();

  const createPlainVersion = (instanceData) => {
    if (!instanceData) return null;
    const plain = { ...instanceData };
    delete plain.toJSON;

    if (plain.createdAt && plain.createdAt instanceof Date) {
      plain.createdAt = plain.createdAt.toISOString();
    } else if (typeof plain.createdAt === 'string' && !plain.createdAt.endsWith('Z')) {
      // If it's a string but not ISO, try to parse and re-format, or ensure it's correctly formatted initially
      // For simplicity, we assume initial mockDateString is used or Date objects are used
    }

    if (plain.updatedAt && plain.updatedAt instanceof Date) {
      plain.updatedAt = plain.updatedAt.toISOString();
    }
    return plain;
  };


  describe('GET /jenis-budidaya', () => {
    it('should return 200 and paginated data when found', async () => {
      const rawMockDataRow = {
        id: 1, nama: 'Padi', tipe: 'Tanaman Pangan',
        createdAt: new Date(mockDateString),
        updatedAt: new Date(mockDateString),
        isDeleted: false,
        toJSON: function() { return createPlainVersion(this); }
      };
      const mockDataRows = [rawMockDataRow];
      const mockCount = 1;

      originalSequelize.JenisBudidaya.findAndCountAll.mockResolvedValue({
        count: mockCount,
        rows: mockDataRows
      });
      getPaginationOptions.mockReturnValue({ limit: 10, offset: 0 });

      const res = await request(app).get('/jenis-budidaya?page=1&limit=10');

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Successfully retrieved all jenis budidaya data');
      
      expect(res.body.data).toEqual(mockDataRows.map(r => r.toJSON()));
      expect(res.body.totalItems).toBe(mockCount);
      expect(res.body.totalPages).toBe(1);
      expect(res.body.currentPage).toBe(1);
      expect(originalSequelize.JenisBudidaya.findAndCountAll).toHaveBeenCalledWith(expect.objectContaining({
          where: { isDeleted: false }
      }));
    });

    it('should return 200 and "Data not found" on page 1 if no data', async () => {
      originalSequelize.JenisBudidaya.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });
      getPaginationOptions.mockReturnValue({ limit: 10, offset: 0 });
      const res = await request(app).get('/jenis-budidaya?page=1&limit=10');
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Data not found');
    });

    it('should return 200 and "No more data" on subsequent pages if no data', async () => {
      originalSequelize.JenisBudidaya.findAndCountAll.mockResolvedValue({ count: 5, rows: [] });
      getPaginationOptions.mockReturnValue({ limit: 5, offset: 5 });
      const res = await request(app).get('/jenis-budidaya?page=2&limit=5');
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('No more data');
    });

    it('should return 500 when findAndCountAll throws an error', async () => {
        const errorMessage = 'DB error findAndCountAll';
        originalSequelize.JenisBudidaya.findAndCountAll.mockRejectedValue(new Error(errorMessage));
        getPaginationOptions.mockReturnValue({ limit: 10, offset: 0 });
        const res = await request(app).get('/jenis-budidaya');
        expect(res.statusCode).toBe(500);
        expect(res.body.message).toBe(errorMessage);
    });
  });

  describe('GET /jenis-budidaya/:id', () => {
    it('should return 200 and data with unit budidaya when found by id', async () => {
      const rawMockJenisBudidaya = {
        id: 1, nama: 'Lele', tipe: 'Ikan', isDeleted: false,
        createdAt: new Date(mockDateString),
        updatedAt: new Date(mockDateString),
        toJSON: function() { return createPlainVersion(this); }
      };
      const rawMockUnitBudidaya = {
        id: 10, jenisBudidayaId: 1, nama: 'Kolam A1', jumlah: 100, isDeleted: false,
        createdAt: new Date(mockDateString),
        updatedAt: new Date(mockDateString),
        toJSON: function() { return createPlainVersion(this); }
      };
      const mockUnitBudidayaData = [rawMockUnitBudidaya];

      originalSequelize.JenisBudidaya.findOne.mockResolvedValue(rawMockJenisBudidaya);
      originalSequelize.UnitBudidaya.findAll.mockResolvedValue(mockUnitBudidayaData);

      const res = await request(app).get('/jenis-budidaya/1');

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Successfully retrieved jenis budidaya data');
      
      expect(res.body.data.jenisBudidaya).toEqual(rawMockJenisBudidaya.toJSON());
      expect(res.body.data.unitBudidaya).toEqual(mockUnitBudidayaData.map(u => u.toJSON()));
      expect(res.body.data.jumlahBudidaya).toBe(100);
      expect(originalSequelize.JenisBudidaya.findOne).toHaveBeenCalledWith({ where: { id: '1', isDeleted: false } });
      expect(originalSequelize.UnitBudidaya.findAll).toHaveBeenCalledWith({
        where: { jenisBudidayaId: '1', isDeleted: false },
        order: [['createdAt', 'DESC']],
      });
    });

    it('should return 404 when JenisBudidaya data not found by id', async () => {
      originalSequelize.JenisBudidaya.findOne.mockResolvedValue(null);
      const res = await request(app).get('/jenis-budidaya/99');
      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('Data not found');
    });

    it('should return 500 when JenisBudidaya.findOne throws an error', async () => {
        const errorMessage = 'DB error findOne JenisBudidaya';
        originalSequelize.JenisBudidaya.findOne.mockRejectedValue(new Error(errorMessage));
        const res = await request(app).get('/jenis-budidaya/1');
        expect(res.statusCode).toBe(500);
        expect(res.body.message).toBe(errorMessage);
    });

    it('should return 500 when UnitBudidaya.findAll throws an error', async () => {
        const rawMockJenisBudidaya = { id: 1, nama: 'Lele', tipe: 'Ikan', isDeleted: false, toJSON: function() { return createPlainVersion(this); } };
        originalSequelize.JenisBudidaya.findOne.mockResolvedValue(rawMockJenisBudidaya);
        const errorMessage = 'DB error findAll UnitBudidaya';
        originalSequelize.UnitBudidaya.findAll.mockRejectedValue(new Error(errorMessage));

        const res = await request(app).get('/jenis-budidaya/1');
        expect(res.statusCode).toBe(500);
        expect(res.body.message).toBe(errorMessage);
    });
  });

  describe('GET /jenis-budidaya/search/:nama/:tipe', () => {
    it('should search by nama and tipe', async () => {
        const rawMockDataRow = {
            id: 1, nama: 'Padi Organik', tipe: 'Tanaman Pangan',
            isDeleted: false,
            createdAt: new Date(mockDateString),
            updatedAt: new Date(mockDateString),
            toJSON: function() { return createPlainVersion(this); }
        };
        const mockDataRows = [rawMockDataRow];
        originalSequelize.JenisBudidaya.findAndCountAll.mockResolvedValue({ count: 1, rows: mockDataRows });
        getPaginationOptions.mockReturnValue({ limit: 10, offset: 0 });

        const res = await request(app).get('/jenis-budidaya/search/Padi/Tanaman%20Pangan?page=1');
        expect(res.statusCode).toBe(200)
        expect(res.body.data).toEqual(mockDataRows.map(r => r.toJSON()));
        expect(originalSequelize.JenisBudidaya.findAndCountAll).toHaveBeenCalledWith(expect.objectContaining({
            where: {
                isDeleted: false,
                nama: { [Op.like]: '%Padi%' },
                tipe: 'Tanaman Pangan'
            }
        }));
    });

    it('should search by nama only if tipe is "all"', async () => {
        originalSequelize.JenisBudidaya.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });
        getPaginationOptions.mockReturnValue({ limit: 10, offset: 0 });
        await request(app).get('/jenis-budidaya/search/Padi/all?page=1');
        expect(originalSequelize.JenisBudidaya.findAndCountAll).toHaveBeenCalledWith(expect.objectContaining({
            where: { isDeleted: false, nama: { [Op.like]: '%Padi%' } }
        }));
    });

     it('should search by tipe only if nama is "all"', async () => {
        originalSequelize.JenisBudidaya.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });
        getPaginationOptions.mockReturnValue({ limit: 10, offset: 0 });
        await request(app).get('/jenis-budidaya/search/all/Ikan?page=1');
        expect(originalSequelize.JenisBudidaya.findAndCountAll).toHaveBeenCalledWith(expect.objectContaining({
            where: { isDeleted: false, tipe: 'Ikan' }
        }));
    });

     it('should search all if nama and tipe are "all"', async () => {
        originalSequelize.JenisBudidaya.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });
        getPaginationOptions.mockReturnValue({ limit: 10, offset: 0 });
        await request(app).get('/jenis-budidaya/search/all/all?page=1');
        expect(originalSequelize.JenisBudidaya.findAndCountAll).toHaveBeenCalledWith(expect.objectContaining({
            where: { isDeleted: false }
        }));
    });

    it('should return 200 and "Data not found for the given search criteria" on page 1 if no data', async () => {
        originalSequelize.JenisBudidaya.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });
        getPaginationOptions.mockReturnValue({ limit: 10, offset: 0 });
        const res = await request(app).get('/jenis-budidaya/search/NonExistent/NonExistentTipe?page=1');
        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('Data not found for the given search criteria');
    });
  });

  describe('GET /jenis-budidaya/tipe/:tipe', () => {
    it('should return 200 and paginated data when found by tipe', async () => {
      const rawMockDataRow = {
          id: 1, nama: 'Lele Dumbo', tipe: 'Ikan',
          createdAt: new Date(mockDateString),
          updatedAt: new Date(mockDateString),
          isDeleted: false,
          toJSON: function() { return createPlainVersion(this); }
      };
      const mockDataRows = [rawMockDataRow];
      const mockCount = 1;
      originalSequelize.JenisBudidaya.findAndCountAll.mockResolvedValue({
        count: mockCount,
        rows: mockDataRows
      });
      getPaginationOptions.mockReturnValue({ limit: 10, offset: 0 });

      const res = await request(app).get('/jenis-budidaya/tipe/Ikan?page=1&limit=10');

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Successfully retrieved jenis budidaya data by type');
      expect(res.body.data).toEqual(mockDataRows.map(r => r.toJSON()));
      expect(originalSequelize.JenisBudidaya.findAndCountAll).toHaveBeenCalledWith(expect.objectContaining({
          where: { tipe: 'Ikan', isDeleted: false }
      }));
    });

    it('should return 200 and "Data not found for this type" on page 1 if no data', async () => {
        originalSequelize.JenisBudidaya.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });
        getPaginationOptions.mockReturnValue({ limit: 10, offset: 0 });
        const res = await request(app).get('/jenis-budidaya/tipe/NonExistent?page=1');
        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('Data not found for this type');
    });
  });

  describe('POST /jenis-budidaya', () => {
    it('should return 201 when created successfully', async () => {
      const newPayload = { nama: 'Cabai', tipe: 'Hortikultura' };
      const mockCreatedInstance = {
        id: 2,
        nama: newPayload.nama,
        tipe: newPayload.tipe,
        isDeleted: false,
        createdAt: new Date(mockDateString),
        updatedAt: new Date(mockDateString),
        toJSON: function() {
          return {
            id: this.id,
            nama: this.nama,
            tipe: this.tipe,
            isDeleted: this.isDeleted,
            createdAt: this.createdAt.toISOString(),
            updatedAt: this.updatedAt.toISOString(),
          };
        }
      };
      originalSequelize.JenisBudidaya.create.mockResolvedValue(mockCreatedInstance);

      const res = await request(app).post('/jenis-budidaya').send(newPayload);

      expect(res.statusCode).toBe(201);
      expect(res.body.message).toBe('Successfully created new jenis budidaya data');
      expect(res.body.data).toEqual(mockCreatedInstance.toJSON());
      expect(originalSequelize.JenisBudidaya.create).toHaveBeenCalledWith(newPayload);
    });

    it('should return 500 when create throws an error', async () => {
      const errorMessage = 'DB error create';
      originalSequelize.JenisBudidaya.create.mockRejectedValue(new Error(errorMessage));
      const res = await request(app).post('/jenis-budidaya').send({ nama: 'Gagal' });
      expect(res.statusCode).toBe(500);
      expect(res.body.message).toBe(errorMessage);
    });
  });

  describe('PUT /jenis-budidaya/:id', () => {
    const mockId = '1';
    const updatePayload = { nama: 'Padi Super', tipe: 'Tanaman Unggul' };
    const initialDate = new Date(Date.now() - 100000);
    const updatedDate = new Date();

    const mockExistingRawInstance = {
      id: parseInt(mockId), nama: 'Padi Lama', tipe: 'Tanaman Pangan', isDeleted: false,
      createdAt: initialDate,
      updatedAt: initialDate,
      toJSON: function() { return createPlainVersion(this); }
    };

    it('should update and return 200 if data exists', async () => {
      originalSequelize.JenisBudidaya.findOne.mockResolvedValueOnce(mockExistingRawInstance);
      originalSequelize.JenisBudidaya.update.mockResolvedValue([1]);

      const mockReturnedUpdatedInstance = {
        id: parseInt(mockId),
        nama: updatePayload.nama,
        tipe: updatePayload.tipe,
        isDeleted: false,
        createdAt: initialDate,
        updatedAt: updatedDate,
        toJSON: function() {
          return {
            id: this.id,
            nama: this.nama,
            tipe: this.tipe,
            isDeleted: this.isDeleted,
            createdAt: this.createdAt.toISOString(),
            updatedAt: this.updatedAt.toISOString(),
          };
        }
      };
      originalSequelize.JenisBudidaya.findOne.mockResolvedValueOnce(mockReturnedUpdatedInstance);

      const res = await request(app).put(`/jenis-budidaya/${mockId}`).send(updatePayload);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Successfully updated jenis budidaya data');
      expect(originalSequelize.JenisBudidaya.findOne).toHaveBeenCalledWith({ where: { id: mockId, isDeleted: false } });
      expect(originalSequelize.JenisBudidaya.update).toHaveBeenCalledWith(updatePayload, { where: { id: mockId } });
      expect(originalSequelize.JenisBudidaya.findOne).toHaveBeenCalledWith({ where: { id: mockId } });
      
      expect(res.body.data).toEqual(mockReturnedUpdatedInstance.toJSON());
    });

    it('should return 404 if data to update not found', async () => {
      originalSequelize.JenisBudidaya.findOne.mockResolvedValue(null);
      const res = await request(app).put(`/jenis-budidaya/99`).send(updatePayload);
      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('Data not found');
    });

    it('should return 500 when JenisBudidaya.update throws an error', async () => {
        const errorMessage = 'DB error static update';
        originalSequelize.JenisBudidaya.findOne.mockResolvedValueOnce(mockExistingRawInstance);
        originalSequelize.JenisBudidaya.update.mockRejectedValue(new Error(errorMessage));

        const res = await request(app).put(`/jenis-budidaya/${mockId}`).send(updatePayload);
        expect(res.statusCode).toBe(500);
        expect(res.body.message).toBe(errorMessage);
    });
  });

  describe('DELETE /jenis-budidaya/:id', () => {
    const mockId = '1';
    const mockTransaction = originalSequelize.sequelize.transaction();

    const mockJenisBudidayaInstance = {
      id: parseInt(mockId), nama: 'Akan Dihapus', isDeleted: false,
      createdAt: new Date(mockDateString),
      updatedAt: new Date(mockDateString),
      update: jest.fn(async function(payload, options) {
          Object.assign(this, payload);
          this.updatedAt = new Date();
          return this;
      }),
      toJSON: function() { return createPlainVersion(this); }
    };

    beforeEach(() => {
        mockTransaction.commit.mockClear();
        mockTransaction.rollback.mockClear();
        originalSequelize.JenisBudidaya.findOne.mockReset();
        originalSequelize.UnitBudidaya.findAll.mockReset();
        originalSequelize.ObjekBudidaya.update.mockReset();
        originalSequelize.UnitBudidaya.update.mockReset();
        
        mockJenisBudidayaInstance.update.mockClear().mockImplementation(async function(payload, options) {
            Object.assign(this, payload);
            this.updatedAt = new Date();
            return this;
        });
        mockJenisBudidayaInstance.isDeleted = false;
    });

    it('should soft delete related data and return 200 if data exists', async () => {
      originalSequelize.JenisBudidaya.findOne.mockResolvedValue(mockJenisBudidayaInstance);
      const mockUnitBudidayaData = [{ id: 10, jenisBudidayaId: 1 }, { id: 11, jenisBudidayaId: 1 }];
      originalSequelize.UnitBudidaya.findAll.mockResolvedValue(mockUnitBudidayaData);
      originalSequelize.ObjekBudidaya.update.mockResolvedValue([1]);
      originalSequelize.UnitBudidaya.update.mockResolvedValue([mockUnitBudidayaData.length]);

      const res = await request(app).delete(`/jenis-budidaya/${mockId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Jenis Budidaya and related data deleted successfully');
      expect(res.body.data).toEqual({ id: mockId });

      expect(originalSequelize.sequelize.transaction).toHaveBeenCalledTimes(1);
      expect(originalSequelize.JenisBudidaya.findOne).toHaveBeenCalledWith({ where: { id: mockId, isDeleted: false }, transaction: mockTransaction });
      expect(originalSequelize.UnitBudidaya.findAll).toHaveBeenCalledWith({ where: { jenisBudidayaId: mockId, isDeleted: false }, transaction: mockTransaction });

      expect(originalSequelize.ObjekBudidaya.update).toHaveBeenCalledTimes(mockUnitBudidayaData.length);
      for (const unit of mockUnitBudidayaData) {
        expect(originalSequelize.ObjekBudidaya.update).toHaveBeenCalledWith({ isDeleted: true }, { where: { unitBudidayaId: unit.id, isDeleted: false }, transaction: mockTransaction });
      }

      expect(originalSequelize.UnitBudidaya.update).toHaveBeenCalledWith({ isDeleted: true }, { where: { jenisBudidayaId: mockId, isDeleted: false }, transaction: mockTransaction });
      expect(mockJenisBudidayaInstance.update).toHaveBeenCalledWith({ isDeleted: true }, { transaction: mockTransaction });
      expect(mockTransaction.commit).toHaveBeenCalledTimes(1);
      expect(mockTransaction.rollback).not.toHaveBeenCalled();
    });

    it('should return 404 if JenisBudidaya to delete not found', async () => {
      originalSequelize.JenisBudidaya.findOne.mockResolvedValue(null);
      const res = await request(app).delete(`/jenis-budidaya/99`);
      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('Data not found');
      expect(mockTransaction.rollback).toHaveBeenCalledTimes(1);
      expect(mockTransaction.commit).not.toHaveBeenCalled();
    });

    it('should return 500 and rollback if JenisBudidaya.findOne throws error', async () => {
        const errorMessage = 'DB Error on findOne for delete';
        originalSequelize.JenisBudidaya.findOne.mockRejectedValue(new Error(errorMessage));
        const res = await request(app).delete(`/jenis-budidaya/${mockId}`);
        expect(res.statusCode).toBe(500);
        expect(res.body.message).toBe(errorMessage);
        expect(mockTransaction.rollback).toHaveBeenCalledTimes(1);
        expect(mockTransaction.commit).not.toHaveBeenCalled();
    });

    it('should return 500 and rollback if UnitBudidaya.findAll throws error', async () => {
        originalSequelize.JenisBudidaya.findOne.mockResolvedValue(mockJenisBudidayaInstance);
        const errorMessage = 'DB Error on UnitBudidaya.findAll';
        originalSequelize.UnitBudidaya.findAll.mockRejectedValue(new Error(errorMessage));

        const res = await request(app).delete(`/jenis-budidaya/${mockId}`);
        expect(res.statusCode).toBe(500);
        expect(res.body.message).toBe(errorMessage);
        expect(mockTransaction.rollback).toHaveBeenCalledTimes(1);
    });

    it('should return 500 and rollback if ObjekBudidaya.update throws error', async () => {
        originalSequelize.JenisBudidaya.findOne.mockResolvedValue(mockJenisBudidayaInstance);
        originalSequelize.UnitBudidaya.findAll.mockResolvedValue([{ id: 10, jenisBudidayaId: 1 }]);
        const errorMessage = 'DB Error on ObjekBudidaya.update';
        originalSequelize.ObjekBudidaya.update.mockRejectedValue(new Error(errorMessage));

        const res = await request(app).delete(`/jenis-budidaya/${mockId}`);
        expect(res.statusCode).toBe(500);
        expect(res.body.message).toBe(errorMessage);
        expect(mockTransaction.rollback).toHaveBeenCalledTimes(1);
    });
  });
});