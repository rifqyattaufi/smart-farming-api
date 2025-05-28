const request = require('supertest');
const express = require('express');
const { Op, QueryTypes } = require('sequelize');

jest.mock('../../../model/index', () => {
  const ActualOpFromSequelizeLib = require('sequelize').Op;
  const mockInventaris = {
    findAndCountAll: jest.fn(),
    findOne: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    save: jest.fn(),
  };
  const mockKategoriInventaris = { findOne: jest.fn(), findAll: jest.fn() };
  const mockSatuan = { findOne: jest.fn(), findAll: jest.fn() };
  const mockSequelizeInstance = {
    query: jest.fn(),
    transaction: jest.fn(() => ({
      commit: jest.fn(),
      rollback: jest.fn(),
    })),
  };

  return {
    Inventaris: mockInventaris,
    KategoriInventaris: mockKategoriInventaris,
    Satuan: mockSatuan,
    sequelize: mockSequelizeInstance,
    Sequelize: {
      Op: ActualOpFromSequelizeLib,
      QueryTypes: require('sequelize').QueryTypes,
    },
    __esModule: true,
    default: {
      Inventaris: mockInventaris,
      KategoriInventaris: mockKategoriInventaris,
      Satuan: mockSatuan,
      sequelize: mockSequelizeInstance,
      Sequelize: {
        Op: ActualOpFromSequelizeLib,
        QueryTypes: require('sequelize').QueryTypes,
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

const inventarisController = require('../../../controller/farm/inventaris');
const originalSequelize = require('../../../model/index');
const { getPaginationOptions } = require('../../../utils/paginationUtils');

const app = express();
app.use(express.json());
app.use((req, res, next) => {
  res.locals = {};
  next();
});

app.get('/inventaris', inventarisController.getAllInventaris);
app.get('/inventaris/search/nama/:nama', inventarisController.getInventarisByName);
app.get('/inventaris/kategori/nama/:kategori', inventarisController.getInventarisByKategoriName);
app.get('/inventaris/kategori/:kategoriId', inventarisController.getInventarisByKategoriId);
app.get('/inventaris/riwayat/penggunaan', inventarisController.getRiwayatPenggunaanInventaris);
app.get('/inventaris/:id', inventarisController.getInventarisById);
app.post('/inventaris', inventarisController.createInventaris);
app.put('/inventaris/:id', inventarisController.updateInventaris);
app.delete('/inventaris/:id', inventarisController.deleteInventaris);

describe('Inventaris Controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const mockDate = new Date();
  const mockDateString = mockDate.toISOString();
  const mockKategori = { id: 1, nama: 'Alat' };
  const mockSatuan = { id: 1, nama: 'Unit', lambang: 'pcs' };

  const createPlainVersion = (instanceData) => {
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

  describe('GET /inventaris', () => {
    it('should return 200 and paginated data when found', async () => {
      const rawMockDataRow = {
        id: 1, nama: 'Cangkul', stok: 10, KategoriInventarisId: 1, SatuanId: 1, isDeleted: false,
        createdAt: new Date(mockDateString),
        updatedAt: new Date(mockDateString),
        kategoriInventaris: mockKategori,
        Satuan: mockSatuan,
        
        toJSON: function() { return createPlainVersion(this); }
      };
      const mockDataRows = [rawMockDataRow];
      const mockCount = 1;

      originalSequelize.Inventaris.findAndCountAll.mockResolvedValue({
        count: mockCount,
        rows: mockDataRows
      });
      getPaginationOptions.mockReturnValue({ limit: 10, offset: 0 });

      const res = await request(app).get('/inventaris?page=1&limit=10');

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Successfully retrieved all inventaris data');
      
      expect(res.body.data).toEqual(mockDataRows.map(r => r.toJSON()));
      expect(res.body.totalItems).toBe(mockCount);
      expect(res.body.totalPages).toBe(1);
      expect(res.body.currentPage).toBe(1);
      expect(originalSequelize.Inventaris.findAndCountAll).toHaveBeenCalledWith(expect.objectContaining({
        where: { isDeleted: false },
        include: expect.any(Array),
        order: expect.any(Array),
        distinct: true,
        limit: 10,
        offset: 0
      }));
    });

    it('should filter by kategoriId if provided and not "all"', async () => {
        getPaginationOptions.mockReturnValue({ limit: 10, offset: 0 });
        originalSequelize.Inventaris.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });
        await request(app).get('/inventaris?page=1&limit=10&kategoriId=1');
        expect(originalSequelize.Inventaris.findAndCountAll).toHaveBeenCalledWith(expect.objectContaining({
            where: { isDeleted: false, KategoriInventarisId: '1' },
        }));
    });

    it('should filter by nama if provided', async () => {
        getPaginationOptions.mockReturnValue({ limit: 10, offset: 0 });
        originalSequelize.Inventaris.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });
        await request(app).get('/inventaris?page=1&limit=10&nama=Cangkul');
        expect(originalSequelize.Inventaris.findAndCountAll).toHaveBeenCalledWith(expect.objectContaining({
            where: { isDeleted: false, nama: { [Op.like]: '%Cangkul%' } },
        }));
    });

    it('should return 200 and "Data not found" on page 1 if no data', async () => {
      originalSequelize.Inventaris.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });
      getPaginationOptions.mockReturnValue({ limit: 10, offset: 0 });

      const res = await request(app).get('/inventaris?page=1&limit=10');
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Data not found');
      expect(res.body.data).toEqual([]);
    });

    it('should return 200 and "No more data" on subsequent pages if no data', async () => {
      originalSequelize.Inventaris.findAndCountAll.mockResolvedValue({ count: 10, rows: [] });
      getPaginationOptions.mockReturnValue({ limit: 10, offset: 10 });

      const res = await request(app).get('/inventaris?page=2&limit=10');
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('No more data');
    });

    it('should return 500 when findAndCountAll throws an error', async () => {
      const errorMessage = 'DB error findAndCountAll';
      originalSequelize.Inventaris.findAndCountAll.mockRejectedValue(new Error(errorMessage));
      getPaginationOptions.mockReturnValue({ limit: 10, offset: 0 });

      const res = await request(app).get('/inventaris');
      expect(res.statusCode).toBe(500);
      expect(res.body.message).toBe(errorMessage);
    });
  });

  describe('GET /inventaris/:id', () => {
    it('should return 200 and data when found by id', async () => {
      const rawMockInventarisData = {
        id: 1, nama: 'Cangkul', stok: 10, isDeleted: false,
        createdAt: new Date(mockDateString),
        updatedAt: new Date(mockDateString),
        kategoriInventaris: mockKategori,
        Satuan: mockSatuan,
        toJSON: function() { return createPlainVersion(this); }
      };
      const mockDaftarPemakaian = [{ id: 1, jumlah: 1, inventarisNama: 'Cangkul' }];
      const mockPemakaianPerMinggu = [{ mingguKe: '202301', stokPemakaian: 5 }];

      originalSequelize.Inventaris.findOne.mockResolvedValue(rawMockInventarisData);
      originalSequelize.sequelize.query
        .mockResolvedValueOnce(mockDaftarPemakaian)
        .mockResolvedValueOnce(mockPemakaianPerMinggu);

      const res = await request(app).get('/inventaris/1');

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Successfully retrieved inventaris data');
      
      expect(res.body.data.data).toEqual(rawMockInventarisData.toJSON());
      expect(res.body.data.daftarPemakaian).toEqual(mockDaftarPemakaian);
      expect(res.body.data.pemakaianPerMinggu).toEqual(mockPemakaianPerMinggu);
      expect(originalSequelize.Inventaris.findOne).toHaveBeenCalledWith({
        where: { id: '1', isDeleted: false },
        include: expect.any(Array),
      });
      expect(originalSequelize.sequelize.query).toHaveBeenCalledTimes(2);
    });

    it('should return 404 when data not found by id', async () => {
      originalSequelize.Inventaris.findOne.mockResolvedValue(null);
      const res = await request(app).get('/inventaris/99');
      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('Data not found');
    });

    it('should return 500 when findOne throws an error', async () => {
      const errorMessage = 'DB error findOne';
      originalSequelize.Inventaris.findOne.mockRejectedValue(new Error(errorMessage));
      const res = await request(app).get('/inventaris/1');
      expect(res.statusCode).toBe(500);
      expect(res.body.message).toBe(errorMessage);
    });

     it('should return 500 when db.query for daftarPemakaian throws an error', async () => {
      const rawMockInventarisData = { id: 1, nama: 'Cangkul', isDeleted: false, toJSON: function() { return createPlainVersion(this); }};
      originalSequelize.Inventaris.findOne.mockResolvedValue(rawMockInventarisData);
      const errorMessage = 'DB error query daftarPemakaian';
      originalSequelize.sequelize.query.mockRejectedValueOnce(new Error(errorMessage));

      const res = await request(app).get('/inventaris/1');
      expect(res.statusCode).toBe(500);
      expect(res.body.message).toBe(errorMessage);
    });
  });

  describe('GET /inventaris/search/nama/:nama', () => {
    it('should return 200 and paginated data when found by name', async () => {
        const rawMockDataRow = {
            id: 1, nama: 'Cangkul Merah', stok: 5, KategoriInventarisId: 1, SatuanId: 1, isDeleted: false,
            createdAt: new Date(mockDateString),
            updatedAt: new Date(mockDateString),
            kategoriInventaris: mockKategori,
            Satuan: mockSatuan,
            toJSON: function() { return createPlainVersion(this); }
        };
        const mockDataRows = [rawMockDataRow];
        const mockCount = 1;
        originalSequelize.Inventaris.findAndCountAll.mockResolvedValue({ count: mockCount, rows: mockDataRows });
        getPaginationOptions.mockReturnValue({ limit: 10, offset: 0 });

        const res = await request(app).get('/inventaris/search/nama/Cangkul?page=1&limit=10');
        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('Successfully retrieved inventaris data');
        expect(res.body.data).toEqual(mockDataRows.map(r => r.toJSON()));
        expect(originalSequelize.Inventaris.findAndCountAll).toHaveBeenCalledWith(expect.objectContaining({
            where: { nama: { [Op.like]: '%Cangkul%' }, isDeleted: false }
        }));
    });

    it('should return 200 and "Data not found" on page 1 if no data for search', async () => {
        originalSequelize.Inventaris.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });
        getPaginationOptions.mockReturnValue({ limit: 10, offset: 0 });

        const res = await request(app).get('/inventaris/search/nama/Unknown?page=1');
        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('Data not found');
    });
  });

  describe('GET /inventaris/kategori/nama/:kategori', () => {
    it('should return 200 and data when found by kategori name', async () => {
        const rawMockDataRow = {
            id: 1, nama: 'Cangkul', KategoriInventarisId: 1, isDeleted: false,
            createdAt: new Date(mockDateString),
            updatedAt: new Date(mockDateString),
            kategoriInventaris: { id:1, nama: 'Peralatan Kebun'},
            toJSON: function() { return createPlainVersion(this); }
        };
        const mockDataRows = [rawMockDataRow];
        originalSequelize.Inventaris.findAll.mockResolvedValue(mockDataRows);

        const res = await request(app).get('/inventaris/kategori/nama/Peralatan');
        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('Successfully retrieved inventaris data');
        expect(res.body.data).toEqual(mockDataRows.map(r => r.toJSON()));
        expect(originalSequelize.Inventaris.findAll).toHaveBeenCalledWith(expect.objectContaining({
            include: [expect.objectContaining({
                as: "kategoriInventaris",
                where: { nama: { [Op.like]: '%Peralatan%' } }
            })],
            where: { isDeleted: false }
        }));
    });
     it('should return 404 if no data found by kategori name', async () => {
        originalSequelize.Inventaris.findAll.mockResolvedValue([]);
        const res = await request(app).get('/inventaris/kategori/nama/NonExistent');
        expect(res.statusCode).toBe(404);
        expect(res.body.message).toBe('Data not found');
    });
  });


  describe('POST /inventaris', () => {
    it('should return 201 when created successfully', async () => {
      const newInventarisPayload = {
        nama: 'Pupuk Urea',
        stok: 100,
        deskripsi: 'Pupuk Nitrogen',
        satuanId: 2,
        kategoriInventarisId: 2,
      };
      const mockCreatedInventaris = {
        id: 3,
        nama: newInventarisPayload.nama,
        stok: newInventarisPayload.stok,
        deskripsi: newInventarisPayload.deskripsi,
        SatuanId: newInventarisPayload.satuanId,
        KategoriInventarisId: newInventarisPayload.kategoriInventarisId,
        isDeleted: false,
        createdAt: new Date(mockDateString),
        updatedAt: new Date(mockDateString),

        toJSON: function() {
          return {
            id: this.id,
            nama: this.nama,
            stok: this.stok,
            deskripsi: this.deskripsi,
            SatuanId: this.SatuanId,
            KategoriInventarisId: this.KategoriInventarisId,
            isDeleted: this.isDeleted,
            createdAt: this.createdAt.toISOString(),
            updatedAt: this.updatedAt.toISOString(),
          };
        }
      };
      originalSequelize.Inventaris.create.mockResolvedValue(mockCreatedInventaris);

      const res = await request(app).post('/inventaris').send(newInventarisPayload);

      expect(res.statusCode).toBe(201);
      expect(res.body.message).toBe('Successfully created new inventaris data');

      expect(res.body.data).toEqual(mockCreatedInventaris.toJSON());
      expect(originalSequelize.Inventaris.create).toHaveBeenCalledWith({
        SatuanId: newInventarisPayload.satuanId,
        KategoriInventarisId: newInventarisPayload.kategoriInventarisId,
        ...newInventarisPayload
      });
    });

    it('should return 500 when create throws an error', async () => {
      const errorMessage = 'DB error create';
      originalSequelize.Inventaris.create.mockRejectedValue(new Error(errorMessage));
      const res = await request(app).post('/inventaris').send({ nama: 'Gagal' });
      expect(res.statusCode).toBe(500);
      expect(res.body.message).toBe(errorMessage);
    });
  });

  describe('PUT /inventaris/:id', () => {
    const mockId = '1';
    const updatePayload = { nama: 'Cangkul Super', stok: 15 };
    const initialDate = new Date(Date.now() - 100000);
    const updatedDate = new Date();

    const mockExistingRawInstance = {
        id: parseInt(mockId), nama: 'Cangkul Lama', stok: 10, isDeleted: false,
        createdAt: initialDate,
        updatedAt: initialDate,
        toJSON: function() { return createPlainVersion(this); }
    };

    it('should update and return 200 if data exists', async () => {
      originalSequelize.Inventaris.findOne.mockResolvedValueOnce(mockExistingRawInstance);
      originalSequelize.Inventaris.update.mockResolvedValue([1]);

      const mockUpdatedRawInstance = {
        id: parseInt(mockId),
        nama: updatePayload.nama,
        stok: updatePayload.stok,
        isDeleted: false,
        createdAt: initialDate,
        updatedAt: updatedDate,
        toJSON: function() { return createPlainVersion(this); }
      };
      originalSequelize.Inventaris.findOne.mockResolvedValueOnce(mockUpdatedRawInstance);

      const res = await request(app).put(`/inventaris/${mockId}`).send(updatePayload);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Successfully updated inventaris data');
      expect(originalSequelize.Inventaris.findOne).toHaveBeenCalledWith({ where: { id: mockId, isDeleted: false } });
      expect(originalSequelize.Inventaris.update).toHaveBeenCalledWith(updatePayload, { where: { id: mockId } });
      expect(originalSequelize.Inventaris.findOne).toHaveBeenCalledWith({ where: { id: mockId } });
      
      
      expect(res.body.data).toEqual({
        id: mockId,
        ...updatePayload,
      });
    });

    it('should return 404 if data to update not found', async () => {
      originalSequelize.Inventaris.findOne.mockResolvedValue(null);
      const res = await request(app).put(`/inventaris/99`).send(updatePayload);
      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('Data not found');
    });

    it('should return 500 when findOne (for update) throws an error', async () => {
      const errorMessage = 'DB error findOne for update';
      originalSequelize.Inventaris.findOne.mockRejectedValueOnce(new Error(errorMessage));
      const res = await request(app).put(`/inventaris/${mockId}`).send(updatePayload);
      expect(res.statusCode).toBe(500);
      expect(res.body.message).toBe(errorMessage);
    });

    it('should return 500 when Inventaris.update throws an error', async () => {
      const errorMessage = 'DB error static update';
      originalSequelize.Inventaris.findOne.mockResolvedValueOnce(mockExistingRawInstance);
      originalSequelize.Inventaris.update.mockRejectedValue(new Error(errorMessage));

      const res = await request(app).put(`/inventaris/${mockId}`).send(updatePayload);
      expect(res.statusCode).toBe(500);
      expect(res.body.message).toBe(errorMessage);
    });
  });

  describe('DELETE /inventaris/:id', () => {
    const mockId = '1';
    const mockInstanceToDelete = {
      id: parseInt(mockId), nama: 'Akan Dihapus', isDeleted: false,
      updatedAt: new Date(),
      save: jest.fn(async function() {
        this.isDeleted = true;
        this.updatedAt = new Date();
        return this;
      }),
    };

    it('should soft delete and return 200 if data exists', async () => {
      mockInstanceToDelete.isDeleted = false;
      mockInstanceToDelete.save.mockClear();
      originalSequelize.Inventaris.findOne.mockResolvedValue(mockInstanceToDelete);

      const res = await request(app).delete(`/inventaris/${mockId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Successfully deleted inventaris data');
      expect(mockInstanceToDelete.save).toHaveBeenCalledTimes(1);
      expect(mockInstanceToDelete.isDeleted).toBe(true);
    });

    it('should return 404 if data to delete not found', async () => {
      originalSequelize.Inventaris.findOne.mockResolvedValue(null);
      const res = await request(app).delete(`/inventaris/99`);
      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('Data not found');
    });

    it('should return 500 when findOne (for delete) throws an error', async () => {
      const errorMessage = 'DB error findOne for delete';
      originalSequelize.Inventaris.findOne.mockRejectedValue(new Error(errorMessage));
      const res = await request(app).delete(`/inventaris/${mockId}`);
      expect(res.statusCode).toBe(500);
      expect(res.body.message).toBe(errorMessage);
    });

    it('should return 500 when instance.save throws an error', async () => {
      const errorMessage = 'DB error instance.save on delete';
      
      const failingSaveInstance = {
          id: parseInt(mockId), nama: 'Akan Dihapus Gagal', isDeleted: false,
          save: jest.fn().mockRejectedValue(new Error(errorMessage))
      };
      originalSequelize.Inventaris.findOne.mockResolvedValue(failingSaveInstance);

      const res = await request(app).delete(`/inventaris/${mockId}`);
      expect(res.statusCode).toBe(500);
      expect(res.body.message).toBe(errorMessage);
    });
  });

  describe('GET /inventaris/riwayat/penggunaan', () => {
    const expectedRiwayatQuery = `
      SELECT 
          pi.id,
          pi.jumlah,
          pi.createdAt,
          i.id AS inventarisId,
          i.nama AS inventarisNama,
          l.userId AS userId,
          l.gambar AS laporanGambar,
          u.name AS petugasNama,
          DATE_FORMAT(l.createdAt, '%W, %d %M %Y') AS laporanTanggal,
          DATE_FORMAT(l.createdAt, '%H:%i') AS laporanWaktu
      FROM 
          penggunaanInventaris pi
      JOIN 
          inventaris i ON pi.inventarisId = i.id
      JOIN 
          laporan l ON pi.laporanId = l.id
      JOIN
          user u ON l.userId = u.id
      WHERE 
          pi.isDeleted = FALSE
          AND i.isDeleted = FALSE
      ORDER BY 
          pi.createdAt DESC;
    `;

    it('should return 200 and riwayat penggunaan data', async () => {
        const mockDaftarPemakaian = [
            { id: 1, jumlah: 2, inventarisNama: 'Cangkul', laporanTanggal: 'Wednesday, 01 May 2024' },
            { id: 2, jumlah: 1, inventarisNama: 'Pupuk', laporanTanggal: 'Tuesday, 30 April 2024' },
            { id: 3, jumlah: 5, inventarisNama: 'Sekop', laporanTanggal: 'Monday, 29 April 2024' },
            { id: 4, jumlah: 3, inventarisNama: 'Cangkul', laporanTanggal: 'Sunday, 28 April 2024' },
        ];
        originalSequelize.sequelize.query.mockResolvedValue(mockDaftarPemakaian);

        const res = await request(app).get('/inventaris/riwayat/penggunaan');

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('Data retrieved successfully');
        expect(res.body.data.daftarPemakaian).toEqual(mockDaftarPemakaian);
        expect(res.body.data.daftarPemakaianTerbaru).toEqual(mockDaftarPemakaian.slice(0, 3));
        
        const normalize = (str) => str.replace(/\s+/g, ' ').trim();
        expect(normalize(originalSequelize.sequelize.query.mock.calls[0][0])).toEqual(normalize(expectedRiwayatQuery));
        expect(originalSequelize.sequelize.query.mock.calls[0][1]).toEqual({ type: QueryTypes.SELECT });
    });

    it('should return 500 if db.query throws an error', async () => {
        const errorMessage = 'DB error fetching riwayat';
        originalSequelize.sequelize.query.mockRejectedValue(new Error(errorMessage));
        const res = await request(app).get('/inventaris/riwayat/penggunaan');
        expect(res.statusCode).toBe(500);
        expect(res.body.message).toBe('Internal server error');
    });
  });
});