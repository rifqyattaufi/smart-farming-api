const e = require("express");
const sequelize = require("../../model/index");
const { Op } = require("sequelize");
const db = sequelize.sequelize;
const JenisBudidaya = sequelize.JenisBudidaya;

const getAllJenisBudidaya = async (req, res) => {
  try {
    const data = await JenisBudidaya.findAll({
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
      message: "Successfully retrieved all jenis budidaya data",
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
    const data = await JenisBudidaya.findOne({
      where: { id: req.params.id, isDeleted: false },
    });

    if (!data || data.isDeleted) {
      return res.status(404).json({
        message: "Data not found",
      });
    }

    return res.status(200).json({
      message: "Successfully retrieved jenis budidaya data",
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};

const getJenisBudidayaByName = async (req, res) => {
  try {
    const { nama, tipe } = req.params;

    const data = await JenisBudidaya.findAll({
      where: {
        nama: {
          [Op.like]: `%${nama}%`,
        },
        tipe: tipe,
        isDeleted: false,
      },
    });

    if (data.length === 0) {
      return res.status(404).json({ message: "Data not found" });
    }

    return res.status(200).json({
      message: "Successfully retrieved jenis budidaya data",
      data: data,
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

    res.locals.createdData = data.toJSON();

    return res.status(201).json({
      message: "Successfully created new jenis budidaya data",
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
    const data = await JenisBudidaya.findOne({
      where: { id: req.params.id, isDeleted: false },
    });

    if (!data || data.isDeleted) {
      return res.status(404).json({
        message: "Data not found",
      });
    }

    await JenisBudidaya.update(req.body, {
      where: {
        id: req.params.id,
      },
    });

    const updated = await JenisBudidaya.findOne({
      where: { id: req.params.id },
    });

    res.locals.updatedData = updated.toJSON();

    return res.status(200).json({
      message: "Successfully updated jenis budidaya data",
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
    const data = await JenisBudidaya.findOne({
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
      message: "Jenis Budidaya deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};

const getJenisBudidayaByTipe = async (req, res) => {
  try {
    const { tipe } = req.params;

    const data = await JenisBudidaya.findAll({
      where: {
        tipe: {
          [Op.like]: `%${tipe}%`,
        },
        isDeleted: false,
      },
    });

    if (data.length === 0) {
      return res.status(404).json({ message: "Data not found" });
    }

    return res.status(200).json({
      message: "Successfully retrieved jenis budidaya data",
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};

module.exports = {
  getAllJenisBudidaya,
  getJenisBudidayaById,
  getJenisBudidayaByName,
  createJenisBudidaya,
  updateJenisBudidaya,
  deleteJenisBudidaya,
  getJenisBudidayaByTipe,
};
