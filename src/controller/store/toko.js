const sequelize = require("../../model/index");
const { dataValid } = require("../../validation/dataValidation");
const Toko = sequelize.Toko;
const Op = sequelize.Sequelize.Op;

const getAllToko = async (req, res) => {
  try {
    const data = await Toko.findAll({
      where: {
        isDeleted: false,
      },
    });

    if (data.length === 0) {
      return res.status(404).json({
        message: "No toko found",
      });
    }

    return res.status(200).json({
      message: "Successfully retrieved all toko data",
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};

const getTokoById = async (req, res) => {
  try {
    const data = await Toko.findOne({
      where: {
        id: req.params.id,
        isDeleted: false,
      },
    });

    if (!data) {
      return res.status(404).json({
        message: "Toko not found",
      });
    }

    return res.status(200).json({
      message: "Successfully retrieved toko data",
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};

const createToko = async (req, res) => {
  try {
    const { nama, phone, alamat, logoToko, deskripsi } = req.body;
    const UserId = req.user.id; // Assuming user ID is from JWT token

    // Validate required fields
    if (!nama || !phone || !alamat) {
      return res.status(400).json({
        message: "Nama, phone, and alamat are required",
      });
    }

    const data = await Toko.create({
      nama,
      phone,
      alamat,
      logoToko,
      deskripsi,
      UserId,
    });

    return res.status(201).json({
      message: "Successfully created new toko",
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};

const updateToko = async (req, res) => {
  try {
    const data = await Toko.findOne({
      where: {
        id: req.params.id,
        isDeleted: false,
      },
    });

    if (!data) {
      return res.status(404).json({
        message: "Toko not found",
      });
    }

    // Update toko details
    await Toko.update(req.body, {
      where: {
        id: req.params.id,
      },
    });

    const updated = await Toko.findOne({ where: { id: req.params.id } });

    return res.status(200).json({
      message: "Successfully updated toko",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};

const deleteToko = async (req, res) => {
  try {
    const data = await Toko.findOne({
      where: { id: req.params.id, isDeleted: false },
    });

    if (!data) {
      return res.status(404).json({
        message: "Toko not found",
      });
    }

    data.isDeleted = true;
    await data.save();

    return res.status(200).json({
      message: "Successfully deleted toko",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};
const activateToko = async (req, res) => {
  try {
    const toko = await Toko.findOne({
      where: {
        id: req.params.id,
        isDeleted: false,
        tokoStatus: 'request',
      },
    });

    if (!toko) {
      return res.status(404).json({
        message: "Toko not found or not in request status",
      });
    }

    toko.tokoStatus = 'active';
    await toko.save();

    return res.status(200).json({
      message: "Toko activated successfully",
      data: toko,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};
const rejectToko = async (req, res) => {
  try {
    const toko = await Toko.findOne({
      where: {
        id: req.params.id,
        isDeleted: false,
        tokoStatus: 'request',  // Status toko hanya bisa diubah menjadi reject jika statusnya masih 'request'
      },
    });

    if (!toko) {
      return res.status(404).json({
        message: "Toko not found or not in request status",
      });
    }

    toko.tokoStatus = 'reject';
    await toko.save();

    return res.status(200).json({
      message: "Toko rejected successfully",
      data: toko,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};
const banToko = async (req, res) => {
  try {
    const toko = await Toko.findOne({
      where: {
        id: req.params.id,
        isDeleted: false,
        tokoStatus: 'active',
      },
    });

    if (!toko) {
      return res.status(404).json({
        message: "Toko not found or already deleted",
      });
    }

    toko.tokoStatus = 'delete';
    await toko.save();

    return res.status(200).json({
      message: "Toko banned successfully",
      data: toko,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};


module.exports = {
  getAllToko,
  getTokoById,
  createToko,
  updateToko,
  deleteToko,
  activateToko,
  rejectToko,
  banToko,
};
