const e = require("express");
const sequelize = require("../model/index");
const db = sequelize.sequelize;
const JenisBudidaya = sequelize.JenisBudidaya;

const getAllJenisBudidaya = async (req, res) => {
    try {
        const data = await JenisBudidaya.findAll();
        
        console.log(JenisBudidaya);
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

const createJenisBudidaya = async (req, res) => {
  try {
    const data = await JenisBudidaya.create(req.body);

    return res.status(201).json({
      message: "Jenis Budidaya created",
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
    await JenisBudidaya.update(req.body, {
      where: {
        id: req.params.id,
      },
    });

    return res.status(201).json({
      message: "Jenis Budidaya updated",
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
    const jenisBudidaya = await JenisBudidaya.findOne({ where: { id: req.params.id, isDeleted: false } });
    
    if (!jenisBudidaya) {
        return res.status(404).json({ message: "JenisBudidaya not found" });
    }

    jenisBudidaya.isDeleted = true;
    await jenisBudidaya.save();
    res.status(200).json({ message: "JenisBudidaya deleted successfully" });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error deleting JenisBudidaya", error });
  }
  // try {
  //   await JenisBudidaya.destroy({
  //     where: {
  //       id: req.params.id,
  //     },
  //   });

  //   return res.json({
  //     message: "Jenis Budidaya deleted",
  //     data: null,
  //   });
  // } catch (error) {
  //   res.status(500).json({
  //     message: error.message,
  //     detail: error,
  //   });
  // }
};

module.exports = {
  getAllJenisBudidaya,
  createJenisBudidaya,
  updateJenisBudidaya,
  deleteJenisBudidaya,
};
