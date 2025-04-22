const e = require("express");
const sequelize = require("../../model/index");
const db = sequelize.sequelize;
const Hama = sequelize.Hama;
const Op = sequelize.Sequelize.Op;

const getAllHama = async (req, res) => {
  try {
    const data = await Hama.findAll({
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
      message: "Successfully retrieved all hama data",
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};

const getHamaById = async (req, res) => {
  try {
    const data = await Hama.findOne({ 
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
      message: "Successfully retrieved hama data",
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};

const getHamaByName = async (req, res) => {
  try {
    const { nama } = req.params;

    const data = await Hama.findAll({
      where: {
        nama: {
          [Op.like]: `%${nama}%`,
        },
        isDeleted: false,
      },
    });

    if (data.length === 0) {
      return res.status(404).json({ message: "Data not found" });
    }

    return res.status(200).json({
      message: "Successfully retrieved hama data",
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};

const createHama = async (req, res) => {
  try {
    const data = await JenisHama.create(req.body);

    res.locals.createdData = data.toJSON();

    return res.status(201).json({
      message: "Successfully created new hama data",
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};

const updateHama = async (req, res) => {
  try {
    const data = await JenisHama.findOne({ where: { id: req.params.id, isDeleted: false } });

    if (!data || data.isDeleted) {
      return res.status(404).json({
        message: "Data not found",
      });
    }

    await Hama.update(req.body, {
      where: {
        id: req.params.id,
      },
    });

    const updated = await Hama.findOne({ where: { id: req.params.id } });

    res.locals.updatedData = updated.toJSON();

    return res.status(200).json({
      message: "Successfully updated hama data",
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

const deleteHama = async (req, res) => {
  try {
    const data = await Hama.findOne({ where: { id: req.params.id, isDeleted: false } });
    
    if (!data || data.isDeleted) {
      return res.status(404).json({ 
        message: "Data not found" 
      });
    }

    data.isDeleted = true;
    await data.save();

    res.locals.updatedData = data;

    return res.status(200).json({ 
      message: "Successfully deleted hama data",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};

module.exports = {
  getAllHama,
  getHamaById,
  getHamaByName,
  createHama,
  updateHama,
  deleteHama,
};
