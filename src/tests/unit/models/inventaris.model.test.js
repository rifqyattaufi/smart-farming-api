const { Sequelize, DataTypes } = require('sequelize');
const defineInventaris = require('../../../model/farm/inventaris');

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
});
