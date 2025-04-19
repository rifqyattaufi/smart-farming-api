const e = require("express");
const sequelize = require("../../model/index");
const db = sequelize.sequelize;
const UnitBudidaya = sequelize.UnitBudidaya;
const ObjekBudidaya = sequelize.ObjekBudidaya;

const getAllUnitBudidaya = async (req, res) => {
  try {
    const data = await UnitBudidaya.findAll();
    
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
    const unit = await UnitBudidaya.findOne({ where: { id: req.params.id } });

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
    const data = await UnitBudidaya.create({
      ...req.body,
      isDeleted: false,
    }, { transaction: t });

    // get jumlah ternak
    const { jumlah = 0, tipe } = req.body;

    let objekList = [];

    // Check if the type is 'kolektif' or 'individu', if 'individu' create the objects
    if (tipe === 'individu') {
      objekList = Array.from({ length: jumlah }, (_, i) => ({
        unitBudidayaId: data.id,
        status: true,
        deskripsi: `objek-${i + 1}`,
        isDeleted: false,
      }));

      await ObjekBudidaya.bulkCreate(objekList, { transaction: t });
    }

    await t.commit();

    return res.status(201).json({
      message: "Unit Budidaya created successfully",
      data: {
        unitBudidaya: data,
        objekBudidaya: objekList,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};

const updateUnitBudidaya = async (req, res) => {
  try {
    const unit = await UnitBudidaya.findOne({ where: { id: req.params.id } });

    if (!unit) {
      return res.status(404).json({
        message: "Unit Budidaya not found",
      });
    }

    if (unit.isDeleted) {
      return res.status(404).json({
        message: "Unit Budidaya not found",
      });
    }

    await UnitBudidaya.update(req.body, {
      where: {
        id: req.params.id,
      },
    });

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

const deleteUnitBudidaya = async (req, res) => {
  try {
    const unit = await UnitBudidaya.findOne({ where: { id: req.params.id, isDeleted: false } });
    
    if (!unit) {
        return res.status(404).json({ message: "Unit Budidaya not found" });
    }

    unit.isDeleted = true;
    await unit.save();
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
