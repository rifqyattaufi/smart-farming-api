const { Sequelize, DataTypes } = require('sequelize');
const definePenggunaanInventaris = require('../../../model/farm/penggunaanInventaris');
const { isUUID } = require('validator');

describe('PenggunaanInventaris Model', () => {
  let sequelize;
  let PenggunaanInventaris;

  beforeAll(async () => {
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:',
      logging: false,
    });

    PenggunaanInventaris = definePenggunaanInventaris(sequelize, DataTypes);
    const Inventaris = sequelize.define('Inventaris', {});
    const Laporan = sequelize.define('Laporan', {});

    PenggunaanInventaris.associate({ Inventaris, Laporan });

    await sequelize.sync();
  });

  beforeEach(async () => {
    await PenggunaanInventaris.destroy({ where: {} });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it('should create penggunaan inventaris with valid data', async () => {
    const penggunaan = await PenggunaanInventaris.create({ jumlah: 15 });
    expect(penggunaan.jumlah).toBe(15);
    expect(penggunaan.isDeleted).toBe(false);
  });

  it('should default isDeleted to false', async () => {
    const penggunaan = await PenggunaanInventaris.create({ jumlah: 10 });
    expect(penggunaan.isDeleted).toBe(false);
  });

  it('should throw error if jumlah is null', async () => {
    expect.assertions(1);
    try {
      await PenggunaanInventaris.create({});
    } catch (error) {
      expect(error.message).toMatch(/notNull/);
    }
  });

  it('should support bulkCreate', async () => {
    const bulk = await PenggunaanInventaris.bulkCreate([{ jumlah: 1 }, { jumlah: 2 }]);
    expect(bulk.length).toBe(2);
  });

  it('should throw error on invalid bulkCreate', async () => {
    expect.assertions(1);
    try {
      await PenggunaanInventaris.bulkCreate([{ jumlah: null }]);
    } catch (error) {
      expect(error).toBeTruthy();
    }
  });

  it('should have associations defined', () => {
    expect(PenggunaanInventaris.associations.Inventari).toBeDefined();
    expect(PenggunaanInventaris.associations.Laporan).toBeDefined();
  });

  it('should allow soft delete by setting isDeleted = true', async () => {
    const penggunaan = await PenggunaanInventaris.create({ jumlah: 20 });
    penggunaan.isDeleted = true;
    await penggunaan.save();

    const found = await PenggunaanInventaris.findOne({ where: { id: penggunaan.id } });
    expect(found.isDeleted).toBe(true);
  });

  it('should generate UUID for primary key', async () => {
    const penggunaan = await PenggunaanInventaris.create({ jumlah: 30 });
    expect(penggunaan.id).toBeDefined();
    expect(isUUID(penggunaan.id)).toBe(true);
  });

  it('should have createdAt and updatedAt fields', async () => {
    const penggunaan = await PenggunaanInventaris.create({ jumlah: 25 });
    expect(penggunaan.createdAt).toBeInstanceOf(Date);
    expect(penggunaan.updatedAt).toBeInstanceOf(Date);
  });

  it('should reject if id is null', async () => {
    expect.assertions(1);
    try {
      await PenggunaanInventaris.create({ id: null, jumlah: 5 });
    } catch (error) {
      expect(error.name).toBeTruthy();
    }
  });
});
