const { Sequelize, DataTypes } = require('sequelize');
const defineHarianKebun = require('../../../model/farm/harianKebun');
const { isUUID } = require('validator');

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

  it('should create model instance with valid data', async () => {
    const hk = await HarianKebun.create({ penyiraman: true, pruning: false, repotting: true, tinggiTanaman: 10, kondisiDaun: 'sehat', statusTumbuh: 'vegetatifAwal' });
    expect(hk.penyiraman).toBe(true);
    expect(hk.pruning).toBe(false);
    expect(hk.repotting).toBe(true);
    expect(hk.isDeleted).toBe(false);
  });

  it('should have association with Laporan', () => {
    expect(HarianKebun.associations).toBeDefined();
    expect(HarianKebun.associations.Laporan).toBeDefined();
  });

  it('should allow soft deletion', async () => {
    const hk = await HarianKebun.create({ penyiraman: true, pruning: false, repotting: true, tinggiTanaman: 10, kondisiDaun: 'sehat', statusTumbuh: 'vegetatifAwal' });
    hk.isDeleted = true;
    await hk.save();
    const found = await HarianKebun.findOne({ where: { id: hk.id } });
    expect(found.isDeleted).toBe(true);
  });

  it('should set isDeleted to false by default', async () => {
    const hk = await HarianKebun.create({ penyiraman: true, pruning: false, repotting: true, tinggiTanaman: 10, kondisiDaun: 'sehat', statusTumbuh: 'vegetatifAwal' });
    expect(hk.isDeleted).toBe(false);
  });

  it('should not allow creating HarianKebun without penyiraman', async () => {
    expect.assertions(1);
    try {
        await HarianKebun.create({ pruning: false, repotting: true, tinggiTanaman: 10, kondisiDaun: 'sehat', statusTumbuh: 'vegetatifAwal' });
    } catch (error) {
        expect(error).toBeTruthy();
    }
  });

 it('should not allow creating HarianKebun without pruning', async () => {
    expect.assertions(1);
    try {
        await HarianKebun.create({ penyiraman: true, repotting: true, tinggiTanaman: 10, kondisiDaun: 'sehat', statusTumbuh: 'vegetatifAwal' });
    } catch (error) {
        expect(error).toBeTruthy();
    }
 });
    
  it('should not allow creating HarianKebun without repotting', async () => {
    expect.assertions(1);
    try {
        await HarianKebun.create({ penyiraman: true, pruning: false, tinggiTanaman: 10, kondisiDaun: 'sehat', statusTumbuh: 'vegetatifAwal' });
    } catch (error) {
        expect(error).toBeTruthy();
    }
  });

  it('should not allow creating HarianKebun with invalid tinggiTanaman', async () => {
    expect.assertions(1);
    try {
        await HarianKebun.create({ penyiraman: true, pruning: false, repotting: true, tinggiTanaman: -5, kondisiDaun: 'sehat', statusTumbuh: 'vegetatifAwal' });
    } catch (error) {
        expect(error).toBeTruthy();
    }
  });

  it('should not allow creating HarianKebun with invalid kondisiDaun', async () => {
    expect.assertions(1);
    try {
        await HarianKebun.create({ penyiraman: true, pruning: false, repotting: true, tinggiTanaman: 10, kondisiDaun: 'invalid', statusTumbuh: 'vegetatifAwal' });
    } catch (error) {
        expect(error).toBeTruthy();
    }
  });

  it('should not allow creating HarianKebun with invalid statusTumbuh', async () => {
    expect.assertions(1);
    try {
        await HarianKebun.create({ penyiraman: true, pruning: false, repotting: true, tinggiTanaman: 10, kondisiDaun: 'sehat', statusTumbuh: 'invalid' });
    } catch (error) {
        expect(error).toBeTruthy();
    }
  });

  it('should have createdAt and updatedAt fields', async () => {
    const hk = await HarianKebun.create({ penyiraman: true, pruning: false, repotting: true, tinggiTanaman: 10, kondisiDaun: 'sehat', statusTumbuh: 'vegetatifAwal' });
    expect(hk.createdAt).toBeInstanceOf(Date);
    expect(hk.updatedAt).toBeInstanceOf(Date);
  });

  it('should not allow creating HarianKebun with duplicate primary key', async () => {
    expect.assertions(1);
    try {
      const hk1 = await HarianKebun.create({ penyiraman: true, pruning: false, repotting: true , tinggiTanaman: 10, kondisiDaun: 'sehat', statusTumbuh: 'vegetatifAwal' });
      await HarianKebun.create({ id: hk1.id, penyiraman: false, pruning: true, repotting: false , tinggiTanaman: 15, kondisiDaun: 'kering', statusTumbuh: 'generatifAwal' });
    } catch (error) {
      expect(error).toBeTruthy();
    }
  });

  it('should have createdAt and updatedAt fields', async () => {
    const hk = await HarianKebun.create({ penyiraman: true, pruning: false, repotting: true , tinggiTanaman: 10, kondisiDaun: 'sehat', statusTumbuh: 'vegetatifAwal' });
    expect(hk.createdAt).toBeInstanceOf(Date);
    expect(hk.updatedAt).toBeInstanceOf(Date);
  });

  it('should allow bulk creation of HarianKebun', async () => {
    const hk1 = { penyiraman: true, pruning: false, repotting: true, tinggiTanaman: 10, kondisiDaun: 'sehat', statusTumbuh: 'vegetatifAwal' };
    const hk2 = { penyiraman: false, pruning: true, repotting: false, tinggiTanaman: 15, kondisiDaun: 'kering', statusTumbuh: 'generatifAwal' };
    const hks = await HarianKebun.bulkCreate([hk1, hk2]);
    expect(hks.length).toBe(2);
    expect(hks[0].penyiraman).toBe(true);
    expect(hks[1].pruning).toBe(true);
  });

    it('should throw error on invalid bulkCreate (null in required fields)', async () => {
        expect.assertions(1);
        try {
        await HarianKebun.bulkCreate([{ penyiraman: true, pruning: false, repotting: true }, { penyiraman: null, pruning: true, repotting: false }]);
        } catch (error) {
        expect(error).toBeTruthy();
        }
    });

    it('should generate UUID for primary key', async () => {
        const hk = await HarianKebun.create({ penyiraman: true, pruning: false, repotting: true, tinggiTanaman: 10, kondisiDaun: 'sehat', statusTumbuh: 'vegetatifAwal' });
        expect(hk.id).toBeDefined();
        expect(isUUID(hk.id)).toBe(true);
    });

    it('should reject if id is null', async () => {
        expect.assertions(1);
        try {
            await HarianKebun.create({ id: null, penyiraman: true, pruning: false, repotting: true, tinggiTanaman: 10, kondisiDaun: 'sehat', statusTumbuh: 'vegetatifAwal' });
        } catch (error) {
            expect(error).toBeTruthy();
        }
    });

    it('should not allow creating HarianKebun with invalid penyiraman value', async () => {
        expect.assertions(1);
        try {
            await HarianKebun.create({ penyiraman: 'invalid', pruning: false, repotting: true, tinggiTanaman: 10, kondisiDaun: 'sehat', statusTumbuh: 'vegetatifAwal' });
        } catch (error) {
            expect(error).toBeTruthy();
        }
    });

    it('should not allow creating HarianKebun with invalid pruning value', async () => {
        expect.assertions(1);
        try {
            await HarianKebun.create({ penyiraman: true, pruning: 'invalid', repotting: true, tinggiTanaman: 10, kondisiDaun: 'sehat', statusTumbuh: 'vegetatifAwal' });
        } catch (error) {
            expect(error).toBeTruthy();
        }
    });

    it('should not allow creating HarianKebun with invalid repotting value', async () => {
        expect.assertions(1);
        try {
            await HarianKebun.create({ penyiraman: true, pruning: false, repotting: 'invalid', tinggiTanaman: 10, kondisiDaun: 'sehat', statusTumbuh: 'vegetatifAwal' });
        } catch (error) {
            expect(error).toBeTruthy();
        }
    });
});
