const e = require("express");
const sequelize = require("../../model/index");
const { get } = require("../../routes/farm/satuan");
const db = sequelize.sequelize;
const KategoriInventaris = sequelize.KategoriInventaris;
const Op = sequelize.Sequelize.Op;

const getAllkategoriInventaris = async (req, res) => {
  try {
    const data = await KategoriInventaris.findAll({
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
      message: "Successfully retrieved all kategori inventaris data",
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

    if (!data || data.isDeleted) {
      return res.status(404).json({
        message: "Data not found",
      });
    }

    return res.status(200).json({
      message: "Successfully retrieved kategori inventaris data",
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};

const getkategoriInventarisByName = async (req, res) => {
  try {
    const { nama } = req.params;

    const data = await KategoriInventaris.findAll({
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
      message: "Successfully retrieved kategori inventaris data",
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
      message: "Successfully created new kategori inventaris data",
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
    const data = await KategoriInventaris.findOne({ where: { id: req.params.id, isDeleted: false } });

    if (!data || data.isDeleted) {
      return res.status(404).json({
        message: "Data not found",
      });
    }

    await KategoriInventaris.update(req.body, {
      where: {
        id: req.params.id,
      },
    });

    const updated = await KategoriInventaris.findOne({ where: { id: req.params.id } });

    res.locals.updatedData = updated.toJSON();

    return res.status(200).json({
      message: "Successfully updated kategori inventaris data",
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
    
    if (!data || data.isDeleted) {
      return res.status(404).json({ 
        message: "Data not found" 
      });
    }

    data.isDeleted = true;
    await data.save();

    res.locals.updatedData = data;

    return res.status(200).json({ 
      message: "Successfully deleted kategori inventaris data",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};

module.exports = {
  getAllkategoriInventaris,
  getkategoriInventarisById,
  getkategoriInventarisByName,
  createkategoriInventaris,
  updatekategoriInventaris,
  deletekategoriInventaris,
};
