const { Sequelize, DataTypes } = require('sequelize');
const defineJenisHama = require('../../../model/farm/jenisHama');
const { isUUID } = require('validator');

describe('Jenis Hama Model', () => {
  let sequelize;
  let JenisHama;

  beforeAll(async () => {
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:',
      logging: false,
    });

    JenisHama = defineJenisHama(sequelize, DataTypes);
    const Hama = sequelize.define('Hama', {});
    JenisHama.associate({ Hama });
    await sequelize.sync();
  });

  beforeEach(async () => {
    await JenisHama.destroy({ where: {} });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it('should create jenis hama successfully with valid data', async () => {
    const jenisHama = await JenisHama.create({ nama: 'Tikus A' });
    expect(jenisHama.nama).toBe('Tikus A');
    expect(jenisHama.isDeleted).toBe(false);
  });

  it('should allow soft deleting jenis hama', async () => {
    const jenisHama = await JenisHama.create({ nama: 'Tikus B' });
    jenisHama.isDeleted = true;
    await jenisHama.save();
    const found = await JenisHama.findOne({ where: { id: jenisHama.id } });
    expect(found.isDeleted).toBe(true);
  });

  it('should set isDeleted to false by default', async () => {
    const jenisHama = await JenisHama.create({ nama: 'Ulat C' });
    expect(jenisHama.isDeleted).toBe(false);
  });

  it('should have createdAt and updatedAt fields', async () => {
    const jenisHama = await JenisHama.create({ nama: 'Ulat D' });
    expect(jenisHama.createdAt).toBeInstanceOf(Date);
    expect(jenisHama.updatedAt).toBeInstanceOf(Date);
  });

  it('should throw specific error when nama is null', async () => {
    expect.assertions(1);
    try {
      await JenisHama.create(null);
    } catch (error) {
      expect(error.message).toMatch(/notNull/);
    }
  });

  it('should allow bulk creation of jenis hama', async () => {
    const data = [
      { nama: 'Tikus F' },
      { nama: 'Ulat G' },
    ];
    const jenis = await JenisHama.bulkCreate(data);
    expect(jenis.length).toBe(2);
  });

  it('should have associations with Hama', () => {
    expect(JenisHama.associations.Hamas).toBeDefined();
  });

  it('should throw error when bulkCreate has invalid record', async () => {
    expect.assertions(1);
    const data = [
      { nama: 'Valid M' },
      { nama: null }, // invalid
      { nama: 'Valid N' },
    ];
    try {
      await JenisHama.bulkCreate(data);
    } catch (error) {
      expect(error).toBeTruthy();
    }
  });

  it('should generate a UUID for id if not provided', async () => {
    const jenisHama = await JenisHama.create({ nama: 'Tikus H' });
    expect(jenisHama.id).toBeDefined();
    expect(isUUID(jenisHama.id)).toBe(true);
  });

  it('should reject if id is null', async () => {
    expect.assertions(1);
    try {
        await JenisHama.create({ id: null, nama: 'Tikus I' });
    } catch (error) {
        expect(error.name).toBe('SequelizeValidationError');
    }
  });
});
