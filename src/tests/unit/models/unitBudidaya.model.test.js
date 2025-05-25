const { Sequelize, DataTypes } = require('sequelize');
const defineUnitBudidaya = require('../../../model/farm/unitBudidaya');

describe('UnitBudidaya Model', () => {
  let sequelize;
  let UnitBudidaya;

  beforeAll(async () => {
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:',
      logging: false,
    });
    UnitBudidaya = defineUnitBudidaya(sequelize, DataTypes);
    const JenisBudidaya = sequelize.define('JenisBudidaya', {});
    const ObjekBudidaya = sequelize.define('ObjekBudidaya', {});
    const Laporan = sequelize.define('Laporan', {});

    UnitBudidaya.associate({ JenisBudidaya, ObjekBudidaya, Laporan });

    await sequelize.sync();
  });

  beforeEach(async () => {
    await UnitBudidaya.destroy({ where: {} });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it('should create UnitBudidaya with valid fields', async () => {
    const ub = await UnitBudidaya.create({
      nama: 'Unit A',
      lokasi: 'Surabaya',
      tipe: 'kolektif',
      luas: 10.5,
      jumlah: 5,
      status: true,
      gambar: 'gambar.jpg',
      deskripsi: 'Deskripsi unit',
    });

    expect(ub.nama).toBe('Unit A');
    expect(ub.tipe).toBe('kolektif');
    expect(ub.isDeleted).toBe(false);
  });

  it('should allow null fields except id', async () => {
    const ub = await UnitBudidaya.create({});
    expect(ub).toBeDefined();
    expect(ub.isDeleted).toBe(false);
  });

  it('should default isDeleted to false', async () => {
    const ub = await UnitBudidaya.create({});
    expect(ub.isDeleted).toBe(false);
  });

  it('should support bulkCreate', async () => {
    const units = await UnitBudidaya.bulkCreate([
      { nama: 'Unit 1', tipe: 'kolektif' },
      { nama: 'Unit 2', tipe: 'individu' },
    ]);
    expect(units.length).toBe(2);
    expect(units[0].tipe).toBe('kolektif');
  });
  
  it('should have associations defined', () => {
    expect(UnitBudidaya.associations.JenisBudidaya).toBeDefined();
    expect(UnitBudidaya.associations.ObjekBudidayas).toBeDefined();
    expect(UnitBudidaya.associations.Laporans).toBeDefined();
  });
});
