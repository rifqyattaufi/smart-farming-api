const request = require('supertest');
const express = require('express');

jest.mock('../../../model/index', () => {
  const ActualOpFromSequelizeLib = require('sequelize').Op; 
  
  const mockJenisHama = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    save: jest.fn(),
    findAndCountAll: jest.fn(),
  };

  return {
    JenisHama: mockJenisHama,
    Sequelize: {
      Op: ActualOpFromSequelizeLib,
    },
    sequelize: {},
    __esModule: true,
    default: { 
      JenisHama: mockJenisHama,
      Sequelize: {
        Op: ActualOpFromSequelizeLib, 
      },
      sequelize: {},
    }
  };
});

jest.mock('../../../utils/paginationUtils', () => ({
  getPaginationOptions: jest.fn(),
}));

jest.mock('../../../validation/dataValidation', () => ({
  dataValid: jest.fn(),
}));

const jenisHamaController = require('../../../controller/farm/jenisHama');
const sequelize = require('../../../model/index');
const { getPaginationOptions } = require('../../../utils/paginationUtils');
const { dataValid } = require('../../../validation/dataValidation');


const app = express();
app.use(express.json());
app.use((req, res, next) => {
  res.locals = {};
  next();
});

app.get('/jenis-hama', jenisHamaController.getAlljenisHama);
app.get('/jenis-hama/search/:nama', jenisHamaController.getjenisHamaSearch);
app.get('/jenis-hama/:id', jenisHamaController.getjenisHamaById);
app.post('/jenis-hama', jenisHamaController.createjenisHama);
app.put('/jenis-hama/:id', jenisHamaController.updatejenisHama);
app.delete('/jenis-hama/:id', jenisHamaController.deletejenisHama);


