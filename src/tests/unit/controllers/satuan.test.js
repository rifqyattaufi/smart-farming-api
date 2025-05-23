// satuan.test.js
const request = require('supertest');
const express = require('express');

jest.mock('../../../model/index', () => ({
  Satuan: {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  Sequelize: {
    Op: { or: 'or', like: 'like' },
  },
  sequelize: {},
}));

jest.mock('../../../validation/dataValidation', () => ({
  dataValid: jest.fn().mockResolvedValue({ message: [] }),
}));

const satuanController = require('../../../controller/farm/satuan');
const sequelize = require('../../../model/index');

const app = express();
app.use(express.json());

app.get('/satuan', satuanController.getAllSatuan);
app.get('/satuan/:id', satuanController.getSatuanById);
app.get('/satuan/search/:nama', satuanController.getSatuanByName);
app.post('/satuan', satuanController.createSatuan);
app.put('/satuan/:id', satuanController.updateSatuan);
app.delete('/satuan/:id', satuanController.deleteSatuan);

describe('Satuan Controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /satuan', () => {
    it('should return 200 and data when found', async () => {
      const mockData = [{ id: 1, nama: 'Kg', lambang: 'kg' }];
      sequelize.Satuan.findAll.mockResolvedValue(mockData);

      const res = await request(app).get('/satuan');

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Successfully retrieved all satuan data');
      expect(res.body.data).toEqual(mockData);
    });

    it('should return 404 when no data found', async () => {
      sequelize.Satuan.findAll.mockResolvedValue([]);

      const res = await request(app).get('/satuan');

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('Data not found');
    });

    it('should return 500 when findAll throws an error', async () => {
      sequelize.Satuan.findAll.mockRejectedValue(new Error('Unexpected Error'));

      const res = await request(app).get('/satuan');

      expect(res.statusCode).toBe(500);
      expect(res.body.message).toBe('Unexpected Error');
    });

  });

  describe('GET /satuan/:id', () => {
    it('should return 200 and data when found', async () => {
      const mockData = { id: 1, nama: 'Kg', lambang: 'kg', isDeleted: false };
      sequelize.Satuan.findOne.mockResolvedValue(mockData);

      const res = await request(app).get('/satuan/1');

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Successfully retrieved satuan data');
      expect(res.body.data).toEqual(mockData);
    });

    it('should return 404 when data not found or deleted', async () => {
      sequelize.Satuan.findOne.mockResolvedValue(null);

      const res = await request(app).get('/satuan/99');

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('Data not found');
    });

    it('should return 500 when findOne throws an error', async () => {
      sequelize.Satuan.findOne.mockRejectedValue(new Error('Unexpected Error'));

      const res = await request(app).get('/satuan/1');

      expect(res.statusCode).toBe(500);
      expect(res.body.message).toBe('Unexpected Error');
    });
  });

  describe('GET /satuan/search/:nama', () => {
    it('should return 200 and data when found', async () => {
      const mockData = [{ id: 1, nama: 'Kg', lambang: 'kg' }];
      sequelize.Satuan.findAll.mockResolvedValue(mockData);

      const res = await request(app).get('/satuan/search/kg');

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Successfully retrieved satuan data');
      expect(res.body.data).toEqual(mockData);
    });

    it('should return 404 when no data found', async () => {
      sequelize.Satuan.findAll.mockResolvedValue([]);

      const res = await request(app).get('/satuan/search/unknown');

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('Data not found');
    });

    it('should return 500 when findAll throws an error', async () => {
      sequelize.Satuan.findAll.mockRejectedValue(new Error('Unexpected Error'));

      const res = await request(app).get('/satuan/search/kg');

      expect(res.statusCode).toBe(500);
      expect(res.body.message).toBe('Unexpected Error');
    });
  });

  describe('POST /satuan', () => {
    it('should return 201 when created successfully', async () => {
      sequelize.Satuan.findOne
            .mockResolvedValueOnce(null)
            .mockResolvedValueOnce(null);

      const newSatuan = { nama: 'Kilogram', lambang: 'Kg' };

      sequelize.Satuan.create.mockResolvedValue({
        ...newSatuan,
        toJSON: () => newSatuan,
      });

      const res = await request(app).post('/satuan').send(newSatuan);

      expect(res.statusCode).toBe(201);
      expect(res.body.message).toBe('Successfully created new satuan data');
      expect(res.body.data.nama).toBe('Kilogram');
    });

    it('should restore soft-deleted data and return 200', async () => {
      const mockSave = jest.fn().mockResolvedValue(true);

      sequelize.Satuan.findOne
        .mockResolvedValueOnce({ // softDeleted
          id: 1,
          nama: 'Kilogram',
          lambang: 'Kg',
          isDeleted: true,
          save: mockSave,
        });

      const res = await request(app).post('/satuan').send({ nama: 'Kilogram' });

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Data already exists before, successfully restored satuan data');
      expect(mockSave).toHaveBeenCalled();
    });

    it('should return 400 when data already exists', async () => {
      sequelize.Satuan.findOne
        .mockResolvedValueOnce(null) // softDeleted
        .mockResolvedValueOnce({ // existing
          id: 1,
          nama: 'Kilogram',
          lambang: 'Kg',
          isDeleted: false,
        });

      const res = await request(app).post('/satuan').send({ nama: 'Kilogram' });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Data already exists.');
    });

    it('should return 400 when validation fails', async () => {
      const { dataValid } = require('../../../validation/dataValidation');
      dataValid.mockResolvedValueOnce({ message: ['nama is required'] });

      const res = await request(app).post('/satuan').send({});

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Validation error');
      expect(res.body.error).toContain('nama is required');
    });

    it('should return 500 when create throws an error', async () => {
      sequelize.Satuan.findOne
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);
      
      sequelize.Satuan.create.mockRejectedValue(new Error('Unexpected Error'));

      const res = await request(app).post('/satuan').send({
        nama: 'Kilogram',
        lambang: 'Kg',
      });

      expect(res.statusCode).toBe(500);
      expect(res.body.message).toBe('Unexpected Error');
    });

  });

  describe('PUT /satuan/:id', () => {
    it('should update and return 200 if data exists', async () => {
      const id = '1';
      const updateData = { nama: 'Gram', lambang: 'g' };
      const existingData = {
        id,
        nama: 'Kg',
        lambang: 'kg',
        isDeleted: false,
        toJSON: () => ({ id, ...updateData }),
      };
      const updatedData = { id, ...updateData, toJSON: () => ({ id, ...updateData }) };

      sequelize.Satuan.findOne
        .mockResolvedValueOnce(existingData) // find before update
        .mockResolvedValueOnce(updatedData); // find after update
      sequelize.Satuan.update.mockResolvedValue([1]);

      const res = await request(app).put(`/satuan/${id}`).send(updateData);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Successfully updated satuan data');
      expect(res.body.data).toEqual({ id, ...updateData });
    });

    it('should return 404 if data not found', async () => {
      sequelize.Satuan.findOne.mockResolvedValue(null);

      const res = await request(app).put('/satuan/99').send({ nama: 'Gram' });

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('Data not found');
    });

    it('should return 500 when update throws an error', async () => {
      const id = '1';
      sequelize.Satuan.findOne.mockResolvedValueOnce({ id, isDeleted: false });
      sequelize.Satuan.update.mockRejectedValue(new Error('Update Failed'));

      const res = await request(app).put(`/satuan/${id}`).send({
        nama: 'Gram',
        lambang: 'g',
      });

      expect(res.statusCode).toBe(500);
      expect(res.body.message).toBe('Update Failed');
    });

  });

  describe('DELETE /satuan/:id', () => {
    it('should delete (soft) and return 200 if data exists', async () => {
      const id = '1';
      const existingData = {
        id,
        isDeleted: false,
        save: jest.fn().mockResolvedValue(true),
      };

      sequelize.Satuan.findOne.mockResolvedValue(existingData);

      const res = await request(app).delete(`/satuan/${id}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Successfully deleted satuan data');
      expect(existingData.isDeleted).toBe(true);
      expect(existingData.save).toHaveBeenCalled();
    });

    it('should return 404 if data not found or already deleted', async () => {
      sequelize.Satuan.findOne.mockResolvedValue(null);

      const res = await request(app).delete('/satuan/99');

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('Data not found');
    });

    it('should return 404 if data is marked as deleted', async () => {
      sequelize.Satuan.findOne.mockResolvedValue({ id: 1, isDeleted: true });

      const res = await request(app).get('/satuan/1');

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('Data not found');
    });

    it('should return 500 when delete throws an error', async () => {
      const id = '1';
      const existingData = {
        id,
        isDeleted: false,
        save: jest.fn().mockRejectedValue(new Error('Delete Failed')),
      };

      sequelize.Satuan.findOne.mockResolvedValue(existingData);

      const res = await request(app).delete(`/satuan/${id}`);

      expect(res.statusCode).toBe(500);
      expect(res.body.message).toBe('Delete Failed');
    });

  });
});
