const e = require("express");
const sequelize = require("../../model/index");
const db = sequelize.sequelize;
const KategoriInventaris = sequelize.KategoriInventaris;

const getAllkategoriInventaris = async (req, res) => {
  try {
    const data = await KategoriInventaris.findAll({
      where: {
        isDeleted: false,
      },
    });
      
    return res.json({
      message: "Success get all Kategori Inventaris",
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};

const getkategoriInventarisById = async (req, res) => {
  try {
    const data = await KategoriInventaris.findOne({ 
      where: { 
        id: req.params.id,
        isDeleted: false
      } 
    });

    if (!data) {
      return res.status(404).json({
        message: "Kategori Inventaris not found",
      });
    }

    return res.json({
      message: "Success get Kategori Inventaris",
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};

const createkategoriInventaris = async (req, res) => {
  try {
    const data = await KategoriInventaris.create(req.body);

    res.locals.createdData = data.toJSON();

    return res.status(201).json({
      message: "Kategori Inventaris created successfully",
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};

const updatekategoriInventaris = async (req, res) => {
  try {
    const data = await KategoriInventaris.findOne({ where: { id: req.params.id } });

    if (!data || data.isDeleted) {
      return res.status(404).json({
        message: "Kategori Inventaris not found",
      });
    }

    await KategoriInventaris.update(req.body, {
      where: {
        id: req.params.id,
      },
    });

    const updated = await KategoriInventaris.findOne({ where: { id: req.params.id } });

    res.locals.updatedData = updated.toJSON();

    return res.status(201).json({
      message: "Kategori Inventaris updated successfully",
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

const deletekategoriInventaris = async (req, res) => {
  try {
    const data = await KategoriInventaris.findOne({ where: { id: req.params.id, isDeleted: false } });
    
    if (!data) {
      return res.status(404).json({ 
        message: "Kategori Inventaris not found" 
      });
    }

    data.isDeleted = true;
    await data.save();

    res.locals.updatedData = data;

    res.status(200).json({ 
      message: "Kategori Inventaris deleted successfully" 
    });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error deleting Kategori Inventaris", error });
  }
};

module.exports = {
  getAllkategoriInventaris,
  getkategoriInventarisById,
  createkategoriInventaris,
  updatekategoriInventaris,
  deletekategoriInventaris,
};
