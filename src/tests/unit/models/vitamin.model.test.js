const { Sequelize, DataTypes } = require('sequelize');
const defineVitamin = require('../../../model/farm/vitamin');
const { isUUID } = require('validator');

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

  it('should have createdAt and updatedAt fields', async () => {
    const vitamin = await Vitamin.create({ tipe: 'pupuk', jumlah: 4 });
    expect(vitamin.createdAt).toBeInstanceOf(Date);
    expect(vitamin.updatedAt).toBeInstanceOf(Date);
  });

  it('should support soft delete by setting isDeleted = true', async () => {
    const vitamin = await Vitamin.create({ tipe: 'vitamin', jumlah: 8 });
    vitamin.isDeleted = true;
    await vitamin.save();

    const found = await Vitamin.findByPk(vitamin.id);
    expect(found.isDeleted).toBe(true);
  });

  it('should generate UUID for primary key', async () => {
    const vitamin = await Vitamin.create({ tipe: 'vitamin', jumlah: 6 });
    expect(vitamin.id).toBeDefined();
    expect(isUUID(vitamin.id)).toBe(true);
  });

  it('should throw error if id is null', async () => {
    expect.assertions(1);
    try {
      await Vitamin.create({ id: null, tipe: 'vitamin', jumlah: 5 });
    } catch (error) {
      expect(error.name).toBeTruthy();
    }
  });


});
