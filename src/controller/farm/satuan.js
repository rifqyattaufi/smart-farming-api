const e = require("express");
const sequelize = require("../../model/index");
const db = sequelize.sequelize;
const Satuan = sequelize.Satuan;
const Op = sequelize.Sequelize.Op;

const getAllSatuan = async (req, res) => {
  try {
    const data = await Satuan.findAll({
      where: {
        isDeleted: false,
      },
    });
      
    return res.json({
      message: "Success get all Satuan",
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};

const getSatuanById = async (req, res) => {
  try {
    const data = await Satuan.findOne({ where: { id: req.params.id } });

    return res.json({
      message: "Success get Satuan",
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};

const createSatuan = async (req, res) => {
  try {
    const data = await Satuan.create(req.body);

    res.locals.createdData = data.toJSON();

    return res.status(201).json({
      message: "Satuan created successfully",
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};

const updateSatuan = async (req, res) => {
  try {
    const data = await Satuan.findOne({ where: { id: req.params.id } });

    if (!data || data.isDeleted) {
      return res.status(404).json({
        message: "Satuan not found",
      });
    }

    await Satuan.update(req.body, {
      where: {
        id: req.params.id,
      },
    });

    const updated = await Satuan.findOne({ where: { id: req.params.id } });

    res.locals.updatedData = updated.toJSON();

    return res.status(201).json({
      message: "Satuan updated successfully",
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

const deleteSatuan = async (req, res) => {
  try {
    const data = await Satuan.findOne({ where: { id: req.params.id, isDeleted: false } });
    
    if (!data) {
      return res.status(404).json({ 
        message: "Satuan not found" 
      });
    }

    data.isDeleted = true;
    await data.save();

    res.locals.updatedData = data;

    res.status(200).json({ 
      message: "Satuan deleted successfully" 
    });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error deleting Satuan", error });
  }
};

const getSatuanByName = async (req, res) => {
    
};

module.exports = {
  getAllSatuan,
  getSatuanByName,
  getSatuanById,
  createSatuan,
  updateSatuan,
  deleteSatuan,
};
