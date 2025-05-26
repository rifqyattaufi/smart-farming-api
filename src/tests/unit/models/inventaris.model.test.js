const { Sequelize, DataTypes } = require('sequelize');
const defineInventaris = require('../../../model/farm/inventaris');
const { isUUID } = require('validator');

describe('Inventaris Model', () => {
  let sequelize;
  let Inventaris;

  beforeAll(async () => {
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:',
      logging: false,
    });

    const PenggunaanInventaris = sequelize.define('PenggunaanInventaris', {});
    const Vitamin = sequelize.define('Vitamin', {});
    const KategoriInventaris = sequelize.define('KategoriInventaris', {});
    const Satuan = sequelize.define('Satuan', {});

    Inventaris = defineInventaris(sequelize, DataTypes);
    Inventaris.associate({ PenggunaanInventaris, Vitamin, KategoriInventaris, Satuan });

    await sequelize.sync();
  });

  beforeEach(async () => {
    await Inventaris.destroy({ where: {} });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it('should create Inventaris with default values', async () => {
    const inventaris = await Inventaris.create({
      nama: 'Pupuk NPK',
      jumlah: 10,
      ketersediaan: 'tersedia',
      kondisi: 'baik',
    });
    expect(inventaris.nama).toBe('Pupuk NPK');
    expect(inventaris.jumlah).toBe(10);
    expect(inventaris.ketersediaan).toBe('tersedia');
    expect(inventaris.kondisi).toBe('baik');
    expect(inventaris.isDeleted).toBe(false);
  });

  it('should have associations defined', () => {
    expect(Inventaris.associations).toBeDefined();
    expect(Inventaris.associations.PenggunaanInventaris).toBeDefined();
    expect(Inventaris.associations.Vitamins).toBeDefined();
    expect(Inventaris.associations.kategoriInventaris).toBeDefined();
    expect(Inventaris.associations.Satuan).toBeDefined();
  });

  it('shoul allow soft delete', async () => {
    const inventaris = await Inventaris.create({
      nama: 'Pupuk Organik',
      jumlah: 20,
      ketersediaan: 'tersedia',
      kondisi: 'baik',
    });
    inventaris.isDeleted = true;
    await inventaris.save();
    const found = await Inventaris.findOne({ where: { id: inventaris.id } });
    expect(found.isDeleted).toBe(true);
  });

  it('should set isDeleted to false by default', async () => {
    const inventaris = await Inventaris.create({
      nama: 'Pupuk Kandang',
      jumlah: 15,
      ketersediaan: 'tersedia',
      kondisi: 'baik',
    });
    expect(inventaris.isDeleted).toBe(false);
  });

  it('should have createdAt and updatedAt fields', async () => {
    const inventaris = await Inventaris.create({
      nama: 'Pupuk Hayati',
      jumlah: 5,
      ketersediaan: 'tersedia',
      kondisi: 'baik',
    });
    expect(inventaris.createdAt).toBeInstanceOf(Date);
    expect(inventaris.updatedAt).toBeInstanceOf(Date);
  });

  it('should allow bulk creation of Inventaris', async () => {
    const data = [
      { nama: 'Pupuk Kompos', jumlah: 25, ketersediaan: 'tersedia', kondisi: 'baik' },
      { nama: 'Pupuk Hayati', jumlah: 10, ketersediaan: 'tersedia', kondisi: 'baik' },
    ];
    const result = await Inventaris.bulkCreate(data);
    expect(result.length).toBe(2);
    expect(result[0].nama).toBe('Pupuk Kompos');
    expect(result[1].nama).toBe('Pupuk Hayati');
  });

  it('should throw error on invalid bulkCreate (null in required fields)', async () => {
    expect.assertions(1);
    try {
      await Inventaris.bulkCreate([
        { nama: 'Pupuk Organik', jumlah: 30, ketersediaan: 'tersedia', kondisi: 'baik' },
        { nama: 'Vitamin A', jumlah: 20, ketersediaan: null, kondisi: 'baik' }, 
        { nama: 'Vaksin B', jumlah: 20, ketersediaan: 'tersedia', kondisi: null }, 
      ]);
    } catch (error) {
      expect(error).toBeTruthy();
    }
  });

  it('should generate UUID for primary key', async () => {
    const inventaris = await Inventaris.create({
      nama: 'Pupuk Organik',
      jumlah: 30,
      ketersediaan: 'tersedia',
      kondisi: 'baik',
    });
    expect(inventaris.id).toBeDefined();
    expect(isUUID(inventaris.id)).toBe(true);
  });

  it('should reject if id is null', async () => {
    expect.assertions(1);
    try {
        await Inventaris.create({ id: null, nama: 'Pupuk A', jumlah: 10, ketersediaan: 'tersedia', kondisi: 'baik' });
    } catch (error) {
        expect(error).toBeTruthy();
    }
  });
});
