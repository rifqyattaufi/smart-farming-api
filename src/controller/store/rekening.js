const sequelize = require("../../model/index");
const Rekening = sequelize.Rekening;

const getRekeningById = async (req, res) => {
  try {
    const data = await Rekening.findOne({
      where: {
        id: req.params.id,
        isDeleted: false,
      },
    });

    if (!data) {
      return res.status(404).json({
        message: "Rekening not found",
      });
    }

    return res.status(200).json({
      message: "Successfully retrieved rekening data",
      data: data,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};

const createRekening = async (req, res) => {
  try {
    const { nomorRekening, namaBank, namaPenerima } = req.body;

    if (!nomorRekening || !namaBank || !namaPenerima) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }
    const data = await Rekening.create({
      nomorRekening,
      namaBank,
      namaPenerima,
      UserId: req.user.id,
    });
    return res.status(201).json({
      message: "Successfully created new rekening data",
      data: data,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};

const updateRekening = async (req, res) => {
  try {
    const data = await Rekening.findOne({
      where: {
        Userid: req.user.id,
        isDeleted: false
      },
    });

    if (!data) {
      return res.status(404).json({
        message: "Rekening not found",
      });
    }

    await Rekening.update(req.body, {
      where: {
        Userid: req.user.id,
      },
    });

    const updated = await Rekening.findOne({ where: { Userid: req.user.id } });

    return res.status(200).json({
      message: "Successfully updated rekening data",
      data: updated,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};

const getRekeningByUserId = async (req, res) => {
  try {

    const rekening = await Rekening.findOne({
      where: {
        UserId: req.user.id,
        isDeleted: false,
      },
    });

    if (rekening === null) {
      return res.status(404).json({
        message: "Rekening not found for this user",
      });
    }

    return res.status(200).json({
      message: "Successfully retrieved rekening data for user",
      data: rekening,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};

module.exports = {
  getRekeningById,
  createRekening,
  updateRekening,
  getRekeningByUserId,
};
