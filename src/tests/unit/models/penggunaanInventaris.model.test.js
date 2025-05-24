const { Sequelize, DataTypes } = require('sequelize');
const definePenggunaanInventaris = require('../../../model/farm/penggunaanInventaris');

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
});
