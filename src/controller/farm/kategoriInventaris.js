const e = require("express");
const sequelize = require("../../model/index");
const { get } = require("../../routes/farm/satuan");
const { dataValid } = require("../../validation/dataValidation");
const db = sequelize.sequelize;
const KategoriInventaris = sequelize.KategoriInventaris;
const Op = sequelize.Sequelize.Op;

const getAllKategoriInventaris = async (req, res) => {
  try {
    const data = await KategoriInventaris.findAll({
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

const getKategoriInventarisById = async (req, res) => {
  try {
    const data = await KategoriInventaris.findOne({
      where: {
        id: req.params.id,
        isDeleted: false,
      },
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

const getKategoriInventarisByName = async (req, res) => {
  try {
    const { nama } = req.params;

    const data = await KategoriInventaris.findAll({
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

const createKategoriInventaris = async (req, res) => {
  const valid = {
    nama: "required",
  };
  const validation = await dataValid(valid, req.body);
  if (validation.message.length > 0) {
    return res.status(400).json({
      error: validation.message,
      message: "Validation error",
    });
  }
  try {
    const softDeleted = await KategoriInventaris.findOne({
      where: {
        nama: req.body.nama,
        isDeleted: 1,
      },
    });

    if (softDeleted) {
      softDeleted.isDeleted = 0;
      await softDeleted.save();
      return res.status(200).json({ message: 'Data already exists before, successfully restored kategori inventaris data' });
    } else {
      const existing = await KategoriInventaris.findOne({
        where: {
          nama: req.body.nama,
          isDeleted: 0,
        },
      });

      if (existing) {
        return res.status(400).json({ message: 'Data already exists.' });
      }
    }

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

const updateKategoriInventaris = async (req, res) => {
  try {
    const data = await KategoriInventaris.findOne({
      where: { id: req.params.id, isDeleted: false },
    });

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

    const updated = await KategoriInventaris.findOne({
      where: { id: req.params.id },
    });

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

const deleteKategoriInventaris = async (req, res) => {
  try {
    const data = await KategoriInventaris.findOne({
      where: { id: req.params.id, isDeleted: false },
    });

    if (!data || data.isDeleted) {
      return res.status(404).json({
        message: "Data not found",
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
  getAllKategoriInventaris,
  getKategoriInventarisById,
  getKategoriInventarisByName,
  createKategoriInventaris,
  updateKategoriInventaris,
  deleteKategoriInventaris,
};
