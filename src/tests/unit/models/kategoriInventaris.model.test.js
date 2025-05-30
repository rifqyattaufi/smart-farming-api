const { Sequelize, DataTypes } = require('sequelize');
const defineKategoriInventaris = require('../../../model/farm/kategoriInventaris');
const { isUUID } = require('validator');

describe('Kategori Inventaris Model', () => {
  let sequelize;
  let KategoriInventaris;

  beforeAll(async () => {
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:',
      logging: false,
    });

    KategoriInventaris = defineKategoriInventaris(sequelize, DataTypes);
    const Inventaris = sequelize.define('Inventaris', {});
    KategoriInventaris.associate({ Inventaris });
    await sequelize.sync();
  });

  beforeEach(async () => {
    await KategoriInventaris.destroy({ where: {} });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it('should create kategori inventaris successfully with valid data', async () => {
    const kategoriInventaris = await KategoriInventaris.create({ nama: 'Pupuk A' });
    expect(kategoriInventaris.nama).toBe('Pupuk A');
    expect(kategoriInventaris.isDeleted).toBe(false);
  });

  it('should allow soft deleting kategori inventaris', async () => {
    const kategoriInventaris = await KategoriInventaris.create({ nama: 'Pupuk B' });
    kategoriInventaris.isDeleted = true;
    await kategoriInventaris.save();
    const found = await KategoriInventaris.findOne({ where: { id: kategoriInventaris.id } });
    expect(found.isDeleted).toBe(true);
  });

  it('should set isDeleted to false by default', async () => {
    const kategoriInventaris = await KategoriInventaris.create({ nama: 'Vaksin C' });
    expect(kategoriInventaris.isDeleted).toBe(false);
  });

  it('should have createdAt and updatedAt fields', async () => {
    const kategoriInventaris = await KategoriInventaris.create({ nama: 'Vitamin D' });
    expect(kategoriInventaris.createdAt).toBeInstanceOf(Date);
    expect(kategoriInventaris.updatedAt).toBeInstanceOf(Date);
  });

  it('should throw specific error when nama is null', async () => {
    expect.assertions(1);
    try {
      await KategoriInventaris.create(null);
    } catch (error) {
      expect(error.message).toMatch(/notNull/);
    }
  });

  it('should allow bulk creation of kategori inventaris', async () => {
    const data = [
      { nama: 'Pupuk F' },
      { nama: 'Pakan G' },
      { nama: 'Vitamin H' },
      { nama: 'Vaksin I' }
    ];
    const kategoris = await KategoriInventaris.bulkCreate(data);
    expect(kategoris.length).toBe(4);
  });

  it('should have associations with Inventaris', () => {
    expect(KategoriInventaris.associations.Inventaris).toBeDefined();
  });

  it('should throw error when bulkCreate has invalid record', async () => {
    expect.assertions(1);
    const data = [
      { nama: 'Valid M' },
      { nama: null }, // invalid
      { nama: 'Valid N' },
    ];
    try {
      await KategoriInventaris.bulkCreate(data);
    } catch (error) {
      expect(error).toBeTruthy();
    }
  });

  it('should generate a UUID for id if not provided', async () => {
    const kategoriInventaris = await KategoriInventaris.create({ nama: 'Pupuk J' });
    expect(kategoriInventaris.id).toBeDefined();
    expect(isUUID(kategoriInventaris.id)).toBe(true);
  });

  it('should reject if id is null', async () => {
    expect.assertions(1);
    try {
        await KategoriInventaris.create({ id: null, nama: 'Pupuk K' });
    } catch (error) {
        expect(error.name).toBe('SequelizeValidationError');
    }
  });
});
