const { Sequelize, DataTypes } = require('sequelize');
const defineLaporan = require('../../../model/farm/laporan');
const { isUUID } = require('validator');

describe('Laporan Model', () => {
  let sequelize;
  let Laporan;

  beforeAll(async () => {
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:',
      logging: false,
    });

    Laporan = defineLaporan(sequelize, DataTypes);
    const User = sequelize.define('User', {});
    const UnitBudidaya = sequelize.define('UnitBudidaya', {});
    const ObjekBudidaya = sequelize.define('ObjekBudidaya', {});
    const PenggunaanInventaris = sequelize.define('PenggunaanInventaris', {});
    const HarianTernak = sequelize.define('HarianTernak', {});
    const HarianKebun = sequelize.define('HarianKebun', {});
    const Kematian = sequelize.define('Kematian', {});
    const Vitamin = sequelize.define('Vitamin', {});
    const Panen = sequelize.define('Panen', {});
    const Sakit = sequelize.define('Sakit', {});
    const Hama = sequelize.define('Hama', {});

    Laporan.associate({ User, UnitBudidaya, ObjekBudidaya, PenggunaanInventaris, HarianTernak, HarianKebun, Kematian, Vitamin, Panen, Sakit, Hama });

    await sequelize.sync();
  });

  beforeEach(async () => {
    await Laporan.destroy({ where: {} });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it('should create laporan with valid data', async () => {
    const laporan = await Laporan.create({ judul: 'Laporan 1', tipe: 'harian' });
    expect(laporan.judul).toBe('Laporan 1');
    expect(laporan.tipe).toBe('harian');
    expect(laporan.isDeleted).toBe(false);
  });

  it('should default isDeleted to false', async () => {
    const laporan = await Laporan.create({ judul: 'Laporan 2' });
    expect(laporan.isDeleted).toBe(false);
  });

  it('should allow null tipe and judul', async () => {
    const laporan = await Laporan.create({});
    expect(laporan).toBeDefined();
  });

  it('should support bulkCreate', async () => {
    const bulk = await Laporan.bulkCreate([
      { judul: 'Laporan Bulk 1', tipe: 'panen' },
      { judul: 'Laporan Bulk 2', tipe: 'vitamin' },
    ]);
    expect(bulk.length).toBe(2);
    expect(bulk[1].tipe).toBe('vitamin');
  });

  it('should have associations defined', () => {
    expect(Laporan.associations.User).toBeDefined();
    expect(Laporan.associations.UnitBudidaya).toBeDefined();
    expect(Laporan.associations.ObjekBudidaya).toBeDefined();
    expect(Laporan.associations.PenggunaanInventari).toBeDefined();
    expect(Laporan.associations.HarianTernak).toBeDefined();
    expect(Laporan.associations.HarianKebun).toBeDefined();
    expect(Laporan.associations.Kematian).toBeDefined();
    expect(Laporan.associations.Vitamin).toBeDefined();
    expect(Laporan.associations.Panen).toBeDefined();
    expect(Laporan.associations.Sakit).toBeDefined();
    expect(Laporan.associations.Hama).toBeDefined();
  });  

  it('should allow soft deletion', async () => {
    const laporan = await Laporan.create({ judul: 'Laporan Soft Delete', tipe: 'harian' });
    laporan.isDeleted = true;
    await laporan.save();
    const found = await Laporan.findOne({ where: { id: laporan.id } });
    expect(found.isDeleted).toBe(true);
  });

  it('should set isDeleted to false by default', async () => {
    const laporan = await Laporan.create({ judul: 'Laporan Default' });
    expect(laporan.isDeleted).toBe(false);
  });

  it('should generate UUID for primary key', async () => {
    const laporan = await Laporan.create({ judul: 'Laporan UUID', tipe: 'harian' });
    expect(laporan.id).toBeDefined();
    expect(isUUID(laporan.id)).toBe(true);
  });

  it('should throw error if id is null', async () => {
    expect.assertions(1);
    try {
      await Laporan.create({ id: null, judul: 'Laporan Null ID' });
    } catch (error) {
      expect(error.name).toBeTruthy();
    }
  });

  it('should have createdAt and updatedAt fields', async () => {
    const laporan = await Laporan.create({ judul: 'Laporan Timestamp' });
    expect(laporan.createdAt).toBeInstanceOf(Date);
    expect(laporan.updatedAt).toBeInstanceOf(Date);
  });

});
