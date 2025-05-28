const request = require('supertest');
const express = require('express');
const { Op } = require('sequelize');

jest.mock('../../../model/index', () => {
  const ActualOpFromSequelizeLib = require('sequelize').Op;
  const mockGrade = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    save: jest.fn(),
  };

  return {
    Grade: mockGrade,
    sequelize: {
      transaction: jest.fn(() => ({ commit: jest.fn(), rollback: jest.fn() })),
      query: jest.fn(),
    },
    Sequelize: {
      Op: ActualOpFromSequelizeLib,
    },
    __esModule: true,
    default: {
      Grade: mockGrade,
      sequelize: {
        transaction: jest.fn(() => ({ commit: jest.fn(), rollback: jest.fn() })),
        query: jest.fn(),
      },
      Sequelize: {
        Op: ActualOpFromSequelizeLib,
      },
    }
  };
});

jest.mock('../../../validation/dataValidation', () => ({
  dataValid: jest.fn(),
}));

const gradeController = require('../../../controller/farm/grade');
const originalSequelize = require('../../../model/index');
const { dataValid } = require('../../../validation/dataValidation');

const app = express();
app.use(express.json());
app.use((req, res, next) => {
  res.locals = {};
  next();
});

app.get('/grade', gradeController.getAllGrade);
app.get('/grade/search/nama/:nama', gradeController.getGradeByName);
app.get('/grade/:id', gradeController.getGradeById);
app.post('/grade', gradeController.createGrade);
app.put('/grade/:id', gradeController.updateGrade);
app.delete('/grade/:id', gradeController.deleteGrade);


describe('Grade Controller', () => {
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
    }
    if (plain.updatedAt && plain.updatedAt instanceof Date) {
      plain.updatedAt = plain.updatedAt.toISOString();
    }
    return plain;
  };

  describe('GET /grade', () => {
    it('should return 200 and all grade data', async () => {
      const rawMockGrade = {
        id: 1, nama: 'Grade A', deskripsi: 'Super', isDeleted: false,
        createdAt: new Date(mockDateString), updatedAt: new Date(mockDateString),
        toJSON: function() { return createPlainVersion(this); }
      };
      const mockData = [rawMockGrade];
      originalSequelize.Grade.findAll.mockResolvedValue(mockData);

      const res = await request(app).get('/grade');
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Successfully retrieved all grade data');
      expect(res.body.data).toEqual(mockData.map(g => g.toJSON()));
    });

    it('should return 404 if no data found', async () => {
      originalSequelize.Grade.findAll.mockResolvedValue([]);
      const res = await request(app).get('/grade');
      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('Data not found');
    });
  });

  describe('GET /grade/:id', () => {
    it('should return 200 and grade data if found', async () => {
      const rawMockGrade = {
        id: 1, nama: 'Grade B', isDeleted: false,
        createdAt: new Date(mockDateString), updatedAt: new Date(mockDateString),
        toJSON: function() { return createPlainVersion(this); }
      };
      originalSequelize.Grade.findOne.mockResolvedValue(rawMockGrade);
      const res = await request(app).get('/grade/1');
      expect(res.statusCode).toBe(200);
      expect(res.body.data).toEqual(rawMockGrade.toJSON());
    });
    
  });

  describe('GET /grade/search/nama/:nama', () => {
    it('should return 200 and matching grade data', async () => {
        const rawMockGrade = { id: 1, nama: 'Premium Grade', isDeleted: false, toJSON: function() { return createPlainVersion(this); } };
        const mockData = [rawMockGrade];
        originalSequelize.Grade.findAll.mockResolvedValue(mockData);

        const res = await request(app).get('/grade/search/nama/Premium');
        expect(res.statusCode).toBe(200);
        expect(res.body.data).toEqual(mockData.map(g => g.toJSON()));
        expect(originalSequelize.Grade.findAll).toHaveBeenCalledWith(expect.objectContaining({
            where: { [Op.or]: [{ nama: { [Op.like]: '%Premium%' } }], isDeleted: false }
        }));
    });
    
  });

  describe('POST /grade', () => {
    const newPayload = { nama: 'Grade C', deskripsi: 'Standard' };

    it('should return 201 when created successfully', async () => {
      dataValid.mockResolvedValue({ message: [] });
      originalSequelize.Grade.findOne.mockResolvedValue(null);
      const mockCreatedRaw = {
        id: 1, ...newPayload, isDeleted: false,
        createdAt: new Date(mockDateString), updatedAt: new Date(mockDateString),
        toJSON: function() { return createPlainVersion(this); }
      };
      originalSequelize.Grade.create.mockResolvedValue(mockCreatedRaw);

      const res = await request(app).post('/grade').send(newPayload);
      expect(res.statusCode).toBe(201);
      expect(res.body.message).toBe('Successfully created new grade data');
      expect(res.body.data).toEqual(mockCreatedRaw.toJSON());
      expect(originalSequelize.Grade.create).toHaveBeenCalledWith(newPayload);
    });

    it('should return 400 if validation fails', async () => {
      dataValid.mockResolvedValue({ message: ['nama is required'] });
      const res = await request(app).post('/grade').send({});
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Validation error');
      expect(res.body.error).toEqual(['nama is required']);
    });
  });

  describe('PUT /grade/:id', () => {
    const mockId = '1';
    const updatePayload = { nama: 'Grade A Super', deskripsi: 'Top Quality' };

    it('should update and return 200 if data exists', async () => {
      const mockInstance = { id: parseInt(mockId), nama: 'Grade A', isDeleted: false };
      const mockUpdatedData = { id: parseInt(mockId), ...updatePayload, isDeleted: false, toJSON: function() { return createPlainVersion(this); } };

      originalSequelize.Grade.findOne.mockResolvedValueOnce(mockInstance);
      originalSequelize.Grade.update.mockResolvedValue([1]);
      originalSequelize.Grade.findOne.mockResolvedValueOnce(mockUpdatedData);

      const res = await request(app).put(`/grade/${mockId}`).send(updatePayload);
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Successfully updated grade data');
      
      expect(res.body.data).toEqual({ id: mockId, ...updatePayload });
      expect(originalSequelize.Grade.update).toHaveBeenCalledWith(updatePayload, { where: { id: mockId } });
    });
    
  });

  describe('DELETE /grade/:id', () => {
    const mockId = '1';
    it('should soft delete and return 200 if data exists', async () => {
      const mockInstance = {
        id: parseInt(mockId), nama: 'To Delete', isDeleted: false,
        
        save: jest.fn(async function() {
          this.isDeleted = true;
          return this;
        }),
        toJSON: function() { return createPlainVersion(this); }
      };
      originalSequelize.Grade.findOne.mockResolvedValue(mockInstance);

      const res = await request(app).delete(`/grade/${mockId}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Successfully deleted grade data');
      expect(mockInstance.isDeleted).toBe(true);
      expect(mockInstance.save).toHaveBeenCalled();
    });
  });
});