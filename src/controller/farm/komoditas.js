const e = require("express");
const sequelize = require("../../model/index");
const db = sequelize.sequelize;
const Komoditas = sequelize.Komoditas;

const getAllKomoditas = async (req, res) => {
  try {
    const data = await Komoditas.findAll({
      where: {
        isDeleted: false,
      },
    });
      
    return res.json({
      message: "Success get all Komoditas",
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};

const getKomoditasById = async (req, res) => {
  try {
    const data = await Komoditas.findOne({ 
      where: { 
        id: req.params.id,
        isDeleted: false
      } 
    });

    if (!data) {
      return res.status(404).json({
        message: "Komoditas not found",
      });
    }

    return res.json({
      message: "Success get Komoditas",
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};

const createKomoditas = async (req, res) => {
  try {
    const data = await Komoditas.create(req.body);

    res.locals.createdData = data.toJSON();

    return res.status(201).json({
      message: "Komoditas created successfully",
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};

const updateKomoditas = async (req, res) => {
  try {
    const data = await Komoditas.findOne({ where: { id: req.params.id } });

    if (!data || data.isDeleted) {
      return res.status(404).json({
        message: "Komoditas not found",
      });
    }

    await Komoditas.update(req.body, {
      where: {
        id: req.params.id,
      },
    });

    const updated = await Komoditas.findOne({ where: { id: req.params.id } });

    res.locals.updatedData = updated.toJSON();

    return res.status(201).json({
      message: "Komoditas updated successfully",
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

const deleteKomoditas = async (req, res) => {
  try {
    const data = await Komoditas.findOne({ where: { id: req.params.id, isDeleted: false } });
    
    if (!data) {
      return res.status(404).json({ 
        message: "Komoditas not found" 
      });
    }

    data.isDeleted = true;
    await data.save();

    res.locals.updatedData = data;

    res.status(200).json({ 
      message: "Komoditas deleted successfully" 
    });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error deleting Komoditas", error });
  }
};

module.exports = {
  getAllKomoditas,
  getKomoditasById,
  createKomoditas,
  updateKomoditas,
  deleteKomoditas,
};
