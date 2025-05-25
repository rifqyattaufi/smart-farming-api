// kategoriInventaris.test.js
const request = require('supertest');
const express = require('express');

jest.mock('../../../model/index', () => ({
  KategoriInventaris: {
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

const kategoriInventarisController = require('../../../controller/farm/kategoriInventaris');
const sequelize = require('../../../model/index');

const app = express();
app.use(express.json());

app.get('/kategori-inventaris', kategoriInventarisController.getAllKategoriInventaris);
app.get('/kategori-inventaris/:id', kategoriInventarisController.getKategoriInventarisById);
app.get('/kategori-inventaris/search/:nama', kategoriInventarisController.getKategoriInventarisByName);
app.post('/kategori-inventaris', kategoriInventarisController.createKategoriInventaris);
app.put('/kategori-inventaris/:id', kategoriInventarisController.updateKategoriInventaris);
app.delete('/kategori-inventaris/:id', kategoriInventarisController.deleteKategoriInventaris);

describe('Kategori Inventaris Controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /kategori-inventaris', () => {
    it('should return 200 and data when found', async () => {
      const mockData = [{ id: 1, nama: 'Pupuk' }];
      sequelize.KategoriInventaris.findAll.mockResolvedValue(mockData);

      const res = await request(app).get('/kategori-inventaris');

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Successfully retrieved all kategori inventaris data');
      expect(res.body.data).toEqual(mockData);
    });

    it('should return 404 when no data found', async () => {
      sequelize.KategoriInventaris.findAll.mockResolvedValue([]);

      const res = await request(app).get('/kategori-inventaris');

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('Data not found');
    });

    it('should return 500 when there is a server error on findAll', async () => {
      sequelize.KategoriInventaris.findAll.mockRejectedValue(new Error('DB error'));

      const res = await request(app).get('/kategori-inventaris');

      expect(res.statusCode).toBe(500);
      expect(res.body.message).toBe('DB error');
    });

  });

  describe('GET /kategori-inventaris/:id', () => {
    it('should return 200 and data when found', async () => {
      const mockData = { id: 1, nama: 'Pupuk', isDeleted: false };
      sequelize.KategoriInventaris.findOne.mockResolvedValue(mockData);

      const res = await request(app).get('/kategori-inventaris/1');

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Successfully retrieved kategori inventaris data');
      expect(res.body.data).toEqual(mockData);
    });

    it('should return 404 when data not found or deleted', async () => {
      sequelize.KategoriInventaris.findOne.mockResolvedValue(null);

      const res = await request(app).get('/kategori-inventaris/99');

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('Data not found');
    });

  it('should return 500 when there is a server error on get by id', async () => {
    sequelize.KategoriInventaris.findOne.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/kategori-inventaris/1');

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe('DB error');
  });

  });

  describe('GET /kategori-inventaris/search/:nama', () => {
    it('should return 200 and data when found', async () => {
      const mockData = [{ id: 1, nama: 'Pupuk' }];
      sequelize.KategoriInventaris.findAll.mockResolvedValue(mockData);

      const res = await request(app).get('/kategori-inventaris/search/pupuk');

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Successfully retrieved kategori inventaris data');
      expect(res.body.data).toEqual(mockData);
    });

    it('should return 404 when no data found', async () => {
      sequelize.KategoriInventaris.findAll.mockResolvedValue([]);

      const res = await request(app).get('/kategori-inventaris/search/unknown');

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('Data not found');
    });

    it('should return 500 when there is a server error on get by name', async () => {
      sequelize.KategoriInventaris.findAll.mockRejectedValue(new Error('Search failed'));

      const res = await request(app).get('/kategori-inventaris/search/pupuk');

      expect(res.statusCode).toBe(500);
      expect(res.body.message).toBe('Search failed');
    });

  });

  describe('POST /kategori-inventaris', () => {
    it('should return 201 when created successfully', async () => {
      sequelize.KategoriInventaris.findOne
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);

      const newKategoriInventaris = { nama: 'Pupuk' };

      sequelize.KategoriInventaris.create.mockResolvedValue({
        ...newKategoriInventaris,
        toJSON: () => newKategoriInventaris,
      });

      const res = await request(app).post('/kategori-inventaris').send(newKategoriInventaris);

      expect(res.statusCode).toBe(201);
      expect(res.body.message).toBe('Successfully created new kategori inventaris data');
      expect(res.body.data.nama).toBe('Pupuk');
    });

    it('should restore soft-deleted data and return 200', async () => {
      const mockSave = jest.fn().mockResolvedValue(true);

      sequelize.KategoriInventaris.findOne
        .mockResolvedValueOnce({ // softDeleted
          id: 1,
          nama: 'Pupuk',
          isDeleted: true,
          save: mockSave,
        });

      const res = await request(app).post('/kategori-inventaris').send({ nama: 'Pupuk' });

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Data already exists before, successfully restored kategori inventaris data');
      expect(mockSave).toHaveBeenCalled();
    });

    it('should return 400 when data already exists', async () => {
      sequelize.KategoriInventaris.findOne
        .mockResolvedValueOnce(null) // softDeleted
        .mockResolvedValueOnce({ // existing
          id: 1,
          nama: 'Pupuk',
          isDeleted: false,
        });

      const res = await request(app).post('/kategori-inventaris').send({ nama: 'Pupuk' });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Data already exists.');
    });

    it('should return 400 when validation fails', async () => {
      const { dataValid } = require('../../../validation/dataValidation');
      dataValid.mockResolvedValueOnce({ message: ['nama is required'] });

      const res = await request(app).post('/kategori-inventaris').send({});

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Validation error');
      expect(res.body.error).toContain('nama is required');
    });

    it('should return 500 when there is a server error on create', async () => {
      sequelize.KategoriInventaris.findOne
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);

      sequelize.KategoriInventaris.create.mockRejectedValue(new Error('Insert failed'));

      const res = await request(app).post('/kategori-inventaris').send({ nama: 'Pupuk' });

      expect(res.statusCode).toBe(500);
      expect(res.body.message).toBe('Insert failed');
    });

  });

  describe('PUT /kategori-inventaris/:id', () => {
    it('should update and return 200 if data exists', async () => {
      const id = '1';
      const updateData = { nama: 'Pupuk Organik' };
      const existingData = {
        id,
        nama: 'Pupuk',
        isDeleted: false,
        toJSON: () => ({ id, ...updateData }),
      };
      const updatedData = { id, ...updateData, toJSON: () => ({ id, ...updateData }) };

      sequelize.KategoriInventaris.findOne
        .mockResolvedValueOnce(existingData) // find before update
        .mockResolvedValueOnce(updatedData); // find after update
      sequelize.KategoriInventaris.update.mockResolvedValue([1]);

      const res = await request(app).put(`/kategori-inventaris/${id}`).send(updateData);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Successfully updated kategori inventaris data');
      expect(res.body.data).toEqual({ id, ...updateData });
    });

    it('should return 404 if data not found', async () => {
      sequelize.KategoriInventaris.findOne.mockResolvedValue(null);

      const res = await request(app).put('/kategori-inventaris/99').send({ nama: 'Pupuk Organik' });

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('Data not found');
    });

    it('should return 500 when there is a server error on update', async () => {
      const id = '1';
      const updateData = { nama: 'Updated' };
      const existingData = { id, isDeleted: false };

      sequelize.KategoriInventaris.findOne.mockResolvedValue(existingData);
      sequelize.KategoriInventaris.update.mockRejectedValue(new Error('Update failed'));

      const res = await request(app).put(`/kategori-inventaris/${id}`).send(updateData);

      expect(res.statusCode).toBe(500);
      expect(res.body.message).toBe('Update failed');
    });
  });

  describe('DELETE /kategori-inventaris/:id', () => {
    it('should delete (soft) and return 200 if data exists', async () => {
      const id = '1';
      const existingData = {
        id,
        isDeleted: false,
        save: jest.fn().mockResolvedValue(true),
      };

      sequelize.KategoriInventaris.findOne.mockResolvedValue(existingData);

      const res = await request(app).delete(`/kategori-inventaris/${id}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Successfully deleted kategori inventaris data');
      expect(existingData.isDeleted).toBe(true);
      expect(existingData.save).toHaveBeenCalled();
    });

    it('should return 404 if data not found or already deleted', async () => {
      sequelize.KategoriInventaris.findOne.mockResolvedValue(null);

      const res = await request(app).delete('/kategori-inventaris/99');

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('Data not found');
    });

    it('should return 500 when there is a server error on delete (save fails)', async () => {
      const id = '1';
      const existingData = {
        id,
        isDeleted: false,
        save: jest.fn().mockRejectedValue(new Error('Delete failed')),
      };

      sequelize.KategoriInventaris.findOne.mockResolvedValue(existingData);

      const res = await request(app).delete(`/kategori-inventaris/${id}`);

      expect(res.statusCode).toBe(500);
      expect(res.body.message).toBe('Delete failed');
    });
  });
});
