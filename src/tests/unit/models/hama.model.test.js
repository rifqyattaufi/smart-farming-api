const { Sequelize, DataTypes } = require('sequelize');
const defineHama = require('../../../model/farm/hama');

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

  it('should create hama successfully with valid data', async () => {
    const hama = await Hama.create({ jumlah: 5, status: true });
    expect(hama.jumlah).toBe(5);
    expect(hama.status).toBe(true);
    expect(hama.isDeleted).toBe(false);
  });

  it('should default isDeleted to false', async () => {
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

  it('should allow bulkCreate for hama', async () => {
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

  it('should update jumlah correctly', async () => {
    const hama = await Hama.create({ jumlah: 4 });
    hama.jumlah = 10;
    await hama.save();
    const updated = await Hama.findByPk(hama.id);
    expect(updated.jumlah).toBe(10);
  });

  it('should have association with Laporan and JenisHama', () => {
    expect(Hama.associations.Laporan).toBeDefined();
    expect(Hama.associations.JenisHama).toBeDefined();
  });
});
