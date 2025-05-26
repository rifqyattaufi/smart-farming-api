const { Sequelize, DataTypes } = require('sequelize');
const defineHama = require('../../../model/farm/hama');
const { isUUID } = require('validator');

describe('Hama Model', () => {
  let sequelize;
  let Hama;
  let Laporan;
  let JenisHama;

  beforeAll(async () => {
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:',
      logging: false,
    });

    Laporan = sequelize.define('Laporan', {});
    JenisHama = sequelize.define('JenisHama', {});

    Hama = defineHama(sequelize, DataTypes);
    Hama.associate({ Laporan, JenisHama });

    await sequelize.sync();
  });

  beforeEach(async () => {
    await Hama.destroy({ where: {} });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it('should create model instance with valid data', async () => {
    const hama = await Hama.create({ jumlah: 5, status: true });
    expect(hama.jumlah).toBe(5);
    expect(hama.status).toBe(true);
    expect(hama.isDeleted).toBe(false);
  });

  it('should set isDeleted to false by default', async () => {
    const hama = await Hama.create({ jumlah: 5, status: true });
    expect(hama.isDeleted).toBe(false);
  });

  it('should support soft deletion by setting isDeleted = true', async () => {
    const hama = await Hama.create({ jumlah: 10, status: false });
    hama.isDeleted = true;
    await hama.save();
    const found = await Hama.findByPk(hama.id);
    expect(found.isDeleted).toBe(true);
  });

  it('should have createdAt and updatedAt fields', async () => {
    const hama = await Hama.create({ jumlah: 3 });
    expect(hama.createdAt).toBeInstanceOf(Date);
    expect(hama.updatedAt).toBeInstanceOf(Date);
  });

  it('should allow bulk creation of records', async () => {
    const data = [
      { jumlah: 1, status: true },
      { jumlah: 2, status: false },
    ];
    const hasil = await Hama.bulkCreate(data);
    expect(hasil.length).toBe(2);
  });

  it('should throw error on invalid bulkCreate (null in required fields)', async () => {
    expect.assertions(1);
    try {
        await Hama.bulkCreate([
        { jumlah: 10, status: true },
        { jumlah: null, status: false }, // invalid karena jumlah null
        ]);
    } catch (error) {
        expect(error).toBeTruthy();
    }
  });

  it('should generate a UUID for id if not provided', async () => {
    const hama = await Hama.create({ jumlah: 4, status: true });
    expect(hama.id).toBeDefined();
    expect(isUUID(hama.id)).toBe(true);
  });

  it('should reject if jumlah is not provided', async () => {
    expect.assertions(1);
    try {
      await Hama.create({ status: true });
    } catch (error) {
      expect(error.name).toBe('SequelizeValidationError');
    }
  });

  it('should allow status to be true or false', async () => {
    const hamaTrue = await Hama.create({ jumlah: 1, status: true });
    expect(hamaTrue.status).toBe(true);

    const hamaFalse = await Hama.create({ jumlah: 2, status: false });
    expect(hamaFalse.status).toBe(false);
  });

  it('should reject if id is null', async () => {
    expect.assertions(1);
    try {
      await Hama.create({ id: null, jumlah: 5, status: true });
    } catch (error) {
      expect(error.name).toBe('SequelizeValidationError');
    }
  });

  it('should have association with Laporan and JenisHama', () => {
    expect(Hama.associations.Laporan).toBeDefined();
    expect(Hama.associations.JenisHama).toBeDefined();
  });
});
