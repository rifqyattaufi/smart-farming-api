const sequelize = require("../../model/index");
const db = sequelize.sequelize;
const ObjekBudidaya = sequelize.ObjekBudidaya;

const getAllObjekBudidaya = async (req, res) => {
  try {
    const data = await ObjekBudidaya.findAll({
      where: {
        isDeleted: false,
      },
    });

    if (data.length === 0) {
      return res.status(404).json({
        message: "Data not found",
      });
    }

    return res.status(200).json({
      message: "Successfully retrieved all unit budidaya data",
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};

const getObjekBudidayaById = async (req, res) => {
  try {
    const data = await ObjekBudidaya.findOne({
      where: { id: req.params.id, isDeleted: false },
    });

    if (!data) {
      return res.status(404).json({
        message: "Data not found",
      });
    }

    return res.status(200).json({
      message: "Successfully retrieved objek budidaya data",
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};

const createObjekBudidaya = async (req, res) => {
  try {
    const data = await ObjekBudidaya.create({
      ...req.body,
      UnitBudidayaId: req.body.unitBudidayaId,
    });

    if (!data) {
      return res.status(400).json({
        message: "Failed to create objek budidaya",
      });
    }

    res.locals.createdData = data.toJSON;

    return res.status(201).json({
      message: "Successfully created objek budidaya",
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};

const updateObjekBudidaya = async (req, res) => {
  try {
    const data = await ObjekBudidaya.findOne({
      where: { id: req.params.id, isDeleted: false },
    });

    if (!data) {
      return res.status(404).json({
        message: "Data not found",
      });
    }

    await ObjekBudidaya.update(req.body, {
      where: {
        id: req.params.id,
      },
    });

    const updated = await ObjekBudidaya.findOne({
      where: { id: req.params.id },
    });

    res.locals.updatedData = updated.toJSON();

    return res.status(200).json({
      message: "Successfully updated objek budidaya data",
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

const deleteObjekBudidaya = async (req, res) => {
  try {
    const data = await ObjekBudidaya.findOne({
      where: { id: req.params.id, isDeleted: false },
    });

    if (!data) {
      return res.status(404).json({
        message: "Data not found",
      });
    }

    data.isDeleted = true;
    await data.save();

    res.locals.updatedData = data;

    return res.status(200).json({
      message: "Successfully deleted objek budidaya data",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};

module.exports = {
  getAllObjekBudidaya,
  getObjekBudidayaById,
  createObjekBudidaya,
  updateObjekBudidaya,
  deleteObjekBudidaya,
};
