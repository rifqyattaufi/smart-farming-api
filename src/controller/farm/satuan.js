const e = require("express");
const sequelize = require("../../model/index");
const { dataValid } = require("../../validation/dataValidation");
const db = sequelize.sequelize;
const Satuan = sequelize.Satuan;
const Op = sequelize.Sequelize.Op;

const getAllSatuan = async (req, res) => {
  try {
    const data = await Satuan.findAll({
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
      message: "Successfully retrieved all satuan data",
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};

const getSatuanById = async (req, res) => {
  try {
    const data = await Satuan.findOne({
      where: { id: req.params.id, isDeleted: false },
    });

    if (!data || data.isDeleted) {
      return res.status(404).json({
        message: "Data not found",
      });
    }

    return res.status(200).json({
      message: "Successfully retrieved satuan data",
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};

const getSatuanByName = async (req, res) => {
  try {
    const { nama } = req.params;

    const data = await Satuan.findAll({
      where: {
        [Op.or]: [
          { nama: { [Op.like]: `%${nama}%` } },
          { lambang: { [Op.like]: `%${nama}%` } },
        ],
        isDeleted: false,
      },
    });

    if (data.length === 0) {
      return res.status(404).json({ message: "Data not found" });
    }

    return res.status(200).json({
      message: "Successfully retrieved satuan data",
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};

const createSatuan = async (req, res) => {
  const valid = {
    nama: "required",
    lambang: "required",
  };
  const validation = await dataValid(valid, req.body);
  if (validation.message.length > 0) {
    return res.status(400).json({
      error: validation.message,
      message: "Validation error",
    });
  }

  try {
    const data = await Satuan.create(req.body);

    res.locals.createdData = data.toJSON();

    return res.status(201).json({
      message: "Successfully created new satuan data",
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};

const updateSatuan = async (req, res) => {
  try {
    const data = await Satuan.findOne({
      where: { id: req.params.id, isDeleted: false },
    });

    if (!data || data.isDeleted) {
      return res.status(404).json({
        message: "Data not found",
      });
    }

    await Satuan.update(req.body, {
      where: {
        id: req.params.id,
      },
    });

    const updated = await Satuan.findOne({ where: { id: req.params.id } });

    res.locals.updatedData = updated.toJSON();

    return res.status(200).json({
      message: "Successfully updated satuan data",
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

const deleteSatuan = async (req, res) => {
  try {
    const data = await Satuan.findOne({
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
      message: "Successfully deleted satuan data",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};

module.exports = {
  getAllSatuan,
  getSatuanById,
  getSatuanByName,
  createSatuan,
  updateSatuan,
  deleteSatuan,
};
