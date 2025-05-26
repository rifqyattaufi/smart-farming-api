const { Sequelize, DataTypes } = require('sequelize');
const defineKematian = require('../../../model/farm/kematian');
const { isUUID } = require('validator');

describe('Kematian Model', () => {
  let sequelize;
  let Kematian;

  beforeAll(async () => {
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:',
      logging: false,
    });

    const Laporan = sequelize.define('Laporan', {});

    Kematian = defineKematian(sequelize, DataTypes);
    Kematian.associate({ Laporan });

    await sequelize.sync();
  });

  beforeEach(async () => {
    await Kematian.destroy({ where: {} });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it('should create a Kematian with valid data', async () => {
    const kematian = await Kematian.create({
      tanggal: new Date(),
      penyebab: 'Penyakit menular',
    });

    expect(kematian.penyebab).toBe('Penyakit menular');
    expect(kematian.isDeleted).toBe(false);
  });

  it('should set isDeleted to false by default', async () => {
    const kematian = await Kematian.create({
      tanggal: new Date(),
      penyebab: 'Cuaca ekstrem',
    });

    expect(kematian.isDeleted).toBe(false);
  });

  it('should throw error if tanggal is null', async () => {
    expect.assertions(1);
    try {
      await Kematian.create({ penyebab: 'Infeksi' });
    } catch (err) {
      expect(err.message).toMatch(/notNull/);
    }
  });

  it('should throw error if penyebab is null', async () => {
    expect.assertions(1);
    try {
      await Kematian.create({ tanggal: new Date() });
    } catch (err) {
      expect(err.message).toMatch(/notNull/);
    }
  });

  it('should support soft delete by setting isDeleted = true', async () => {
    const kematian = await Kematian.create({
      tanggal: new Date(),
      penyebab: 'Keracunan',
    });
    kematian.isDeleted = true;
    await kematian.save();

    const updated = await Kematian.findByPk(kematian.id);
    expect(updated.isDeleted).toBe(true);
  });

  it('should define association with Laporan', () => {
    expect(Kematian.associations.Laporan).toBeDefined();
  });

  it('should support bulkCreate with valid data', async () => {
    const data = [
        { tanggal: new Date(), penyebab: 'Sakit' },
        { tanggal: new Date(), penyebab: 'Hama' },
    ];

    const result = await Kematian.bulkCreate(data);
    expect(result.length).toBe(2);
  });

  it('should throw error on invalid bulkCreate (null in required fields)', async () => {
    expect.assertions(1);
    try {
        await Kematian.bulkCreate([
        { tanggal: new Date(), penyebab: 'Sakit' },    
        { penyebab: 'Luka' }, // tanggal null
        ]);
    } catch (err) {
        expect(err).toBeTruthy();
    }
  });

  it('should generate UUID for primary key', async () => {
    const kematian = await Kematian.create({
      tanggal: new Date(),
      penyebab: 'Sakit',
    });
    expect(kematian.id).toBeDefined();
    expect(isUUID(kematian.id)).toBe(true);
  });

  it('should reject if id is null', async () => {
    expect.assertions(1);
    try {
      await Kematian.create({ id: null, tanggal: new Date(), penyebab: 'Tanpa ID' });
    } catch (error) {
      expect(error.name).toBeTruthy();
    }
  });

  it('should have createdAt and updatedAt fields', async () => {
    const kematian = await Kematian.create({
      tanggal: new Date(),
      penyebab: 'Sakit',
    });
    expect(kematian.createdAt).toBeInstanceOf(Date);
    expect(kematian.updatedAt).toBeInstanceOf(Date);
  });
});
