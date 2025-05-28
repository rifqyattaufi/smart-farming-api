const request = require('supertest');
const express = require('express');
const axios = require('axios');
const dashboardController = require('../../../controller/farm/dashboard');
const dashboardInvController = require('../../../controller/farm/dashboardInv');

process.env.OPEN_WEATHER_API_KEY = 'c411d56cb6f53ecaae50f966c95d52c4';

jest.mock('axios');

jest.mock('../../../model/index', () => {
  const ActualSequelize = require('sequelize');

  const createModelMock = () => ({
    count: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    save: jest.fn(),
  });

  const mockModels = {
    ObjekBudidaya: createModelMock(),
    JenisBudidaya: createModelMock(),
    Kematian: createModelMock(),
    Panen: createModelMock(),
    UnitBudidaya: createModelMock(),
    Komoditas: createModelMock(),
    Laporan: createModelMock(),
    Inventaris: createModelMock(),
    KategoriInventaris: createModelMock(),
    PenggunaanInventaris: createModelMock(),
    Satuan: createModelMock(),
    User: createModelMock(),
  };

  const mockSequelizeInstance = {
    query: jest.fn(),
  };

  const mockSequelizeNamespace = {
    Op: ActualSequelize.Op,
    QueryTypes: ActualSequelize.QueryTypes,
    col: ActualSequelize.col,
    fn: ActualSequelize.fn,
    literal: ActualSequelize.literal,
  };

  return {
    ...mockModels,
    sequelize: mockSequelizeInstance,
    Sequelize: mockSequelizeNamespace, 
    __esModule: true,
    default: {
      ...mockModels,
      sequelize: mockSequelizeInstance,
      Sequelize: {
        Op: ActualSequelize.Op,
        QueryTypes: ActualSequelize.QueryTypes,
        col: ActualSequelize.col,
        fn: ActualSequelize.fn,
        literal: ActualSequelize.literal,
      },
    }
  };
});

const sequelize = require('../../../model/index');

const app = express();
app.use(express.json());

app.get('/dashboard/perkebunan', dashboardController.dashboardPerkebunan);
app.get('/dashboard/peternakan', dashboardController.dashboardPeternakan);
app.get('/dashboard/inventaris', dashboardInvController.dashboardInventaris);

