const { Sequelize, DataTypes } = require('sequelize');
const defineJenisBudidaya = require('../../../model/farm/jenisBudidaya');

describe('JenisBudidaya Model', () => {
  let sequelize;
  let JenisBudidaya;

  beforeAll(async () => {
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:',
      logging: false,
    });

    // dummy model yg di-associate
    const UnitBudidaya = sequelize.define('UnitBudidaya', {});
    const Komoditas = sequelize.define('Komoditas', {});

    JenisBudidaya = defineJenisBudidaya(sequelize, DataTypes);
    JenisBudidaya.associate({ UnitBudidaya, Komoditas });

    await sequelize.sync();
  });

  beforeEach(async () => {
    await JenisBudidaya.destroy({ where: {} });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it('should create JenisBudidaya with valid data', async () => {
    const jenis = await JenisBudidaya.create({
      nama: 'Tomat',
      latin: 'Solanum lycopersicum',
      tipe: 'tumbuhan',
      gambar: 'tomat.png',
      detail: 'Tanaman buah yang umum',
    });

    expect(jenis.nama).toBe('Tomat');
    expect(jenis.latin).toBe('Solanum lycopersicum');
    expect(jenis.tipe).toBe('tumbuhan');
    expect(jenis.status).toBe(true);
    expect(jenis.isDeleted).toBe(false);
  });

  it('should accept null values for optional fields', async () => {
    const jenis = await JenisBudidaya.create({ tipe: 'hewan' });
    expect(jenis.tipe).toBe('hewan');
  });

  it('should have associations defined', () => {
    expect(JenisBudidaya.associations).toBeDefined();
    expect(JenisBudidaya.associations.UnitBudidayas).toBeDefined();
    expect(JenisBudidaya.associations.Komoditas).toBeDefined();
  });
});
