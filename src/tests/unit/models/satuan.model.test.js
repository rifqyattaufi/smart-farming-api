const { Sequelize, DataTypes } = require('sequelize');
const defineSatuan = require('../../../model/farm/satuan');

describe('Satuan Model', () => {
  let sequelize;
  let Satuan;

  beforeAll(async () => {
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:',
      logging: false,
    });

    Satuan = defineSatuan(sequelize, DataTypes);
    const Komoditas = sequelize.define('Komoditas', {});
    const Inventaris = sequelize.define('Inventaris', {});
    Satuan.associate({ Komoditas, Inventaris });
    await sequelize.sync();
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it('should not allow creating satuan without nama', async () => {
    expect.assertions(1);
    try {
      await Satuan.create({ lambang: 'Kg' });
    } catch (error) {
      expect(error).toBeTruthy();
    }
  });

  it('should not allow creating satuan without lambang', async () => {
    expect.assertions(1);
    try {
      await Satuan.create({ nama: 'Kilogram' });
    } catch (error) {
      expect(error).toBeTruthy();
    }
  });

  it('should create satuan successfully with valid data', async () => {
    const satuan = await Satuan.create({ nama: 'Kilogram', lambang: 'Kg' });
    expect(satuan.nama).toBe('Kilogram');
    expect(satuan.lambang).toBe('Kg');
    expect(satuan.isDeleted).toBe(false);
  });

  it('should allow soft deleting satuan', async () => {
    const satuan = await Satuan.create({ nama: 'Gram', lambang: 'g' });
    satuan.isDeleted = true;
    await satuan.save();
    const found = await Satuan.findOne({ where: { id: satuan.id } });
    expect(found.isDeleted).toBe(true);
  });

  it('should set isDeleted to false by default', async () => {
    const satuan = await Satuan.create({ nama: 'Meter', lambang: 'm' });
    expect(satuan.isDeleted).toBe(false);
  });

  it('should have createdAt and updatedAt fields', async () => {
    const satuan = await Satuan.create({ nama: 'Yard', lambang: 'yd' });
    expect(satuan.createdAt).toBeInstanceOf(Date);
    expect(satuan.updatedAt).toBeInstanceOf(Date);
  });

  it('should not include soft-deleted records in default query (if scope applied)', async () => {
    await Satuan.create({ nama: 'Inch', lambang: 'in', isDeleted: true });
    const result = await Satuan.findAll({ where: { isDeleted: false } });
    result.forEach(s => expect(s.isDeleted).toBe(false));
  });

  it('should throw specific error when nama is null', async () => {
    expect.assertions(1);
    try {
      await Satuan.create({ lambang: 'x' });
    } catch (error) {
      expect(error.message).toMatch(/notNull/);
    }
  });

  it('should throw specific error when lambang is null', async () => {
    expect.assertions(1);
    try {
      await Satuan.create({ nama: 'x' });
    } catch (error) {
      expect(error.message).toMatch(/notNull/);
    }
  });

  it('should allow bulk creation of satuan', async () => {
    const data = [
      { nama: 'Pound', lambang: 'lb' },
      { nama: 'Stone', lambang: 'st' },
    ];
    const satuans = await Satuan.bulkCreate(data);
    expect(satuans.length).toBe(2);
  });

  it('should update nama correctly', async () => {
    const satuan = await Satuan.create({ nama: 'Liter', lambang: 'L' });
    satuan.nama = 'Milliliter';
    await satuan.save();
    const updated = await Satuan.findByPk(satuan.id);
    expect(updated.nama).toBe('Milliliter');
  });

  it('should have associations with Komoditas and Inventaris', () => {
    expect(Satuan.associations.Komoditas).toBeDefined();
    expect(Satuan.associations.Inventaris).toBeDefined();
  });

  it('should throw error when bulkCreate has invalid record', async () => {
    expect.assertions(1);
    const data = [
      { nama: 'Valid1', lambang: 'V1' },
      { nama: null, lambang: 'V2' },
      { nama: 'Valid3', lambang: 'V3' },
    ];
    try {
      await Satuan.bulkCreate(data);
    } catch (error) {
      expect(error).toBeTruthy();
    }
  });
});