describe('Dashboard Controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /dashboard/perkebunan', () => {
    it('should return 200 and all dashboard data for perkebunan correctly', async () => {
      axios.get.mockResolvedValue({ data: { main: { temp: 28.5 } } });

      sequelize.JenisBudidaya.count.mockResolvedValueOnce(7);
      sequelize.Kematian.count.mockResolvedValueOnce(3);
      sequelize.Panen.count.mockResolvedValueOnce(12);
      
      sequelize.sequelize.query.mockResolvedValueOnce([
        { id: 1, tipe: 'inventaris', userName: 'UserKebun A', inventarisNama: 'Pupuk Organik', createdAt: new Date().toISOString() },
        { id: 2, tipe: 'vitamin', userName: 'UserKebun B', vitaminNama: 'Vitamin Tumbuh', createdAt: new Date().toISOString() },
      ]);
      
      sequelize.UnitBudidaya.findAll.mockResolvedValueOnce([
        { id: 10, nama: 'Kebun Raya', JenisBudidaya: { tipe: 'tumbuhan' } },
        { id: 11, nama: 'Kebun Mini', JenisBudidaya: { tipe: 'tumbuhan' } },
      ]);
      sequelize.JenisBudidaya.findAll.mockResolvedValueOnce([
        { id: 20, nama: 'Padi' }, { id: 21, nama: 'Jagung' },
      ]);
      sequelize.Komoditas.findAll.mockResolvedValueOnce([
        { id: 30, nama: 'Padi Rojo Lele', JenisBudidaya: { tipe: 'tumbuhan' } },
        { id: 31, nama: 'Jagung Manis', JenisBudidaya: { tipe: 'tumbuhan' } },
      ]);

      const res = await request(app).get('/dashboard/perkebunan');

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.message).toBe('Dashboard data retrieved successfully');
      
      expect(res.body.data.suhu).toBe(29); // Math.round(28.5)
      expect(res.body.data.jenisTanaman).toBe(7);
      expect(res.body.data.jumlahKematian).toBe(3);
      expect(res.body.data.jumlahPanen).toBe(12);
      
      expect(res.body.data.aktivitasTerbaru).toHaveLength(2);
      expect(res.body.data.aktivitasTerbaru[0].judul).toBe('UserKebun A telah melaporkan penggunaan Pupuk Organik');
      expect(res.body.data.aktivitasTerbaru[1].judul).toBe('UserKebun B telah melaporkan penggunaan Vitamin Tumbuh');
      
      expect(res.body.data.daftarKebun).toHaveLength(2);
      expect(res.body.data.daftarTanaman).toHaveLength(2);
      expect(res.body.data.daftarKomoditas).toHaveLength(2);

      expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('https://api.openweathermap.org/data/2.5/weather'));
      expect(sequelize.JenisBudidaya.count).toHaveBeenCalledWith({ where: { tipe: "tumbuhan", isDeleted: false } });
      expect(sequelize.Kematian.count).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({
          isDeleted: false,
          createdAt: expect.objectContaining({ [sequelize.Sequelize.Op.gte]: expect.any(Date) }),
        }),
        include: expect.any(Array),
      }));
      expect(sequelize.Panen.count).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({
          isDeleted: false,
          createdAt: expect.objectContaining({ [sequelize.Sequelize.Op.gte]: expect.any(Date) }),
        }),
        include: expect.any(Array),
      }));
      expect(sequelize.UnitBudidaya.findAll).toHaveBeenCalledWith(expect.objectContaining({
        where: { isDeleted: false },
        order: [["createdAt", "DESC"]],
        limit: 2,
      }));
       expect(sequelize.JenisBudidaya.findAll).toHaveBeenCalledWith(expect.objectContaining({
        where: { tipe: "tumbuhan", isDeleted: false },
        order: [["createdAt", "DESC"]],
        limit: 2,
      }));
      expect(sequelize.Komoditas.findAll).toHaveBeenCalledWith(expect.objectContaining({
        where: { isDeleted: false },
        order: [["createdAt", "DESC"]],
        limit: 2,
      }));
      
      expect(sequelize.sequelize.query).toHaveBeenCalledWith(expect.stringContaining('FROM laporan l'), { type: sequelize.Sequelize.QueryTypes.SELECT });
    });

    it('should correctly format aktivitas when userName is null', async () => {
      axios.get.mockResolvedValue({ data: { main: { temp: 25 } } });
      sequelize.JenisBudidaya.count.mockResolvedValueOnce(1);
      sequelize.Kematian.count.mockResolvedValueOnce(1);
      sequelize.Panen.count.mockResolvedValueOnce(1);
      sequelize.sequelize.query.mockResolvedValueOnce([
        { id: 1, tipe: 'pemupukan', userName: null, jenisBudidayaTipe: 'Sayur', createdAt: new Date().toISOString() }
      ]);
      sequelize.UnitBudidaya.findAll.mockResolvedValueOnce([]);
      sequelize.JenisBudidaya.findAll.mockResolvedValueOnce([]);
      sequelize.Komoditas.findAll.mockResolvedValueOnce([]);

      const res = await request(app).get('/dashboard/perkebunan');
      expect(res.statusCode).toBe(200);
      expect(res.body.data.aktivitasTerbaru[0].judul).toBe('Pengguna telah melaporkan pemupukan Sayur');
    });


    it('should return 500 if OpenWeather API call fails', async () => {
  const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  axios.get.mockRejectedValue(new Error('OpenWeather API Error'));
  
  const res = await request(app).get('/dashboard/perkebunan');
  expect(res.statusCode).toBe(500);
  expect(res.body.error).toBe('Internal server error');
  consoleErrorSpy.mockRestore();
});

    it('should return 500 if any database query fails', async () => {
      axios.get.mockResolvedValue({ data: { main: { temp: 25 } } });
      sequelize.JenisBudidaya.count.mockRejectedValue(new Error('DB Error'));
      
      const res = await request(app).get('/dashboard/perkebunan');
      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBe('Internal server error');
    });
  });

  describe('GET /dashboard/peternakan', () => {
    it('should return 200 and all dashboard data for peternakan correctly', async () => {
      sequelize.ObjekBudidaya.count.mockResolvedValueOnce(50); 
      sequelize.sequelize.query
        .mockResolvedValueOnce([{ totalJumlah: '25' }])
        .mockResolvedValueOnce([
          { id: 1, tipe: 'kematian', userName: 'UserTernak A', jenisBudidayaTipe: 'Ayam', createdAt: new Date().toISOString() },
          { id: 2, tipe: 'pakan', userName: null, jenisBudidayaTipe: 'Bebek', createdAt: new Date().toISOString() },
          { id: 3, tipe: 'inventaris', userName: 'UserTernak A', inventarisNama: 'Sekop Baru', createdAt: new Date().toISOString() },
          { id: 4, tipe: 'vitamin', userName: 'UserTernak B', vitaminNama: 'Vitamin Ayam', createdAt: new Date().toISOString() },
        ]);
      sequelize.JenisBudidaya.count.mockResolvedValueOnce(4);
      sequelize.Kematian.count.mockResolvedValueOnce(2);
      sequelize.Panen.count.mockResolvedValueOnce(8);
      sequelize.UnitBudidaya.findAll.mockResolvedValueOnce([
        { id: 100, nama: 'Kandang Ayam Sentosa', JenisBudidaya: { tipe: 'hewan' } },
      ]);
      sequelize.JenisBudidaya.findAll.mockResolvedValueOnce([
        { id: 200, nama: 'Ayam Broiler Super' },
      ]);
      sequelize.Komoditas.findAll.mockResolvedValueOnce([
        { id: 300, nama: 'Telur Ayam Omega', JenisBudidaya: { tipe: 'hewan' } },
      ]);

      const res = await request(app).get('/dashboard/peternakan');

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.jumlahTernak).toBe(75);
      expect(res.body.data.jenisTernak).toBe(4);
      expect(res.body.data.jumlahKematian).toBe(2);
      expect(res.body.data.jumlahPanen).toBe(8);
      
      expect(res.body.data.aktivitasTerbaru).toHaveLength(4);
      expect(res.body.data.aktivitasTerbaru[0].judul).toBe('UserTernak A telah melaporkan kematian Ayam');
      expect(res.body.data.aktivitasTerbaru[1].judul).toBe('Pengguna telah melaporkan pakan Bebek');
      expect(res.body.data.aktivitasTerbaru[2].judul).toBe('UserTernak A telah melaporkan penggunaan Sekop Baru');
      expect(res.body.data.aktivitasTerbaru[3].judul).toBe('UserTernak B telah melaporkan penggunaan Vitamin Ayam');
      
      expect(res.body.data.daftarKandang).toHaveLength(1);
      expect(res.body.data.daftarTernak).toHaveLength(1);
      expect(res.body.data.daftarKomoditas).toHaveLength(1);

      expect(sequelize.ObjekBudidaya.count).toHaveBeenCalledTimes(1);
      expect(sequelize.sequelize.query).toHaveBeenCalledTimes(2);
      expect(sequelize.JenisBudidaya.count).toHaveBeenCalledTimes(1);
      expect(sequelize.Kematian.count).toHaveBeenCalledTimes(1);
      expect(sequelize.Panen.count).toHaveBeenCalledTimes(1);
      
    });

    it('should correctly calculate jumlahTernak when sumKolektif is empty or null', async () => {
      sequelize.ObjekBudidaya.count.mockResolvedValueOnce(30);
      sequelize.sequelize.query
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);
      sequelize.JenisBudidaya.count.mockResolvedValueOnce(0);
      sequelize.Kematian.count.mockResolvedValueOnce(0);
      sequelize.Panen.count.mockResolvedValueOnce(0);
      sequelize.UnitBudidaya.findAll.mockResolvedValueOnce([]);
      sequelize.JenisBudidaya.findAll.mockResolvedValueOnce([]);
      sequelize.Komoditas.findAll.mockResolvedValueOnce([]);

      const res = await request(app).get('/dashboard/peternakan');
      expect(res.statusCode).toBe(200);
      expect(res.body.data.jumlahTernak).toBe(30);
    });

    it('should correctly calculate jumlahTernak when sumKolektif[0].totalJumlah is null', async () => {
        sequelize.ObjekBudidaya.count.mockResolvedValueOnce(30);
        sequelize.sequelize.query
          .mockResolvedValueOnce([{ totalJumlah: null }])
          .mockResolvedValueOnce([]);
        
        sequelize.JenisBudidaya.count.mockResolvedValueOnce(0);
        sequelize.Kematian.count.mockResolvedValueOnce(0);
        sequelize.Panen.count.mockResolvedValueOnce(0);
        sequelize.UnitBudidaya.findAll.mockResolvedValueOnce([]);
        sequelize.JenisBudidaya.findAll.mockResolvedValueOnce([]);
        sequelize.Komoditas.findAll.mockResolvedValueOnce([]);
  
        const res = await request(app).get('/dashboard/peternakan');
        expect(res.statusCode).toBe(200);
        expect(res.body.data.jumlahTernak).toBe(30);
      });

    it('should return 500 if a database query fails in peternakan', async () => {
      sequelize.ObjekBudidaya.count.mockRejectedValue(new Error('DB Error'));
      
      const res = await request(app).get('/dashboard/peternakan');
      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBe('Internal server error');
    });
  });

