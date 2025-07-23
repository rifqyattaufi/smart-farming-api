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
      data: [data],
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};

const getTokoByUserId = async (req, res) => {
  try {

    const toko = await Toko.findOne({
      where: {
        UserId: req.user.id,
        isDeleted: false,
      },
    });

    if (!toko) {
      return res.status(404).json({
        message: "Toko not found for this user",
      });
    }

    return res.status(200).json({
      message: "Successfully retrieved toko data for user",
      data: [toko],
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
}
const getTokoByIdUser = async (req, res) => {
  try {

    const toko = await Toko.findOne({
      where: {
        UserId: req.params.id,
        isDeleted: false,
      },
    });

    if (!toko) {
      return res.status(404).json({
        message: "Toko not found for this user",
      });
    }

    return res.status(200).json({
      message: "Successfully retrieved toko data for user",
      data: [toko],
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
}
const getTokoByType = async (req, res) => {
  try {
    const data = await Toko.findAll({
      where: {
        TypeToko: 'rfc',
        isDeleted: false,
      },
    });
    if (data.length === 0) {
      return res.status(404).json({
        message: "No toko found with type RFC",
      });
    }
    return res.status(200).json({
      message: "Successfully retrieved all toko with type RFC",
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};
const createTokoWithTypeTokoRFC = async (req, res) => {
  try {
    const { nama, phone, alamat, logoToko, deskripsi } = req.body;

    if (!nama || !phone || !alamat) {
      return res.status(400).json({
        message: "nama, phone, and alamat are required",
      });
    }

    const data = await Toko.create({
      nama,
      phone,
      alamat,
      logoToko,
      deskripsi,
      TypeToko: 'rfc',
      UserId: req.user.id,
    });

    return res.status(201).json({
      message: "Successfully created new toko with type RFC",
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

    if (!nama || !phone || !alamat) {
      return res.status(400).json({
        message: "nama, phone, and alamat are required",
      });
    }

    const data = await Toko.create({
      nama,
      phone,
      alamat,
      logoToko,
      deskripsi,
      UserId: req.user.id,
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

const updateRFC = async (req, res) => {
  try {
    const { tokoId, nama, phone, alamat, logoToko, deskripsi } = req.body;
    if (!tokoId || !nama || !phone || !alamat || !deskripsi || !logoToko) {
      return res.status(400).json({
        message: "tokoId, nama, phone, alamat, deskripsi, and logoToko are required",
      });
    }
    const data = await Toko.findOne({
      where: { id: tokoId, isDeleted: false },
    })
    if (!data) {
      return res.status(404).json({
        message: "Toko not found",
      }); 
    }   
    await Toko.update(
      { nama, phone, alamat, logoToko, deskripsi },
      { where: { id: tokoId } }
    );
    const updated = await Toko.findOne({ where: { id: tokoId, isDeleted: false } });
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

 const StatusToko = async (req, res) => {
  try {
    const {  isDeleted } = req.body;
    const toko = await Toko.findOne({
      where: {
        id: req.params.id,
      },
    });

    if (!toko) {
      return res.status(404).json({
        message: "Toko not found for this user",
      });
    }
    toko.isDeleted = isDeleted;
    await toko.save();
    if (isDeleted) {
      return res.status(200).json({
        message: "Successfully change status toko",
        data: toko,
      });
    }
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
        UserId: req.params.id,
        isDeleted: false,
      },
    });

    if (!data) {
      return res.status(404).json({
        message: "Toko not found",
      });
    }

    await Toko.update(req.body, {
      where: {
        UserId: req.params.id,
      },
    });

    const updated = await Toko.findOne({ where: { UserId: req.user.id, } });

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
        tokoStatus: 'request',
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

    toko.isDeleted = true;
    await toko.save();

    return res.status(200).json({
      message: "Toko Delete successfully",
      data: toko,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};
const changeTokoType = async (req, res) => {
  try {
    const toko = await Toko.findOne({
      where: {
        id: req.params.id,
        isDeleted: false,
      },
    });

    if (!toko) {
      return res.status(404).json({
        message: "Toko not found",
      });
    }

    if (toko.TypeToko === 'rfc') {
      return res.status(400).json({
        message: "Toko is already classified as RFC",
      });
    }

    toko.TypeToko = 'rfc';
    await toko.save();

    return res.status(200).json({
      message: "Successfully changed toko type to RFC",
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
  getTokoByType,
  getTokoByUserId,
  updateRFC,
  StatusToko,
  getTokoByIdUser,
  createTokoWithTypeTokoRFC,
  createToko,
  updateToko,
  deleteToko,
  activateToko,
  rejectToko,
  banToko,
  changeTokoType,
};
