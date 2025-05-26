const { Sequelize, DataTypes } = require('sequelize');
const defineJenisBudidaya = require('../../../model/farm/jenisBudidaya');
const { isUUID } = require('validator');

describe('JenisBudidaya Model', () => {
  let sequelize;
  let JenisBudidaya;

  beforeAll(async () => {
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:',
      logging: false,
    });

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

  it('should create model instance with valid data', async () => {
    const jenis = await JenisBudidaya.create({
      nama: 'Melon',
      latin: 'Cucumis melo',
      tipe: 'tumbuhan',
      gambar: 'melon.png',
      detail: 'Tanaman buah yang umum',
    });

    expect(jenis.nama).toBe('Melon');
    expect(jenis.latin).toBe('Cucumis melo');
    expect(jenis.tipe).toBe('tumbuhan');
    expect(jenis.status).toBe(true);
    expect(jenis.isDeleted).toBe(false);
  });

  it('should set status to true by default', async () => {
    const jenis = await JenisBudidaya.create({ nama: 'Melon', latin: 'Cucumis melo', tipe: 'tumbuhan' });
    expect(jenis.status).toBe(true);
  });

  it('should set isDeleted to false by default', async () => {
    const jenis = await JenisBudidaya.create({ nama: 'Melon', latin: 'Cucumis melo', tipe: 'tumbuhan' });
    expect(jenis.isDeleted).toBe(false);
  });

  it('should support soft deletion by setting isDeleted = true', async () => {
    const jenis = await JenisBudidaya.create({ nama: 'Melon', latin: 'Cucumis melo', tipe: 'tumbuhan' });
    jenis.isDeleted = true;
    await jenis.save();
    const found = await JenisBudidaya.findByPk(jenis.id);
    expect(found.isDeleted).toBe(true);
  });

  it('should have createdAt and updatedAt fields', async () => {
    const jenis = await JenisBudidaya.create({ nama: 'Melon', latin: 'Cucumis melo', tipe: 'tumbuhan' });
    expect(jenis.createdAt).toBeInstanceOf(Date);
    expect(jenis.updatedAt).toBeInstanceOf(Date);
  });

  it('should generate a UUID for id if not provided', async () => {
    const jenis = await JenisBudidaya.create({ nama: 'Melon', latin: 'Cucumis melo', tipe: 'tumbuhan' });
    expect(jenis.id).toBeDefined();
    expect(isUUID(jenis.id)).toBe(true);
  });

  it('should reject if tipe is not hewan or tumbuhan', async () => {
    expect.assertions(1);
    try {
      await JenisBudidaya.create({ nama: 'Melon', latin: 'Cucumis melo', tipe: 'invalid' });
    } catch (error) {
      expect(error.name).toBe('SequelizeValidationError');
    }
  });

  it('should allow tipe to be hewan', async () => {
    const jenis = await JenisBudidaya.create({ nama: 'Ayam', latin: 'Gallus gallus', tipe: 'hewan' });
    expect(jenis.tipe).toBe('hewan');
  });

  it('should allow tipe to be tumbuhan', async () => {
    const jenis = await JenisBudidaya.create({ nama: 'Padi', latin: 'Oryza sativa', tipe: 'tumbuhan' });
    expect(jenis.tipe).toBe('tumbuhan');
  });

  it('should reject if id is null', async () => {
    expect.assertions(1);
    try {
      await JenisBudidaya.create({ id: null, nama: 'Melon', latin: 'Cucumis melo', tipe: 'tumbuhan' });
    } catch (error) {
      expect(error.name).toBe('SequelizeValidationError');
    }
  });

  it('should not allow duplicate id values (only if not using UUID default)', async () => {
    expect.assertions(1);
    try {
      const jenis1 = await JenisBudidaya.create({ nama: 'Melon', latin: 'Cucumis melo', tipe: 'tumbuhan' });
      await JenisBudidaya.create({ id: jenis1.id, nama: 'Padi', latin: 'Oryza sativa', tipe: 'tumbuhan' });
    } catch (error) {
      expect(error.name).toBe('SequelizeUniqueConstraintError');
    }
  });
  
  it('should have associations defined', () => {
    expect(JenisBudidaya.associations).toBeDefined();
    expect(JenisBudidaya.associations.UnitBudidayas).toBeDefined();
    expect(JenisBudidaya.associations.Komoditas).toBeDefined();
  });

  it('should allow bulk creation of records', async () => {
    const jenisData = [
      { nama: 'Melon', latin: 'Cucumis melo', tipe: 'tumbuhan' },
      { nama: 'Ayam', latin: 'Gallus gallus', tipe: 'hewan' },
    ];
    const jenisList = await JenisBudidaya.bulkCreate(jenisData);
    expect(jenisList.length).toBe(2);
    expect(jenisList[0].nama).toBe('Melon');
    expect(jenisList[1].nama).toBe('Ayam');
  });
});
