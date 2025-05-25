const { Sequelize, DataTypes } = require('sequelize');
const defineHarianKebun = require('../../../model/farm/harianKebun');

describe('HarianKebun Model', () => {
  let sequelize;
  let HarianKebun;

  beforeAll(async () => {
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:',
      logging: false,
    });

    const Laporan = sequelize.define('Laporan', {});

    HarianKebun = defineHarianKebun(sequelize, DataTypes);
    HarianKebun.associate({ Laporan });

    await sequelize.sync();
  });

  beforeEach(async () => {
    await HarianKebun.destroy({ where: {} });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it('should create HarianKebun with boolean activity flags', async () => {
    const hk = await HarianKebun.create({ penyiraman: true, pruning: false, repotting: true });
    expect(hk.penyiraman).toBe(true);
    expect(hk.pruning).toBe(false);
    expect(hk.repotting).toBe(true);
    expect(hk.isDeleted).toBe(false);
  });

  it('should have association with Laporan', () => {
    expect(HarianKebun.associations).toBeDefined();
    expect(HarianKebun.associations.Laporan).toBeDefined();
  });
});
