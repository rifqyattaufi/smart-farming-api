const { Sequelize, DataTypes } = require('sequelize');
const definePanen = require('../../../model/farm/panen');

describe('Panen Model', () => {
  let sequelize;
  let Panen;

  beforeAll(async () => {
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:',
      logging: false,
    });

    const Komoditas = sequelize.define('Komoditas', {});
    const Laporan = sequelize.define('Laporan', {});

    Panen = definePanen(sequelize, DataTypes);
    Panen.associate({ Komoditas, Laporan });

    await sequelize.sync();
  });

  beforeEach(async () => {
    await Panen.destroy({ where: {} });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it('should create Panen with jumlah and default isDeleted', async () => {
    const panen = await Panen.create({ jumlah: 100 });
    expect(panen.jumlah).toBe(100);
    expect(panen.isDeleted).toBe(false);
  });

  it('should have associations defined', () => {
    expect(Panen.associations).toBeDefined();
    expect(Panen.associations.Komodita).toBeDefined();
    expect(Panen.associations.Laporan).toBeDefined();
  });
});
