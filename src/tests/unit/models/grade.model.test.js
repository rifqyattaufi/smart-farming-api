const { Sequelize, DataTypes } = require('sequelize');
const defineGrade = require('../../../model/farm/grade');
const { isUUID } = require('validator');

describe('Grade Model', () => {
  let sequelize;
  let Grade;

  beforeAll(async () => {
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:',
      logging: false,
    });

    Grade = defineGrade(sequelize, DataTypes);
    const PanenRincianGrade = sequelize.define('PanenRincianGrade', {});
    Grade.associate({ PanenRincianGrade });
    await sequelize.sync();
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it('should create model instance with valid data', async () => {
    const grade = await Grade.create({ nama: 'Grade A', deskripsi: 'High quality' });
    expect(grade.nama).toBe('Grade A');
    expect(grade.deskripsi).toBe('High quality');
    expect(grade.isDeleted).toBe(false);
  });

  it('should not allow creating grade without nama', async () => {
    expect.assertions(1);
    try {
      await Grade.create({ deskripsi: 'No name' });
    } catch (error) {
      expect(error).toBeTruthy();
    }
  });

  it('should not allow creating grade with duplicate nama', async () => {
    expect.assertions(1);
    await Grade.create({ nama: 'Grade B', deskripsi: 'Medium quality' });
    try {
    await Grade.create({ nama: 'Grade B', deskripsi: 'Duplicate name' });
    } catch (error) {
    expect(error).toBeTruthy();
    }
  });

  it('should set isDeleted to false by default', async () => {
    const grade = await Grade.create({ nama: 'Grade C', deskripsi: 'Low quality' });
    expect(grade.isDeleted).toBe(false);
  });

  it('should support soft deletion by setting isDeleted = true', async () => {
    const grade = await Grade.create({ nama: 'Grade D', deskripsi: 'Deleted grade' });
    grade.isDeleted = true;
    await grade.save();
    const found = await Grade.findByPk(grade.id);
    expect(found.isDeleted).toBe(true);
  });

    it('should have createdAt and updatedAt fields', async () => {
        const grade = await Grade.create({ nama: 'Grade E', deskripsi: 'Test grade' });
        expect(grade.createdAt).toBeInstanceOf(Date);
        expect(grade.updatedAt).toBeInstanceOf(Date);
    });

    it('should allow bulk creation of records', async () => {
        const data = [
            { nama: 'Grade F', deskripsi: 'Bulk grade 1' },
            { nama: 'Grade G', deskripsi: 'Bulk grade 2' },
        ];
        const hasil = await Grade.bulkCreate(data);
        expect(hasil.length).toBe(2);
    });

    it('should throw error on invalid bulkCreate (null in required fields)', async () => {
        expect.assertions(1);
        try {
            await Grade.bulkCreate([
                { nama: 'Grade H', deskripsi: 'Valid grade' },
                { nama: null, deskripsi: 'Invalid grade' }, // invalid karena nama null
            ]);
        } catch (error) {
            expect(error).toBeTruthy();
        }
    });

    it('should generate a UUID for id if not provided', async () => {
        const grade = await Grade.create({ nama: 'Grade I', deskripsi: 'UUID test' });
        expect(grade.id).toBeDefined();
        expect(isUUID(grade.id)).toBe(true);
    });

    it('should reject if id is null', async () => {
        expect.assertions(1);
        try {
            await Grade.create({ id: null, nama: 'Grade J', deskripsi: 'Null ID test' });
        } catch (error) {
            expect(error.name).toBe('SequelizeValidationError');
        }
    });

    it('should have associations with PanenRincianGrade', () => {
        expect(Grade.associations.PanenRincianGrades).toBeDefined();
    });
});