describe('Jenis Hama Controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /jenis-hama', () => {
    it('should return 200 and paginated data when found', async () => {
      const mockDateString = new Date().toISOString();
      const mockDataRows = [{ id: 1, nama: 'Tikus', createdAt: mockDateString, updatedAt: mockDateString }];
      const mockCount = 1;
      sequelize.JenisHama.findAndCountAll.mockResolvedValue({ 
        count: mockCount, 
        rows: mockDataRows.map(item => ({...item}))
      });
      getPaginationOptions.mockReturnValue({ limit: 10, offset: 0 }); 

      const res = await request(app).get('/jenis-hama?page=1&limit=10');

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Successfully retrieved all jenis hama data');
      expect(res.body.data).toEqual(mockDataRows);
      expect(res.body.totalItems).toBe(mockCount);
      expect(res.body.totalPages).toBe(1);
      expect(res.body.currentPage).toBe(1);
    });

    it('should return 200 and "Data not found" on page 1 if no data', async () => {
      sequelize.JenisHama.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });
      getPaginationOptions.mockReturnValue({ limit: 10, offset: 0 });

      const res = await request(app).get('/jenis-hama?page=1&limit=10');
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Data not found');
      expect(res.body.data).toEqual([]);
    });

    it('should return 200 and "No more data" on subsequent pages if no data', async () => {
      sequelize.JenisHama.findAndCountAll.mockResolvedValue({ count: 10, rows: [] }); 
      getPaginationOptions.mockReturnValue({ limit: 10, offset: 10 }); 

      const res = await request(app).get('/jenis-hama?page=2&limit=10');
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('No more data');
    });

    it('should return 500 when findAndCountAll throws an error', async () => {
      const errorMessage = 'DB error findAndCountAll';
      sequelize.JenisHama.findAndCountAll.mockRejectedValue(new Error(errorMessage));
      getPaginationOptions.mockReturnValue({ limit: 10, offset: 0 });

      const res = await request(app).get('/jenis-hama');
      expect(res.statusCode).toBe(500);
      expect(res.body.message).toBe(errorMessage);
    });
  });

  describe('GET /jenis-hama/search/:nama', () => {
    it('should return 200 and paginated data when found by name', async () => {
      const mockDateString = new Date().toISOString();
      const mockDataRows = [{ id: 1, nama: 'Tikus Sawah', createdAt: mockDateString, updatedAt: mockDateString }];
      const mockCount = 1;
      sequelize.JenisHama.findAndCountAll.mockResolvedValue({ 
        count: mockCount, 
        rows: mockDataRows.map(item => ({...item})) 
      });
      getPaginationOptions.mockReturnValue({ limit: 10, offset: 0 }); 

      const res = await request(app).get('/jenis-hama/search/Tikus?page=1&limit=10');

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Successfully retrieved jenis hama data');
      expect(res.body.data).toEqual(mockDataRows);
      expect(sequelize.JenisHama.findAndCountAll).toHaveBeenCalledWith(expect.objectContaining({
        where: {
          isDeleted: false,
          nama: { [sequelize.Sequelize.Op.like]: '%Tikus%' },
        },
      }));
    });

    it('should return 200 and "Data not found" on page 1 if no data for search', async () => {
      sequelize.JenisHama.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });
      getPaginationOptions.mockReturnValue({ limit: 10, offset: 0 });

      const res = await request(app).get('/jenis-hama/search/Unknown?page=1');
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Data not found for the given search criteria');
    });
    
    it('should return 200 and "No more data" on subsequent pages if no data for search', async () => {
      sequelize.JenisHama.findAndCountAll.mockResolvedValue({ count: 5, rows: [] }); 
      getPaginationOptions.mockReturnValue({ limit: 10, offset: 10 }); 

      const res = await request(app).get('/jenis-hama/search/Tikus?page=2&limit=10');
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('No more data for this search');
    });

    it('should search all if name is "all"', async () => {
      sequelize.JenisHama.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });
      getPaginationOptions.mockReturnValue({ limit: 10, offset: 0 });

      await request(app).get('/jenis-hama/search/all');
      expect(sequelize.JenisHama.findAndCountAll).toHaveBeenCalledWith(expect.objectContaining({
          where: { isDeleted: false }, 
      }));
    });

    it('should return 500 when search throws an error', async () => {
      const errorMessage = 'DB error search';
      sequelize.JenisHama.findAndCountAll.mockRejectedValue(new Error(errorMessage));
      getPaginationOptions.mockReturnValue({ limit: 10, offset: 0 });

      const res = await request(app).get('/jenis-hama/search/Tikus');
      expect(res.statusCode).toBe(500);
      expect(res.body.message).toBe(errorMessage);
    });
  });

  describe('GET /jenis-hama/:id', () => {
    it('should return 200 and data when found by id', async () => {
      const mockDateString = new Date().toISOString();
      const mockHamaData = { 
        id: 1, 
        nama: 'Tikus Rumah', 
        isDeleted: false, 
        createdAt: mockDateString, 
        updatedAt: mockDateString 
      };

      const mockInstance = { 
        ...mockHamaData,
        toJSON: () => mockHamaData
      };
      sequelize.JenisHama.findOne.mockResolvedValue(mockInstance);

      const res = await request(app).get('/jenis-hama/1');

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Successfully retrieved jenis hama data');
      expect(res.body.data).toEqual(mockHamaData);
      expect(sequelize.JenisHama.findOne).toHaveBeenCalledWith({
        where: { id: '1', isDeleted: false },
      });
    });

    it('should return 404 when data not found by id', async () => {
      sequelize.JenisHama.findOne.mockResolvedValue(null);

      const res = await request(app).get('/jenis-hama/99');
      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('Data not found');
    });

    it('should return 500 when findOne (for getById) throws an error', async () => {
      const errorMessage = 'DB error getById';
      sequelize.JenisHama.findOne.mockRejectedValue(new Error(errorMessage));

      const res = await request(app).get('/jenis-hama/1');
      expect(res.statusCode).toBe(500);
      expect(res.body.message).toBe(errorMessage);
    });
  });

  describe('POST /jenis-hama', () => {
    it('should return 201 when created successfully', async () => {
      const newJenisHamaPayload = { nama: 'Ulat Grayak' };
      const mockDateString = new Date().toISOString(); 
      const returnedInstanceData = { 
          id: 1, 
          ...newJenisHamaPayload, 
          isDeleted: false, 
          createdAt: new Date(mockDateString),
          updatedAt: new Date(mockDateString),
          toJSON: function() {
            return { 
              id: this.id, 
              nama: this.nama, 
              isDeleted: this.isDeleted,
              createdAt: this.createdAt.toISOString(),
              updatedAt: this.updatedAt.toISOString(),
            };
          }
      };
      
      dataValid.mockResolvedValue({ message: [] }); 
      sequelize.JenisHama.create.mockResolvedValue(returnedInstanceData);

      const res = await request(app).post('/jenis-hama').send(newJenisHamaPayload);

      expect(res.statusCode).toBe(201);
      expect(res.body.message).toBe('Successfully created new jenis hama data');
      expect(res.body.data).toEqual({
        id: 1,
        ...newJenisHamaPayload,
        isDeleted: false,
        createdAt: mockDateString,
        updatedAt: mockDateString,
      });
      expect(sequelize.JenisHama.create).toHaveBeenCalledWith(newJenisHamaPayload);
    });
    
    it('should return 400 when validation fails', async () => {
      const validationErrors = ['nama is required'];
      dataValid.mockResolvedValue({ message: validationErrors });

      const res = await request(app).post('/jenis-hama').send({});
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Validation error');
      expect(res.body.error).toEqual(validationErrors);
    });

    it('should return 500 when create throws an error', async () => {
      const errorMessage = 'DB error create';
      dataValid.mockResolvedValue({ message: [] });
      sequelize.JenisHama.create.mockRejectedValue(new Error(errorMessage));

      const res = await request(app).post('/jenis-hama').send({ nama: 'Gagal' });
      expect(res.statusCode).toBe(500);
      expect(res.body.message).toBe(errorMessage);
    });
  });

  describe('PUT /jenis-hama/:id', () => {
    const mockId = '1';
    const updatePayload = { nama: 'Ulat Bulu Super' };
    const initialDateString = new Date(Date.now() - 100000).toISOString();
    const updatedDateString = new Date().toISOString();

    const mockExistingInstance = {
      id: parseInt(mockId),
      nama: 'Ulat Bulu Lama',
      isDeleted: false,
      createdAt: new Date(initialDateString),
      updatedAt: new Date(initialDateString),
      
      update: jest.fn(async function(payload) {
          Object.assign(this, payload); 
          this.updatedAt = new Date(updatedDateString);
          return this;
      }), 
      toJSON: jest.fn(function() { 
          return { 
              id: this.id, 
              nama: this.nama, 
              isDeleted: this.isDeleted,
              createdAt: this.createdAt.toISOString(),
              updatedAt: this.updatedAt.toISOString(),
          };
      })
    };
    
    it('should update and return 200 if data exists', async () => {
      
      mockExistingInstance.nama = 'Ulat Bulu Lama';
      mockExistingInstance.updatedAt = new Date(initialDateString);
      mockExistingInstance.toJSON.mockImplementation(function() {
        return { 
            id: this.id, 
            nama: this.nama, 
            isDeleted: this.isDeleted,
            createdAt: this.createdAt.toISOString(),
            updatedAt: this.updatedAt.toISOString(),
        };
      });


      sequelize.JenisHama.findOne.mockResolvedValue(mockExistingInstance);

      const res = await request(app).put(`/jenis-hama/${mockId}`).send(updatePayload);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Successfully updated jenis hama data');
      expect(mockExistingInstance.update).toHaveBeenCalledWith(updatePayload);
      expect(mockExistingInstance.toJSON).toHaveBeenCalled();
      expect(res.body.data).toEqual({
        id: parseInt(mockId),
        nama: updatePayload.nama,
        isDeleted: false,
        createdAt: initialDateString,
        updatedAt: updatedDateString,
      });
    });

    it('should return 404 if data to update not found', async () => {
      sequelize.JenisHama.findOne.mockResolvedValue(null);

      const res = await request(app).put(`/jenis-hama/99`).send(updatePayload);
      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('Data not found');
    });

    it('should return 500 when findOne (for update) throws an error', async () => {
      const errorMessage = 'DB error findOne for update';
      sequelize.JenisHama.findOne.mockRejectedValue(new Error(errorMessage));
      
      const res = await request(app).put(`/jenis-hama/${mockId}`).send(updatePayload);
      expect(res.statusCode).toBe(500);
      expect(res.body.message).toBe(errorMessage);
    });
    
    it('should return 500 when instance.update throws an error', async () => {
      const errorMessage = 'DB error instance.update';
      
      const freshMockInstance = {
        ...mockExistingInstance,
        update: jest.fn().mockRejectedValue(new Error(errorMessage)),
        toJSON: jest.fn().mockReturnValue({ id: parseInt(mockId), nama: 'Gagal Update' })
      };
      sequelize.JenisHama.findOne.mockResolvedValue(freshMockInstance);

      const res = await request(app).put(`/jenis-hama/${mockId}`).send(updatePayload);
      expect(res.statusCode).toBe(500);
      expect(res.body.message).toBe(errorMessage);
    });
  });

  describe('DELETE /jenis-hama/:id', () => {
    const mockId = '1';
    const mockDateString = new Date().toISOString();

    const mockInstanceToDelete = {
      id: parseInt(mockId),
      nama: 'Akan Dihapus',
      isDeleted: false,
      createdAt: new Date(mockDateString),
      updatedAt: new Date(mockDateString),
      save: jest.fn(async function() {
          this.isDeleted = true; 
          this.updatedAt = new Date();
          return this; 
      }),
      toJSON: jest.fn(function() { 
          return { 
              id: this.id, 
              nama: this.nama, 
              isDeleted: this.isDeleted,
              createdAt: this.createdAt.toISOString(),
              updatedAt: this.updatedAt.toISOString(),
          };
      })
    };

    it('should soft delete and return 200 if data exists', async () => {
      
      mockInstanceToDelete.isDeleted = false;
      sequelize.JenisHama.findOne.mockResolvedValue(mockInstanceToDelete);

      const res = await request(app).delete(`/jenis-hama/${mockId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Successfully deleted jenis hama data');
      expect(res.body.data).toEqual({ id: mockId }); 
      expect(mockInstanceToDelete.isDeleted).toBe(true);
      expect(mockInstanceToDelete.save).toHaveBeenCalled();
      expect(mockInstanceToDelete.toJSON).toHaveBeenCalled();
    });

    it('should return 404 if data to delete not found', async () => {
      sequelize.JenisHama.findOne.mockResolvedValue(null);

      const res = await request(app).delete(`/jenis-hama/99`);
      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('Data not found');
    });

    it('should return 500 when findOne (for delete) throws an error', async () => {
      const errorMessage = 'DB error findOne for delete';
      sequelize.JenisHama.findOne.mockRejectedValue(new Error(errorMessage));
      
      const res = await request(app).delete(`/jenis-hama/${mockId}`);
      expect(res.statusCode).toBe(500);
      expect(res.body.message).toBe(errorMessage);
    });

    it('should return 500 when instance.save throws an error', async () => {
      const errorMessage = 'DB error instance.save on delete';
      const freshMockInstance = {
        ...mockInstanceToDelete,
        isDeleted: false,
        save: jest.fn().mockRejectedValue(new Error(errorMessage)),
      };
      sequelize.JenisHama.findOne.mockResolvedValue(freshMockInstance);

      const res = await request(app).delete(`/jenis-hama/${mockId}`);
      expect(res.statusCode).toBe(500);
      expect(res.body.message).toBe(errorMessage);
    });
  });
});