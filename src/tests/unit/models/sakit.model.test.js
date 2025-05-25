const { Sequelize, DataTypes } = require('sequelize');
const defineSakit = require('../../../model/farm/sakit');

describe('Sakit Model', () => {
  let sequelize;
  let Sakit;

  beforeAll(async () => {
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:',
      logging: false,
    });

    const Laporan = sequelize.define('Laporan', {});

    Sakit = defineSakit(sequelize, DataTypes);
    Sakit.associate({ Laporan });

    await sequelize.sync();
  });

  beforeEach(async () => {
    await Sakit.destroy({ where: {} });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it('should create a Sakit with valid data', async () => {
    const sakit = await Sakit.create({ penyakit: 'Flu Burung' });
    expect(sakit.penyakit).toBe('Flu Burung');
    expect(sakit.isDeleted).toBe(false);
  });

  it('should set isDeleted to false by default', async () => {
    const sakit = await Sakit.create({ penyakit: 'Kudis' });
    expect(sakit.isDeleted).toBe(false);
  });

  it('should throw error if penyakit is null', async () => {
    expect.assertions(1);
    try {
      await Sakit.create({});
    } catch (err) {
      expect(err.message).toMatch(/notNull/);
    }
  });

  it('should support soft delete by setting isDeleted = true', async () => {
    const sakit = await Sakit.create({ penyakit: 'Parasit' });
    sakit.isDeleted = true;
    await sakit.save();

    const updated = await Sakit.findByPk(sakit.id);
    expect(updated.isDeleted).toBe(true);
  });

  it('should define association with Laporan', () => {
    expect(Sakit.associations.Laporan).toBeDefined();
  });

  it('should support bulkCreate with valid data', async () => {
    const data = [
        { penyakit: 'Embun Tepung' },
        { penyakit: 'Embun Bulu' },
    ];

    const result = await Sakit.bulkCreate(data);
    expect(result.length).toBe(2);
  });

  it('should throw error on invalid bulkCreate (null in required fields)', async () => {
    expect.assertions(1);
    try {
        await Sakit.bulkCreate([
        { penyakit: 'Embun Bulu' },    
        { penyakit: null },
        ]);
    } catch (err) {
        expect(err).toBeTruthy();
    }
  });
});
