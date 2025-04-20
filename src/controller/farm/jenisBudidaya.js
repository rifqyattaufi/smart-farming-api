const e = require("express");
const sequelize = require("../../model/index");
const db = sequelize.sequelize;
const JenisBudidaya = sequelize.JenisBudidaya;

const getAllJenisBudidaya = async (req, res) => {
  try {
    const data = await JenisBudidaya.findAll();
      
    return res.json({
      message: "Success get all Jenis Budidaya",
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};

const getJenisBudidayaById = async (req, res) => {
  try {
    const jenis = await JenisBudidaya.findOne({ where: { id: req.params.id } });

    return res.json({
      message: "Success get Jenis Budidaya",
      data: jenis,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};

const createJenisBudidaya = async (req, res) => {
  try {
    const data = await JenisBudidaya.create(req.body);

    return res.status(201).json({
      message: "Jenis Budidaya created successfully",
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};

const updateJenisBudidaya = async (req, res) => {
  try {
    const jenis = await JenisBudidaya.findOne({ where: { id: req.params.id } });

    if (!jenis) {
      return res.status(404).json({
        message: "Jenis Budidaya not found",
      });
    }

    if (jenis.isDeleted) {
      return res.status(404).json({
        message: "Jenis Budidaya not found",
      });
    }

    await JenisBudidaya.update(req.body, {
      where: {
        id: req.params.id,
      },
    });

    return res.status(201).json({
      message: "Jenis Budidaya updated successfully",
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

const deleteJenisBudidaya = async (req, res) => {
  try {
    const jenis = await JenisBudidaya.findOne({ where: { id: req.params.id, isDeleted: false } });
    
    if (!jenis) {
      return res.status(404).json({ 
        message: "Jenis Budidaya not found" 
      });
    }

    jenis.isDeleted = true;
    await jenis.save();
    res.status(200).json({ 
      message: "Jenis Budidaya deleted successfully" 
    });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error deleting Jenis Budidaya", error });
  }
};

module.exports = {
  getAllJenisBudidaya,
  getJenisBudidayaById,
  createJenisBudidaya,
  updateJenisBudidaya,
  deleteJenisBudidaya,
};
