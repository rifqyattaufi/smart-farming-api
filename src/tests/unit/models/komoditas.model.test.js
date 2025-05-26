const { Sequelize, DataTypes } = require('sequelize');
const defineKomoditas = require('../../../model/farm/komoditas');
const { isUUID } = require('validator');

describe('Komoditas Model', () => {
  let sequelize;
  let Komoditas;

  beforeAll(async () => {
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:',
      logging: false,
    });

    const Panen = sequelize.define('Panen', {});
    const Satuan = sequelize.define('Satuan', {});
    const JenisBudidaya = sequelize.define('JenisBudidaya', {});

    Komoditas = defineKomoditas(sequelize, DataTypes);
    Komoditas.associate({ Panen, Satuan, JenisBudidaya });

    await sequelize.sync();
  });

  beforeEach(async () => {
    await Komoditas.destroy({ where: {} });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it('should create a komoditas with valid data', async () => {
    const komoditas = await Komoditas.create({
      nama: 'Bayam',
      jumlah: 100.5,
    });
    expect(komoditas.nama).toBe('Bayam');
    expect(komoditas.jumlah).toBeCloseTo(100.5);
    expect(komoditas.isDeleted).toBe(false);
  });

  it('should set isDeleted to false by default', async () => {
    const komoditas = await Komoditas.create({
      nama: 'Cabai',
      jumlah: 200,
    });
    expect(komoditas.isDeleted).toBe(false);
  });

  it('should allow soft delete (setting isDeleted = true)', async () => {
    const komoditas = await Komoditas.create({
      nama: 'Tomat',
      jumlah: 50,
    });
    komoditas.isDeleted = true;
    await komoditas.save();
    const found = await Komoditas.findByPk(komoditas.id);
    expect(found.isDeleted).toBe(true);
  });

  it('should include createdAt and updatedAt timestamps', async () => {
    const komoditas = await Komoditas.create({
      nama: 'Sawi',
      jumlah: 30,
    });
    expect(komoditas.createdAt).toBeInstanceOf(Date);
    expect(komoditas.updatedAt).toBeInstanceOf(Date);
  });

  it('should throw error when nama is null', async () => {
    expect.assertions(1);
    try {
      await Komoditas.create({ jumlah: 10 });
    } catch (err) {
      expect(err.message).toMatch(/notNull/);
    }
  });

  it('should throw error when jumlah is null', async () => {
    expect.assertions(1);
    try {
      await Komoditas.create({ nama: 'Wortel' });
    } catch (err) {
      expect(err.message).toMatch(/notNull/);
    }
  });

  it('should allow bulkCreate for valid komoditas entries', async () => {
    const data = [
      { nama: 'Jagung', jumlah: 100 },
      { nama: 'Kacang', jumlah: 50 },
    ];
    const komoditas = await Komoditas.bulkCreate(data);
    expect(komoditas.length).toBe(2);
  });

  it('should throw error on invalid bulkCreate (null in required fields)', async () => {
    expect.assertions(1);
    try {
      await Komoditas.bulkCreate([
        { nama: 'Bayam', jumlah: 10 },
        { nama: null, jumlah: 20 }, // invalid
      ]);
    } catch (err) {
      expect(err).toBeTruthy();
    }
  });

  it('should have associations defined', () => {
    expect(Komoditas.associations.Panens).toBeDefined();
    expect(Komoditas.associations.Satuan).toBeDefined();
    expect(Komoditas.associations.JenisBudidaya).toBeDefined();
  });

  it('should generate UUID for primary key', async () => {
    const komoditas = await Komoditas.create({
      nama: 'Bawang Merah',
      jumlah: 75,
    });
    expect(komoditas.id).toBeDefined();
    expect(isUUID(komoditas.id)).toBe(true);
  });

  it('should reject if id is null', async () => {
    expect.assertions(1);
    try {
      await Komoditas.create({ id: null, nama: 'Bawang Putih', jumlah: 20 });
    } catch (error) {
      expect(error).toBeTruthy();
    }
  });



});
