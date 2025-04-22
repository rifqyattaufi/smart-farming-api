const e = require("express");
const sequelize = require("../../model/index");
const db = sequelize.sequelize;
const JenisHama = sequelize.JenisHama;

const getAlljenisHama = async (req, res) => {
  try {
    const data = await JenisHama.findAll({
      where: {
        isDeleted: false,
      },
    });
      
    return res.json({
      message: "Success get all Jenis Hama",
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};

const getjenisHamaById = async (req, res) => {
  try {
    const data = await JenisHama.findOne({ 
      where: { 
        id: req.params.id,
        isDeleted: false
      } 
    });

    if (!data) {
      return res.status(404).json({
        message: "Jenis Hama not found",
      });
    }

    return res.json({
      message: "Success get Jenis Hama",
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};

const createjenisHama = async (req, res) => {
  try {
    const data = await JenisHama.create(req.body);

    res.locals.createdData = data.toJSON();

    return res.status(201).json({
      message: "Jenis Hama created successfully",
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};

const updatejenisHama = async (req, res) => {
  try {
    const data = await JenisHama.findOne({ where: { id: req.params.id } });

    if (!data || data.isDeleted) {
      return res.status(404).json({
        message: "Jenis Hama not found",
      });
    }

    await JenisHama.update(req.body, {
      where: {
        id: req.params.id,
      },
    });

    const updated = await JenisHama.findOne({ where: { id: req.params.id } });

    res.locals.updatedData = updated.toJSON();

    return res.status(201).json({
      message: "Jenis Hama updated successfully",
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

const deletejenisHama = async (req, res) => {
  try {
    const data = await JenisHama.findOne({ where: { id: req.params.id, isDeleted: false } });
    
    if (!data) {
      return res.status(404).json({ 
        message: "Jenis Hama not found" 
      });
    }

    data.isDeleted = true;
    await data.save();

    res.locals.updatedData = data;

    res.status(200).json({ 
      message: "Jenis Hama deleted successfully" 
    });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error deleting Jenis Hama", error });
  }
};

module.exports = {
  getAlljenisHama,
  getjenisHamaById,
  createjenisHama,
  updatejenisHama,
  deletejenisHama,
};
