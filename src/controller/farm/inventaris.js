const e = require("express");
const sequelize = require("../../model/index");
const kategoriInventaris = require("../../model/farm/kategoriInventaris");
const { dataValid } = require("../../validation/dataValidation");
const db = sequelize.sequelize;
const Inventaris = sequelize.Inventaris;
const Op = sequelize.Sequelize.Op;

const getAllInventaris = async (req, res) => {
  try {
    const data = await Inventaris.findAll({
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
      message: "Successfully retrieved all inventaris data",
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
        isDeleted: false,
      },
    });

    if (!data || data.isDeleted) {
      return res.status(404).json({
        message: "Data not found",
      });
    }

    return res.status(200).json({
      message: "Successfully retrieved inventaris data",
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};

const getInventarisByName = async (req, res) => {
  try {
    const { nama } = req.params;

    const data = await Inventaris.findAll({
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
      message: "Successfully retrieved inventaris data",
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
  // const valid = {
  //   satuanId: "required",
  //   kategoriInventarisId: "required",
  //   nama: "required",
  //   gambar: "required",
  //   jumlah: "required",
  // };
  // const validation = await dataValid(valid, req.body);
  // if (validation.message.length > 0) {
  //   return res.status(400).json({
  //     error: validation.message,
  //     message: "Validation error",
  //   });
  // }

  try {
    const data = await Inventaris.create({
      SatuanId: req.body.satuanId,
      KategoriInventarisId: req.body.kategoriInventarisId,
      ...req.body,
    });

    res.locals.createdData = data.toJSON();

    return res.status(201).json({
      message: "Successfully created new inventaris data",
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
    const data = await Inventaris.findOne({
      where: { id: req.params.id, isDeleted: false },
    });

    if (!data || data.isDeleted) {
      return res.status(404).json({
        message: "Data not found",
      });
    }

    await Inventaris.update(req.body, {
      where: {
        id: req.params.id,
      },
    });

    const updated = await Inventaris.findOne({ where: { id: req.params.id } });

    res.locals.updatedData = updated.toJSON();

    return res.status(200).json({
      message: "Successfully updated inventaris data",
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
    const data = await Inventaris.findOne({
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
      message: "Successfully deleted inventaris data",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};

module.exports = {
  getAllInventaris,
  getInventarisById,
  getInventarisByName,
  createInventaris,
  updateInventaris,
  deleteInventaris,
};
