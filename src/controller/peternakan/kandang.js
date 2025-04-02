const { where } = require("sequelize");
const Kandang = require("../../model/peternakan/kandang");

const getAllKandang = async (req, res) => {
  try {
    const data = await Kandang.findAll({
      order: [["createdAt", "ASC"]],
      where: {
        kategori: req.body.kategori,
      },
    });

    return res.json({
      message: "Success",
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};

const createKandang = async (req, res) => {
  try {
    const data = await Kandang.create(req.body);

    return res.status(201).json({
      message: "Kandang created",
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
  getAllKandang,
  createKandang,
};