describe('GET /dashboard/inventaris', () => {
  it('should return 200 and all inventory dashboard data correctly', async () => {
    sequelize.Inventaris.count.mockResolvedValueOnce(150); 
    sequelize.Inventaris.count.mockResolvedValueOnce(12); 
    sequelize.Inventaris.count.mockResolvedValueOnce(5);  
    sequelize.KategoriInventaris.count.mockResolvedValueOnce(10);
    sequelize.Inventaris.count.mockResolvedValueOnce(120); 

    const mockPenggunaanData = [
      { id: 1, totalJumlah: 100, get: jest.fn(function(key){ return this[key]; }) },
      { id: 2, totalJumlah: 90, get: jest.fn(function(key){ return this[key]; }) },
      { id: 3, totalJumlah: 80, get: jest.fn(function(key){ return this[key]; }) },
      { id: 4, totalJumlah: 70, get: jest.fn(function(key){ return this[key]; }) },
      { id: 5, totalJumlah: 60, get: jest.fn(function(key){ return this[key]; }) },
      { id: 6, totalJumlah: 50, get: jest.fn(function(key){ return this[key]; }) },
      { id: 7, totalJumlah: 40, get: jest.fn(function(key){ return this[key]; }) },
      { id: 8, totalJumlah: 30, get: jest.fn(function(key){ return this[key]; }) },
      { id: 9, totalJumlah: 20, get: jest.fn(function(key){ return this[key]; }) },
      { id: 10, totalJumlah: 10, get: jest.fn(function(key){ return this[key]; }) }
    ];
    sequelize.Inventaris.findAll.mockResolvedValueOnce(mockPenggunaanData);

    const mockPemakaianTerbaru = [
      { id: 101, jumlah: 2, createdAt: new Date().toISOString(), inventarisId: 1, inventarisNama: 'Obat A', userId: 1, laporanGambar: 'img.jpg', petugasNama: 'Petugas A', laporanTanggal: 'Wednesday, 28 May 2025', laporanWaktu: '10:00' },
    ];
    sequelize.sequelize.query.mockResolvedValueOnce(mockPemakaianTerbaru);


    const mockDaftarInventaris = [
      { id: 1, nama: 'Obat A', jumlah: 50, gambar: 'obat_a.jpg', satuanId: 1, lambangSatuan: 'Botol' },
    ];
    sequelize.Inventaris.findAll.mockResolvedValueOnce(mockDaftarInventaris);

    const res = await request(app).get('/dashboard/inventaris');

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('success');
    
    const data = res.body.data;
    expect(data.totalItem).toBe(150);
    expect(data.stokRendah).toBe(12);
    expect(data.itemBaru).toBe(5);
    expect(data.totalKategori).toBe(10);
    expect(data.itemTersedia).toBe(120);
    expect(data.seringDigunakanCount).toBe(2); 
    expect(data.jarangDigunakanCount).toBe(8); 
    expect(data.daftarPemakaianTerbaru).toEqual(mockPemakaianTerbaru);
    expect(data.daftarInventaris).toEqual(mockDaftarInventaris);

    expect(sequelize.Inventaris.count).toHaveBeenNthCalledWith(1, { where: { isDeleted: false } });
    expect(sequelize.Inventaris.count).toHaveBeenNthCalledWith(2, {
      where: {
        isDeleted: false,
        jumlah: { [sequelize.Sequelize.Op.lt]: sequelize.Sequelize.col("stokMinim") },
      },
    });
    expect(sequelize.Inventaris.count).toHaveBeenNthCalledWith(3, {
      where: {
        isDeleted: false,
        createdAt: { [sequelize.Sequelize.Op.gte]: expect.any(Date) },
      },
    });
    expect(sequelize.KategoriInventaris.count).toHaveBeenCalledWith({ where: { isDeleted: false } });
    expect(sequelize.Inventaris.count).toHaveBeenNthCalledWith(4, {
      where: { isDeleted: false, ketersediaan: "tersedia" },
    });

    expect(sequelize.Inventaris.findAll).toHaveBeenNthCalledWith(1, expect.objectContaining({
      attributes: ["id", [sequelize.Sequelize.fn("SUM", sequelize.Sequelize.col("penggunaanInventaris.jumlah")), "totalJumlah"]],
      group: ["Inventaris.id"],
      order: [[sequelize.Sequelize.literal("totalJumlah"), "DESC"]],
    }));

    expect(sequelize.sequelize.query).toHaveBeenCalledTimes(1);
    
    const [queryText, queryOptions] = sequelize.sequelize.query.mock.calls[0];
    expect(queryText).toMatch(/FROM\s+penggunaanInventaris\s+pi/);
    expect(queryText).toMatch(/ORDER\s+BY\s+pi\.createdAt\s+DESC/);
    expect(queryText).toMatch(/LIMIT\s+5/);

    expect(queryOptions).toEqual({ type: sequelize.Sequelize.QueryTypes.SELECT });

    expect(sequelize.Inventaris.findAll).toHaveBeenNthCalledWith(2, expect.objectContaining({
      attributes: expect.arrayContaining(["id", "nama", "jumlah", "gambar", "satuanId", [sequelize.Sequelize.col('Satuan.lambang'), 'lambangSatuan']]),
      limit: 10,
    }));
    
    expect(sequelize.Inventaris.count).toHaveBeenCalledTimes(4);
    expect(sequelize.Inventaris.findAll).toHaveBeenCalledTimes(2);
  });

  it('should return 500 if any database query fails for inventory dashboard', async () => {
    sequelize.Inventaris.count.mockRejectedValueOnce(new Error('DB Error on inventory totalItem'));
    
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const res = await request(app).get('/dashboard/inventaris');

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe('Internal server error');
    expect(console.error).toHaveBeenCalledWith("Error fetching dashboard data:", expect.any(Error));
    consoleErrorSpy.mockRestore();
  });
});
});