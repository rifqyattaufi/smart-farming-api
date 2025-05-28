const request = require('supertest');
const express = require('express');
const { Op } = require('sequelize');

jest.mock('../../../model/index', () => {
    const ActualOpFromSequelizeLib = require('sequelize').Op;
    const mockLaporan = { findAndCountAll: jest.fn(), findOne: jest.fn() };
    
    const mockHama = {};
    const mockJenisHama = {};
    const mockUnitBudidaya = {};
    const mockObjekBudidaya = {};
    const mockUser = {};

    return {
        Laporan: mockLaporan,
        Hama: mockHama,
        JenisHama: mockJenisHama,
        UnitBudidaya: mockUnitBudidaya,
        ObjekBudidaya: mockObjekBudidaya,
        User: mockUser,
        sequelize: { /* minimal mock if needed */ },
        Sequelize: { Op: ActualOpFromSequelizeLib },
        __esModule: true,
        default: {
            Laporan: mockLaporan,
            Hama: mockHama,
            JenisHama: mockJenisHama,
            UnitBudidaya: mockUnitBudidaya,
            ObjekBudidaya: mockObjekBudidaya,
            User: mockUser,
            sequelize: { /* minimal mock if needed */ },
            Sequelize: { Op: ActualOpFromSequelizeLib },
        }
    };
});

jest.mock('../../../utils/paginationUtils', () => ({
    getPaginationOptions: jest.fn(),
}));

const laporanHamaController = require('../../../controller/farm/laporanHama');
const originalSequelize = require('../../../model/index');
const { getPaginationOptions } = require('../../../utils/paginationUtils');

const app = express();
app.use(express.json());

app.get('/laporan-hama', laporanHamaController.getAllLaporanHama);
app.get('/laporan-hama/search/:query', laporanHamaController.searchLaporanHama);
app.get('/laporan-hama/:id', laporanHamaController.getLaporanHamaById);


