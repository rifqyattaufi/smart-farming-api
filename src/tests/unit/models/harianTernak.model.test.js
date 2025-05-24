const { Sequelize, DataTypes } = require('sequelize');
const defineHarianTernak = require('../../../model/farm/harianTernak');

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

  it('should create HarianTernak with boolean fields', async () => {
    const ht = await HarianTernak.create({ pakan: true, cekKandang: false });
    expect(ht.pakan).toBe(true);
    expect(ht.cekKandang).toBe(false);
    expect(ht.isDeleted).toBe(false);
  });

  it('should have association with Laporan', () => {
    expect(HarianTernak.associations).toBeDefined();
    expect(HarianTernak.associations.Laporan).toBeDefined();
  });
});
