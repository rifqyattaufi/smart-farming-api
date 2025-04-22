const e = require("express");
const sequelize = require("../../model/index");
const db = sequelize.sequelize;
const JenisBudidaya = sequelize.JenisBudidaya;
const UnitBudidaya = sequelize.UnitBudidaya;
const ObjekBudidaya = sequelize.ObjekBudidaya;
const Logs = sequelize.Logs;

const getAllUnitBudidaya = async (req, res) => {
  try {
    const data = await UnitBudidaya.findAll({
      where: {
        isDeleted: false,
      },
    });

    return res.json({
      message: "Success get all Unit Budidaya",
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};

const getUnitBudidayaById = async (req, res) => {
  try {
    const data = await UnitBudidaya.findOne({ where: { id: req.params.id, isDeleted: false } });

    if (!data) {
      return res.status(404).json({
        message: "Unit Budidaya not found",
      });
    }

    return res.json({
      message: "Success get Unit Budidaya",
      data: unit,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};

const createUnitBudidaya = async (req, res) => {
  const t = await db.transaction();

  try {
    const { jumlah = 0, tipe, jenisBudidayaId } = req.body;

    const jenisBudidaya = await JenisBudidaya.findOne({
      where: { id: jenisBudidayaId },
      isDeleted: false,
      transaction: t,
    });

    if (!jenisBudidaya) {
      await t.rollback();
      return res.status(404).json({ message: "Jenis Budidaya not found" });
    }

    const data = await UnitBudidaya.create(
      {
        ...req.body,
        isDeleted: false,
      },
      { transaction: t }
    );

    let objekList = [];

    if (tipe === "individu") {
      objekList = Array.from({ length: jumlah }, (_, i) => {
        const prefix = jenisBudidaya.tipe === "hewan" ? "Ternak" : "Tanaman";
        const deskripsi = `${prefix} ${jenisBudidaya.nama} pada ${
          data.nama
        } nomor ${i + 1}`;

        return {
          unitBudidayaId: data.id,
          namaId: `${jenisBudidaya.nama} #${i + 1}`,
          status: true,
          deskripsi,
          isDeleted: false,
        };
      });

      createdObjekList = await ObjekBudidaya.bulkCreate(objekList, {
        transaction: t,
        returning: true,
      });

      for (const obj of createdObjekList) {
        await Logs.create({
          tableName: "ObjekBudidaya",
          action: "create",
          recordId: obj.id,
          before: null,
          after: obj.toJSON(),
          changedBy: req.user?.id,
        });
      }
      
    }

    await t.commit();

    res.locals.createdData = data.toJSON();

    return res.status(201).json({
      message: "Unit Budidaya created successfully",
      data: {
        unitBudidaya: data,
        objekBudidaya: createdObjekList,
      },
    });
  } catch (error) {
    t.rollback();
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};

const updateUnitBudidaya = async (req, res) => {
  try {
    const data = await UnitBudidaya.findOne({ where: { id: req.params.id } });

    if (!data || data.isDeleted) {
      return res.status(404).json({
        message: "Unit Budidaya not found",
      });
    }

    await UnitBudidaya.update(req.body, {
      where: {
        id: req.params.id,
      },
    });

    const updated = await UnitBudidaya.findOne({ where: { id: req.params.id } });

    res.locals.updatedData = updated.toJSON();

    return res.status(201).json({
      message: "Unit Budidaya updated successfully",
      data: {
        id: req.params.id,
        ...req.body,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};

// *PR kalau mau delete unit budidaya, harus perhatikan relasi yg dimiliki unit budidaya tsb !!!
const deleteUnitBudidaya = async (req, res) => {
  try {
    const data = await UnitBudidaya.findOne({
      where: { id: req.params.id, isDeleted: false },
    });

    if (!data) {
      return res.status(404).json({ message: "Unit Budidaya not found" });
    }

    data.isDeleted = true;
    await data.save();

    res.locals.updatedData = data;

    res.status(200).json({ message: "Unit Budidaya deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting Unit Budidaya", error });
  }
};

module.exports = {
  getAllUnitBudidaya,
  getUnitBudidayaById,
  createUnitBudidaya,
  updateUnitBudidaya,
  deleteUnitBudidaya,
};
