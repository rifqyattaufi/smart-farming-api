const { Sequelize, DataTypes } = require('sequelize');
const defineHarianTernak = require('../../../model/farm/harianTernak');
const { isUUID } = require('validator');

describe('HarianTernak Model', () => {
  let sequelize;
  let HarianTernak;

  beforeAll(async () => {
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:',
      logging: false,
    });

    const Laporan = sequelize.define('Laporan', {});

    HarianTernak = defineHarianTernak(sequelize, DataTypes);
    HarianTernak.associate({ Laporan });

    await sequelize.sync();
  });

  beforeEach(async () => {
    await HarianTernak.destroy({ where: {} });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it('should create model instance with valid data', async () => {
    const ht = await HarianTernak.create({ pakan: true, cekKandang: false });
    expect(ht.pakan).toBe(true);
    expect(ht.cekKandang).toBe(false);
    expect(ht.isDeleted).toBe(false);
  });

  it('should have association with Laporan', () => {
    expect(HarianTernak.associations).toBeDefined();
    expect(HarianTernak.associations.Laporan).toBeDefined();
  });

  it('should allow soft deletion', async () => {
    const ht = await HarianTernak.create({ pakan: true, cekKandang: false });
    ht.isDeleted = true;
    await ht.save();
    const found = await HarianTernak.findOne({ where: { id: ht.id } });
    expect(found.isDeleted).toBe(true);
  });

  it('should set isDeleted to false by default', async () => {
    const ht = await HarianTernak.create({ pakan: true, cekKandang: false });
    expect(ht.isDeleted).toBe(false);
  });

  it('should not allow creating HarianTernak without activity flags', async () => {
    expect.assertions(1);
    try {
      await HarianTernak.create({});
    } catch (error) {
      expect(error).toBeTruthy();
    }
  });

  it('should not allow creating HarianTernak with invalid activity flags', async () => {
    expect.assertions(1);
    try {
      await HarianTernak.create({ pakan: 'yes', cekKandang: 'no' });
    } catch (error) {
      expect(error).toBeTruthy();
    }
  });

  it('should not allow creating HarianTernak with missing cekKandang', async () => {
    expect.assertions(1);
    try {
      await HarianTernak.create({ pakan: true });
    } catch (error) {
      expect(error).toBeTruthy();
    }
  });

  it('should not allow creating HarianTernak with missing pakan', async () => {
    expect.assertions(1);
    try {
      await HarianTernak.create({ cekKandang: true });
    } catch (error) {
      expect(error).toBeTruthy();
    }
  });

  it('should have createdAt and updatedAt fields', async () => {
    const ht = await HarianTernak.create({ pakan: true, cekKandang: false });
    expect(ht.createdAt).toBeDefined();
    expect(ht.updatedAt).toBeDefined();
  });

  it('should not allow creating HarianTernak with duplicate primary key', async () => {
    expect.assertions(1);
    try {
      const ht1 = await HarianTernak.create({ pakan: true, cekKandang: false });
      const ht2 = await HarianTernak.create({ id: ht1.id, pakan: false, cekKandang: true });
      expect(ht2).toBeFalsy();
    } catch (error) {
      expect(error).toBeTruthy();
    }
  });

  it('should have createdAt and updatedAt fields', async () => {
    const ht = await HarianTernak.create({ pakan: true, cekKandang: false });
    expect(ht.createdAt).toBeInstanceOf(Date);
    expect(ht.updatedAt).toBeInstanceOf(Date);
  });

  it('should allow bulk creation of HarianTernak', async () => {
    const ht1 = await HarianTernak.create({ pakan: true, cekKandang: false });
    const ht2 = await HarianTernak.create({ pakan: false, cekKandang: true });
    const result = await HarianTernak.findAll();
    expect(result.length).toBe(2);
    expect(result[0].pakan).toBe(true);
    expect(result[1].cekKandang).toBe(true);
  });

  it('should throw error on invalid bulkCreate (null in required fields)', async () => {
    expect.assertions(1);
    try {
      await HarianTernak.bulkCreate([
        { pakan: true, cekKandang: false },
        { pakan: null, cekKandang: true }, // invalid karena pakan null
      ]);
    } catch (error) {
      expect(error).toBeTruthy();
    }
  });

  it('should generate UUID for primary key', async () => {
    const ht = await HarianTernak.create({ pakan: true, cekKandang: false });
    expect(ht.id).toBeDefined();
    expect(isUUID(ht.id)).toBe(true);
  });
  
  it('should reject if id is null', async () => {
      expect.assertions(1);
      try {
          await HarianTernak.create({ id: null, pakan: true, cekKandang: false });
      } catch (error) {
          expect(error).toBeTruthy();
      }
  });

});
