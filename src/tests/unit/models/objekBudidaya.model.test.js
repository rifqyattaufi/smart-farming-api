const { Sequelize, DataTypes } = require('sequelize');
const defineObjekBudidaya = require('../../../model/farm/objekBudidaya');

describe('ObjekBudidaya Model', () => {
  let sequelize;
  let ObjekBudidaya;

  beforeAll(async () => {
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:',
      logging: false,
    });

    // dummy model yg di-associate
    const Laporan = sequelize.define('Laporan', {});
    const UnitBudidaya = sequelize.define('UnitBudidaya', {});

    ObjekBudidaya = defineObjekBudidaya(sequelize, DataTypes);
    ObjekBudidaya.associate({ Laporan, UnitBudidaya });

    await sequelize.sync();
  });

  beforeEach(async () => {
    await ObjekBudidaya.destroy({ where: {} });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it('should create ObjekBudidaya with valid data', async () => {
    const obj = await ObjekBudidaya.create({ namaId: 'OBJ001', deskripsi: 'Deskripsi contoh' });
    expect(obj.namaId).toBe('OBJ001');
    expect(obj.deskripsi).toBe('Deskripsi contoh');
    expect(obj.status).toBe(true);
    expect(obj.isDeleted).toBe(false);
  });

  it('should throw error if namaId is missing', async () => {
    expect.assertions(1);
    try {
      await ObjekBudidaya.create({});
    } catch (error) {
      expect(error.message).toMatch(/notNull/);
    }
  });

  it('should have associations defined', () => {
    expect(ObjekBudidaya.associations).toBeDefined();
    expect(ObjekBudidaya.associations.Laporans).toBeDefined();
    expect(ObjekBudidaya.associations.UnitBudidaya).toBeDefined();
  });
});
