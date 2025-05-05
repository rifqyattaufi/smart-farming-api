const e = require("express");
const sequelize = require("../../model/index");
const db = sequelize.sequelize;
const JenisHama = sequelize.JenisHama;
const Op = sequelize.Sequelize.Op;

const getAlljenisHama = async (req, res) => {
  try {
    const data = await JenisHama.findAll({
      where: {
        isDeleted: false,
      },
      order: [["createdAt", "DESC"]],
    });

    if (data.length === 0) {
      return res.status(404).json({
        message: "Data not found",
      });
    }
      
    return res.status(200).json({
      message: "Successfully retrieved all jenis hama data",
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

    if (!data || data.isDeleted) {
      return res.status(404).json({
        message: "Data not found",
      });
    }

    return res.status(200).json({
      message: "Successfully retrieved jenis hama data",
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};

const getjenisHamaByName = async (req, res) => {
  try {
    const { nama } = req.params;

    const data = await JenisHama.findAll({
      where: {
        nama: {
          [Op.like]: `%${nama}%`,
        },
        isDeleted: false,
      },
      order: [["createdAt", "DESC"]],
    });

    if (data.length === 0) {
      return res.status(404).json({ message: "Data not found" });
    }

    return res.status(200).json({
      message: "Successfully retrieved jenis hama data",
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
      message: "Successfully created new jenis hama data",
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
    const data = await JenisHama.findOne({ where: { id: req.params.id, isDeleted: false } });

    if (!data || data.isDeleted) {
      return res.status(404).json({
        message: "Data not found",
      });
    }

    await JenisHama.update(req.body, {
      where: {
        id: req.params.id,
      },
    });

    const updated = await JenisHama.findOne({ where: { id: req.params.id } });

    res.locals.updatedData = updated.toJSON();

    return res.status(200).json({
      message: "Successfully updated jenis hama data",
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
    
    if (!data || data.isDeleted) {
      return res.status(404).json({ 
        message: "Data not found" 
      });
    }

    data.isDeleted = true;
    await data.save();

    res.locals.updatedData = data;

    return res.status(200).json({ 
      message: "Successfully deleted jenis hama data",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};

module.exports = {
  getAlljenisHama,
  getjenisHamaById,
  getjenisHamaByName,
  createjenisHama,
  updatejenisHama,
  deletejenisHama,
};
