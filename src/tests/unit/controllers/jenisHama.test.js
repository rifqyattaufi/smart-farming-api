// jenisHama.test
const request = require('supertest');
const express = require('express');

jest.mock('../../../model/index', () => ({
  JenisHama: {
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

const jenisHamaController = require('../../../controller/farm/jenisHama');
const sequelize = require('../../../model/index');

const app = express();
app.use(express.json());

app.get('/jenis-hama', jenisHamaController.getAlljenisHama);
app.get('/jenis-hama/:id', jenisHamaController.getjenisHamaById);
app.get('/jenis-hama/search/:nama', jenisHamaController.getjenisHamaByName);
app.post('/jenis-hama', jenisHamaController.createjenisHama);
app.put('/jenis-hama/:id', jenisHamaController.updatejenisHama);
app.delete('/jenis-hama/:id', jenisHamaController.deletejenisHama);

describe('Jenis Hama Controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /jenis-hama', () => {
    it('should return 200 and data when found', async () => {
      const mockData = [{ id: 1, nama: 'Tikus' }];
      sequelize.JenisHama.findAll.mockResolvedValue(mockData);

      const res = await request(app).get('/jenis-hama');

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Successfully retrieved all jenis hama data');
      expect(res.body.data).toEqual(mockData);
    });

    it('should return 404 when no data found', async () => {
      sequelize.JenisHama.findAll.mockResolvedValue([]);

      const res = await request(app).get('/jenis-hama');

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('Data not found');
    });

    it('should return 500 when there is a server error on findAll', async () => {
      sequelize.JenisHama.findAll.mockRejectedValue(new Error('DB error'));

      const res = await request(app).get('/jenis-hama');

      expect(res.statusCode).toBe(500);
      expect(res.body.message).toBe('DB error');
    });

  });

  describe('GET /jenis-hama/:id', () => {
    it('should return 200 and data when found', async () => {
      const mockData = { id: 1, nama: 'Tikus', isDeleted: false };
      sequelize.JenisHama.findOne.mockResolvedValue(mockData);

      const res = await request(app).get('/jenis-hama/1');

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Successfully retrieved jenis hama data');
      expect(res.body.data).toEqual(mockData);
    });

    it('should return 404 when data not found or deleted', async () => {
      sequelize.JenisHama.findOne.mockResolvedValue(null);

      const res = await request(app).get('/jenis-hama/99');

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('Data not found');
    });

  it('should return 500 when there is a server error on get by id', async () => {
    sequelize.JenisHama.findOne.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/jenis-hama/1');

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe('DB error');
  });

  });

  describe('GET /jenis-hama/search/:nama', () => {
    it('should return 200 and data when found', async () => {
      const mockData = [{ id: 1, nama: 'Tikus' }];
      sequelize.JenisHama.findAll.mockResolvedValue(mockData);

      const res = await request(app).get('/jenis-hama/search/tik');

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Successfully retrieved jenis hama data');
      expect(res.body.data).toEqual(mockData);
    });

    it('should return 404 when no data found', async () => {
      sequelize.JenisHama.findAll.mockResolvedValue([]);

      const res = await request(app).get('/jenis-hama/search/unknown');

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('Data not found');
    });

    it('should return 500 when there is a server error on get by name', async () => {
      sequelize.JenisHama.findAll.mockRejectedValue(new Error('Search failed'));

      const res = await request(app).get('/jenis-hama/search/tikus');

      expect(res.statusCode).toBe(500);
      expect(res.body.message).toBe('Search failed');
    });

  });

  describe('POST /jenis-hama', () => {
    it('should return 201 when created successfully', async () => {
      sequelize.JenisHama.findOne
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);

      const newJenisHama = { nama: 'Ulat' };

      sequelize.JenisHama.create.mockResolvedValue({
        ...newJenisHama,
        toJSON: () => newJenisHama,
      });

      const res = await request(app).post('/jenis-hama').send(newJenisHama);

      expect(res.statusCode).toBe(201);
      expect(res.body.message).toBe('Successfully created new jenis hama data');
      expect(res.body.data.nama).toBe('Ulat');
    });

    it('should restore soft-deleted data and return 200', async () => {
      const mockSave = jest.fn().mockResolvedValue(true);

      sequelize.JenisHama.findOne
        .mockResolvedValueOnce({ // softDeleted
          id: 1,
          nama: 'Ulat',
          isDeleted: true,
          save: mockSave,
        });

      const res = await request(app).post('/jenis-hama').send({ nama: 'Ulat' });

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Data already exists before, successfully restored jenis hama data');
      expect(mockSave).toHaveBeenCalled();
    });

    it('should return 400 when data already exists', async () => {
      sequelize.JenisHama.findOne
        .mockResolvedValueOnce(null) // softDeleted
        .mockResolvedValueOnce({ // existing
          id: 1,
          nama: 'Tikus',
          isDeleted: false,
        });

      const res = await request(app).post('/jenis-hama').send({ nama: 'Tikus' });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Data already exists.');
    });

    it('should return 400 when validation fails', async () => {
      const { dataValid } = require('../../../validation/dataValidation');
      dataValid.mockResolvedValueOnce({ message: ['nama is required'] });

      const res = await request(app).post('/jenis-hama').send({});

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Validation error');
      expect(res.body.error).toContain('nama is required');
    });

    it('should return 500 when there is a server error on create', async () => {
      sequelize.JenisHama.findOne
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);

      sequelize.JenisHama.create.mockRejectedValue(new Error('Insert failed'));

      const res = await request(app).post('/jenis-hama').send({ nama: 'Tikus' });

      expect(res.statusCode).toBe(500);
      expect(res.body.message).toBe('Insert failed');
    });

  });

  describe('PUT /jenis-hama/:id', () => {
    it('should update and return 200 if data exists', async () => {
      const id = '1';
      const updateData = { nama: 'Ulat Bulu' };
      const existingData = {
        id,
        nama: 'Ulat',
        isDeleted: false,
        toJSON: () => ({ id, ...updateData }),
      };
      const updatedData = { id, ...updateData, toJSON: () => ({ id, ...updateData }) };

      sequelize.JenisHama.findOne
        .mockResolvedValueOnce(existingData) // find before update
        .mockResolvedValueOnce(updatedData); // find after update
      sequelize.JenisHama.update.mockResolvedValue([1]);

      const res = await request(app).put(`/jenis-hama/${id}`).send(updateData);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Successfully updated jenis hama data');
      expect(res.body.data).toEqual({ id, ...updateData });
    });

    it('should return 404 if data not found', async () => {
      sequelize.JenisHama.findOne.mockResolvedValue(null);

      const res = await request(app).put('/jenis-hama/99').send({ nama: 'Ulat Bulu' });

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('Data not found');
    });

    it('should return 500 when there is a server error on update', async () => {
      const id = '1';
      const updateData = { nama: 'Updated' };
      const existingData = { id, isDeleted: false };

      sequelize.JenisHama.findOne.mockResolvedValue(existingData);
      sequelize.JenisHama.update.mockRejectedValue(new Error('Update failed'));

      const res = await request(app).put(`/jenis-hama/${id}`).send(updateData);

      expect(res.statusCode).toBe(500);
      expect(res.body.message).toBe('Update failed');
    });
  });

  describe('DELETE /jenis-hama/:id', () => {
    it('should delete (soft) and return 200 if data exists', async () => {
      const id = '1';
      const existingData = {
        id,
        isDeleted: false,
        save: jest.fn().mockResolvedValue(true),
      };

      sequelize.JenisHama.findOne.mockResolvedValue(existingData);

      const res = await request(app).delete(`/jenis-hama/${id}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Successfully deleted jenis hama data');
      expect(existingData.isDeleted).toBe(true);
      expect(existingData.save).toHaveBeenCalled();
    });

    it('should return 404 if data not found or already deleted', async () => {
      sequelize.JenisHama.findOne.mockResolvedValue(null);

      const res = await request(app).delete('/jenis-hama/99');

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

      sequelize.JenisHama.findOne.mockResolvedValue(existingData);

      const res = await request(app).delete(`/jenis-hama/${id}`);

      expect(res.statusCode).toBe(500);
      expect(res.body.message).toBe('Delete failed');
    });
  });
});
