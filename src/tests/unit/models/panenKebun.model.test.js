const { Sequelize, DataTypes } = require('sequelize');
const definePanenKebun = require('../../../model/farm/panenKebun');
const { isUUID } = require('validator');

describe('Panen Kebun Model', () => {
  let sequelize;
  let PanenKebun;

  beforeAll(async () => {
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:',
      logging: false,
    });

    const Komoditas = sequelize.define('Komoditas', {});
    const Laporan = sequelize.define('Laporan', {});
    const PanenRincianGrade = sequelize.define('PanenRincianGrade', {});

    PanenKebun = definePanenKebun(sequelize, DataTypes);
    PanenKebun.associate({ Komoditas, Laporan, PanenRincianGrade });

    await sequelize.sync();
  });

  beforeEach(async () => {
    await PanenKebun.destroy({ where: {} });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it('should create model instance with valid data', async () => {
    const panen = await PanenKebun.create({ tanggalPanen: new Date(), estimasiPanen: 100, realisasiPanen: 95, gagalPanen: 5, umurTanamanPanen: 30 });
    expect(panen.tanggalPanen).toBeInstanceOf(Date);
    expect(panen.estimasiPanen).toBe(100);
    expect(panen.realisasiPanen).toBe(95);
    expect(panen.gagalPanen).toBe(5);
    expect(panen.umurTanamanPanen).toBe(30);
    expect(panen.isDeleted).toBe(false);    
  });

  it('should have associations defined', () => {
    expect(PanenKebun.associations).toBeDefined();
    expect(PanenKebun.associations.Komodita).toBeDefined();
    expect(PanenKebun.associations.Laporan).toBeDefined();
    expect(PanenKebun.associations.PanenRincianGrades).toBeDefined();
  });

  it('should allow soft deletion', async () => {
    const panen = await PanenKebun.create({ tanggalPanen: new Date(), estimasiPanen: 100, realisasiPanen: 95, gagalPanen: 5, umurTanamanPanen: 30 });
    panen.isDeleted = true;
    await panen.save();
    const found = await PanenKebun.findOne({ where: { id: panen.id } });
    expect(found.isDeleted).toBe(true);
  });

  it('should set isDeleted to false by default', async () => {
    const panen = await PanenKebun.create({ tanggalPanen: new Date(), estimasiPanen: 100, realisasiPanen: 95, gagalPanen: 5, umurTanamanPanen: 30 });
    expect(panen.isDeleted).toBe(false);
  });

  it('should have createdAt and updatedAt fields', async () => {
    const panen = await PanenKebun.create({ tanggalPanen: new Date(), estimasiPanen: 100, realisasiPanen: 95, gagalPanen: 5, umurTanamanPanen: 30 });
    expect(panen.createdAt).toBeInstanceOf(Date);
    expect(panen.updatedAt).toBeInstanceOf(Date);
  });

  it('should allow bulk creation of records', async () => {
    const data = [
        { tanggalPanen: new Date(), estimasiPanen: 100, realisasiPanen: 95, gagalPanen: 5, umurTanamanPanen: 30 },
        { tanggalPanen: new Date(), estimasiPanen: 200, realisasiPanen: 180, gagalPanen: 20, umurTanamanPanen: 40 }
    ];
    const panens = await PanenKebun.bulkCreate(data);
    expect(panens.length).toBe(2);
    expect(panens[0].estimasiPanen).toBe(100);
    expect(panens[1].estimasiPanen).toBe(200);
    expect(panens[0].realisasiPanen).toBe(95);
    expect(panens[1].realisasiPanen).toBe(180);
    expect(panens[0].gagalPanen).toBe(5);
    expect(panens[1].gagalPanen).toBe(20);
    expect(panens[0].umurTanamanPanen).toBe(30);
    expect(panens[1].umurTanamanPanen).toBe(40);
  });

  it('should generate UUID for primary key', async () => {
    const panen = await PanenKebun.create({ tanggalPanen: new Date(), estimasiPanen: 100, realisasiPanen: 95, gagalPanen: 5, umurTanamanPanen: 30 });
    expect(panen.id).toBeDefined();
    expect(isUUID(panen.id)).toBe(true);
  });

  it('should reject if id is null', async () => {
    expect.assertions(1);
    try {
      await PanenKebun.create({ id: null, tanggalPanen: new Date(), estimasiPanen: 100, realisasiPanen: 95, gagalPanen: 5, umurTanamanPanen: 30 });
    } catch (error) {
      expect(error).toBeTruthy();
    }
  });
  
  it('should throw error if tanggalPanen is null', async () => {
    expect.assertions(1);
    try {
      await PanenKebun.create({ estimasiPanen: 100, realisasiPanen: 95, gagalPanen: 5, umurTanamanPanen: 30 });
    } catch (error) {
      expect(error.message).toMatch(/notNull/);
    }
  });

  it('should not allow creating PanenKebun with negative estimasiPanen', async () => {
    expect.assertions(1);
    try {
      await PanenKebun.create({ tanggalPanen: new Date(), estimasiPanen: -100, realisasiPanen: 95, gagalPanen: 5, umurTanamanPanen: 30 });
    } catch (error) {
      expect(error).toBeTruthy();
    }
  });

  it('should not allow creating PanenKebun with negative realisasiPanen', async () => {
    expect.assertions(1);
    try {
      await PanenKebun.create({ tanggalPanen: new Date(), estimasiPanen: 100, realisasiPanen: -95, gagalPanen: 5, umurTanamanPanen: 30 });
    } catch (error) {
      expect(error).toBeTruthy();
    }
  });

  it('should not allow creating PanenKebun with negative gagalPanen', async () => {
    expect.assertions(1);
    try {
      await PanenKebun.create({ tanggalPanen: new Date(), estimasiPanen: 100, realisasiPanen: 95, gagalPanen: -5, umurTanamanPanen: 30 });
    } catch (error) {
      expect(error).toBeTruthy();
    }
  });

  it('should not allow creating PanenKebun with negative umurTanamanPanen', async () => {
    expect.assertions(1);
    try {
      await PanenKebun.create({ tanggalPanen: new Date(), estimasiPanen: 100, realisasiPanen: 95, gagalPanen: 5, umurTanamanPanen: -30 });
    } catch (error) {
      expect(error).toBeTruthy();
    }
  });

  it('should throw error on invalid bulkCreate (null in required fields)', async () => {
    expect.assertions(1);
    try {
      await PanenKebun.bulkCreate([
        { tanggalPanen: new Date(), estimasiPanen: 100, realisasiPanen: 95, gagalPanen: 5, umurTanamanPanen: 30 },
        { tanggalPanen: null, estimasiPanen: 200, realisasiPanen: 180, gagalPanen: 20, umurTanamanPanen: 40 }, // invalid karena tanggalPanen null
      ]);
    } catch (error) {
      expect(error).toBeTruthy();
    }
  });
});
