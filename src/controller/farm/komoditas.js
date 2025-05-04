const e = require("express");
const sequelize = require("../../model/index");
const db = sequelize.sequelize;
const Komoditas = sequelize.Komoditas;
const Op = sequelize.Sequelize.Op;

const getAllKomoditas = async (req, res) => {
  try {
    const data = await Komoditas.findAll({
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
      message: "Successfully retrieved all komoditas data",
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};

const getKomoditasById = async (req, res) => {
  try {
    const data = await Komoditas.findOne({
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
      message: "Successfully retrieved komoditas data",
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};

const getKomoditasByName = async (req, res) => {
  try {
    const { nama, tipe } = req.params;

    const data = await Komoditas.findAll({
      include: [
        {
          model: sequelize.JenisBudidaya,
          required: true,
          where: {
            tipe: tipe,
          },
        },
      ],
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
      message: "Successfully retrieved komoditas data",
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};

const getKomoditasByTipe = async (req, res) => {
  try {
    const { tipe } = req.params;

    const data = await Komoditas.findAll({
      include: [
        {
          model: sequelize.JenisBudidaya,
          required: true,
          where: {
            tipe: tipe,
          },
        },
      ],
      where: {
        isDeleted: false,
      },
    });

    if (data.length === 0) {
      return res.status(404).json({ message: "Data not found" });
    }

    return res.status(200).json({
      message: "Successfully retrieved komoditas data",
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};

const createKomoditas = async (req, res) => {
  try {
    const data = await Komoditas.create({
      ...req.body,
      SatuanId: req.body.satuanId,
      JenisBudidayaId: req.body.jenisBudidayaId,
    });

    res.locals.createdData = data.toJSON();

    return res.status(201).json({
      message: "Successfully created new komoditas data",
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};

const updateKomoditas = async (req, res) => {
  try {
    const data = await Komoditas.findOne({
      where: { id: req.params.id, isDeleted: false },
    });

    if (!data || data.isDeleted) {
      return res.status(404).json({
        message: "Data not found",
      });
    }

    await Komoditas.update(req.body, {
      where: {
        id: req.params.id,
      },
    });

    const updated = await Komoditas.findOne({ where: { id: req.params.id } });

    res.locals.updatedData = updated.toJSON();

    return res.status(200).json({
      message: "Successfully updated komoditas data",
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

const deleteKomoditas = async (req, res) => {
  try {
    const data = await Komoditas.findOne({
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
      message: "Successfully deleted komoditas data",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};

module.exports = {
  getAllKomoditas,
  getKomoditasById,
  getKomoditasByName,
  createKomoditas,
  updateKomoditas,
  deleteKomoditas,
  getKomoditasByTipe,
};
