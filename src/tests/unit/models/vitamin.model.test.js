const { Sequelize, DataTypes } = require('sequelize');
const defineVitamin = require('../../../model/farm/vitamin');

describe('Vitamin Model', () => {
  let sequelize;
  let Vitamin;

  beforeAll(async () => {
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:',
      logging: false,
    });

    const Inventaris = sequelize.define('Inventaris', {});
    const Laporan = sequelize.define('Laporan', {});

    Vitamin = defineVitamin(sequelize, DataTypes);
    Vitamin.associate({ Inventaris, Laporan });
    await sequelize.sync();
  });

  beforeEach(async () => {
    await Vitamin.destroy({ where: {} });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it('should create vitamin successfully with valid data', async () => {
    const vitamin = await Vitamin.create({ tipe: 'vitamin', jumlah: 5 });
    expect(vitamin.tipe).toBe('vitamin');
    expect(vitamin.jumlah).toBe(5);
    expect(vitamin.isDeleted).toBe(false);
  });

  it('should set isDeleted default to false', async () => {
    const vitamin = await Vitamin.create({ tipe: 'vaksin', jumlah: 10 });
    expect(vitamin.isDeleted).toBe(false);
  });

  it('should throw error if required fields are missing', async () => {
    expect.assertions(1);
    try {
      await Vitamin.create({});
    } catch (error) {
      expect(error.message).toMatch(/notNull/);
    }
  });

  it('should support bulkCreate', async () => {
    const bulk = await Vitamin.bulkCreate([
      { tipe: 'pupuk', jumlah: 3 },
      { tipe: 'disinfektan', jumlah: 7 },
    ]);
    expect(bulk.length).toBe(2);
    expect(bulk[0].tipe).toBe('pupuk');
  });

  it('should throw error on invalid bulkCreate', async () => {
    expect.assertions(1);
    try {
      await Vitamin.bulkCreate([{ tipe: null, jumlah: 2 }]);
    } catch (error) {
      expect(error).toBeTruthy();
    }
  });

  it('should have associations defined', () => {
    expect(Vitamin.associations).toBeDefined();
    expect(Vitamin.associations.Inventari).toBeDefined();
    expect(Vitamin.associations.Laporan).toBeDefined();
  });  
});
