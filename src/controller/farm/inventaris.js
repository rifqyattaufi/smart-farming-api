const e = require("express");
const sequelize = require("../../model/index");
const db = sequelize.sequelize;
const Inventaris = sequelize.Inventaris;

const getAllInventaris = async (req, res) => {
  try {
    const data = await Inventaris.findAll({
      where: {
        isDeleted: false,
      },
    });
      
    return res.json({
      message: "Success get all Inventaris",
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};

const getInventarisById = async (req, res) => {
  try {
    const data = await Inventaris.findOne({ 
      where: { 
        id: req.params.id,
        isDeleted: false
      } 
    });

    if (!data) {
      return res.status(404).json({
        message: "Inventaris not found",
      });
    }

    return res.json({
      message: "Success get Inventaris",
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};

const createInventaris = async (req, res) => {
  try {
    const data = await Inventaris.create(req.body);

    res.locals.createdData = data.toJSON();

    return res.status(201).json({
      message: "Inventaris created successfully",
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};

const updateInventaris = async (req, res) => {
  try {
    const data = await Inventaris.findOne({ where: { id: req.params.id } });

    if (!data || data.isDeleted) {
      return res.status(404).json({
        message: "Inventaris not found",
      });
    }

    await Inventaris.update(req.body, {
      where: {
        id: req.params.id,
      },
    });

    const updated = await Inventaris.findOne({ where: { id: req.params.id } });

    res.locals.updatedData = updated.toJSON();

    return res.status(201).json({
      message: "Inventaris updated successfully",
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

const deleteInventaris = async (req, res) => {
  try {
    const data = await Inventaris.findOne({ where: { id: req.params.id, isDeleted: false } });
    
    if (!data) {
      return res.status(404).json({ 
        message: "Inventaris not found" 
      });
    }

    data.isDeleted = true;
    await data.save();

    res.locals.updatedData = data;

    res.status(200).json({ 
      message: "Inventaris deleted successfully" 
    });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error deleting Inventaris", error });
  }
};

module.exports = {
  getAllInventaris,
  getInventarisById,
  createInventaris,
  updateInventaris,
  deleteInventaris,
};