describe('Laporan Hama Controller', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    const mockDate = new Date();
    const mockDateString = mockDate.toISOString();

    const createPlainVersion = (instanceData) => {
        if (!instanceData) return null;
        const plain = { ...instanceData };
        delete plain.toJSON;
        if (plain.createdAt && plain.createdAt instanceof Date) plain.createdAt = plain.createdAt.toISOString();
        if (plain.updatedAt && plain.updatedAt instanceof Date) plain.updatedAt = plain.updatedAt.toISOString();
        
        if (plain.Hama && typeof plain.Hama === 'object') {
            plain.Hama = createPlainVersion(plain.Hama);
            if (plain.Hama && plain.Hama.JenisHama && typeof plain.Hama.JenisHama === 'object') {
                plain.Hama.JenisHama = createPlainVersion(plain.Hama.JenisHama);
            }
        }
        if (plain.UnitBudidaya && typeof plain.UnitBudidaya === 'object') plain.UnitBudidaya = createPlainVersion(plain.UnitBudidaya);
        if (plain.ObjekBudidaya && typeof plain.ObjekBudidaya === 'object') plain.ObjekBudidaya = createPlainVersion(plain.ObjekBudidaya);
        if (plain.User && typeof plain.User === 'object') plain.User = createPlainVersion(plain.User);
        return plain;
    };

    const mockJenisHamaData = { id: 'jh1', nama: 'Ulat Grayak', gambar: 'ulat.jpg' };
    const mockHamaData = { id: 'hama1', JenisHamaId: 'jh1', jumlah: 10, status: 'Ditangani', JenisHama: mockJenisHamaData };
    const mockUnitBudidayaData = { id: 'unit1', nama: 'Kebun Jagung Blok A' };
    const mockUserData = { id: 'user1', name: 'Petani A', avatarUrl: 'avatar.jpg' };


    describe('GET /laporan-hama', () => {
        it('should return 200 and paginated hama reports', async () => {
            const rawLaporanHama = {
                id: 'lap1', tipe: 'hama', judul: 'Serangan Ulat', isDeleted: false,
                createdAt: new Date(mockDateString), updatedAt: new Date(mockDateString),
                Hama: mockHamaData,
                UnitBudidaya: mockUnitBudidayaData,
                User: mockUserData,
                toJSON: function() { return createPlainVersion(this); }
            };
            const mockRows = [rawLaporanHama];
            const mockCount = 1;
            originalSequelize.Laporan.findAndCountAll.mockResolvedValue({ count: mockCount, rows: mockRows });
            getPaginationOptions.mockReturnValue({ limit: 10, offset: 0 });

            const res = await request(app).get('/laporan-hama?page=1&limit=10');

            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe('Successfully retrieved all hama reports');
            expect(res.body.data).toEqual(mockRows.map(r => r.toJSON()));
            expect(res.body.totalItems).toBe(mockCount);
            expect(originalSequelize.Laporan.findAndCountAll).toHaveBeenCalledWith(expect.objectContaining({
                where: { tipe: "hama", isDeleted: false },
                include: expect.arrayContaining([
                    expect.objectContaining({ model: originalSequelize.Hama, required: true }),
                    expect.objectContaining({ model: originalSequelize.UnitBudidaya }),
                    expect.objectContaining({ model: originalSequelize.User }),
                ])
            }));
        });
    });

    describe('GET /laporan-hama/search/:query', () => {
        it('should return 200 and searched hama reports', async () => {
            const searchQuery = 'Ulat';
            const rawLaporanHama = {
                id: 'lap1', tipe: 'hama', judul: 'Serangan Ulat Grayak', isDeleted: false,
                Hama: { ...mockHamaData, JenisHama: { ...mockJenisHamaData, nama: 'Ulat Grayak'} },
                UnitBudidaya: mockUnitBudidayaData, User: mockUserData,
                createdAt: new Date(mockDateString), updatedAt: new Date(mockDateString),
                toJSON: function() { return createPlainVersion(this); }
            };
            const mockRows = [rawLaporanHama];
            const mockCount = 1;
            originalSequelize.Laporan.findAndCountAll.mockResolvedValue({ count: mockCount, rows: mockRows });
            getPaginationOptions.mockReturnValue({ limit: 10, offset: 0 });

            const res = await request(app).get(`/laporan-hama/search/${searchQuery}?page=1`);

            expect(res.statusCode).toBe(200);
            expect(res.body.data).toEqual(mockRows.map(r => r.toJSON()));
            expect(originalSequelize.Laporan.findAndCountAll).toHaveBeenCalledWith(expect.objectContaining({
                where: expect.objectContaining({
                    tipe: "hama",
                    isDeleted: false,
                    [Op.or]: expect.arrayContaining([
                        expect.objectContaining({ judul: { [Op.like]: `%${searchQuery}%` } }),
                        expect.objectContaining({ catatan: { [Op.like]: `%${searchQuery}%` } }),
                        
                        expect.objectContaining({ "$JenisHama.nama$": { [Op.like]: `%${searchQuery}%` } }),
                        expect.objectContaining({ "$UnitBudidaya.nama$": { [Op.like]: `%${searchQuery}%` } }),
                        expect.objectContaining({ "$User.name$": { [Op.like]: `%${searchQuery}%` } }),
                    ]),
                })
            }));
        });
        
    });

    describe('GET /laporan-hama/:id', () => {
        it('should return 200 and the specific hama report', async () => {
            const rawLaporanHama = {
                id: 'lapDetail1', tipe: 'hama', judul: 'Detail Serangan', isDeleted: false,
                Hama: mockHamaData, UnitBudidaya: mockUnitBudidayaData, User: mockUserData,
                ObjekBudidaya: { id: 'obj1', nama: 'Tanaman Jagung 1' },
                createdAt: new Date(mockDateString), updatedAt: new Date(mockDateString),
                toJSON: function() { return createPlainVersion(this); }
            };
            originalSequelize.Laporan.findOne.mockResolvedValue(rawLaporanHama);

            const res = await request(app).get('/laporan-hama/lapDetail1');

            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe('Successfully retrieved hama report');
            expect(res.body.data).toEqual(rawLaporanHama.toJSON());
            expect(originalSequelize.Laporan.findOne).toHaveBeenCalledWith(expect.objectContaining({
                where: { id: 'lapDetail1', tipe: "hama", isDeleted: false },
                include: expect.arrayContaining([
                     expect.objectContaining({ model: originalSequelize.Hama, required: true}),
                     expect.objectContaining({ model: originalSequelize.UnitBudidaya }),
                     expect.objectContaining({ model: originalSequelize.ObjekBudidaya }),
                     expect.objectContaining({ model: originalSequelize.User }),
                ])
            }));
        });

        it('should return 404 if report not found', async () => {
            originalSequelize.Laporan.findOne.mockResolvedValue(null);
            const res = await request(app).get('/laporan-hama/unknownId');
            expect(res.statusCode).toBe(404);
            expect(res.body.message).toBe('Data not found');
        });
        
    });
});