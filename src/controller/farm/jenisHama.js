const sequelize = require("../../model/index");
const { Op } = require("sequelize");
const JenisHama = sequelize.JenisHama;
const { dataValid } = require("../../validation/dataValidation");

const { getPaginationOptions } = require('../../utils/paginationUtils');

const getAlljenisHama = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const paginationOptions = getPaginationOptions(page, limit);

    const { count, rows } = await JenisHama.findAndCountAll({
      where: {
        isDeleted: false,
      },
      order: [["createdAt", "DESC"]],
      ...paginationOptions,
    });

    if (rows.length === 0 && (parseInt(page, 10) || 1) === 1) {
      return res.status(200).json({
        message: "Data not found",
        data: [],
        totalItems: 0,
        totalPages: 0,
        currentPage: parseInt(page, 10) || 1,
      });
    }
    if (rows.length === 0 && (parseInt(page, 10) || 1) > 1) {
        return res.status(200).json({
            message: "No more data",
            data: [],
            totalItems: count,
            totalPages: Math.ceil(count / paginationOptions.limit),
            currentPage: parseInt(page, 10) || 1,
        });
    }

    return res.status(200).json({
      message: "Successfully retrieved all jenis hama data",
      data: rows,
      totalItems: count,
      totalPages: Math.ceil(count / paginationOptions.limit),
      currentPage: parseInt(page, 10) || 1,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};

const getjenisHamaSearch = async (req, res) => {
  try {
    const { nama } = req.params;
    const { page, limit } = req.query;
    const paginationOptions = getPaginationOptions(page, limit);

    const whereClause = {
      isDeleted: false,
    };
    if (nama && nama.toLowerCase() !== 'all' && nama.trim() !== '') {
      whereClause.nama = {
        [Op.like]: `%${nama}%`,
      };
    }

    const { count, rows } = await JenisHama.findAndCountAll({
      where: whereClause,
      order: [["createdAt", "DESC"]],
      ...paginationOptions,
    });

    if (rows.length === 0 && (parseInt(page, 10) || 1) === 1) {
      return res.status(200).json({
        message: "Data not found for the given search criteria",
        data: [],
        totalItems: 0,
        totalPages: 0,
        currentPage: parseInt(page, 10) || 1,
      });
    }
     if (rows.length === 0 && (parseInt(page, 10) || 1) > 1) {
        return res.status(200).json({
            message: "No more data for this search",
            data: [],
            totalItems: count,
            totalPages: Math.ceil(count / paginationOptions.limit),
            currentPage: parseInt(page, 10) || 1,
        });
    }

    return res.status(200).json({
      message: "Successfully retrieved jenis hama data",
      data: rows,
      totalItems: count,
      totalPages: Math.ceil(count / paginationOptions.limit),
      currentPage: parseInt(page, 10) || 1,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};

const getjenisHamaById = async (req, res) => {
  try {
    const data = await JenisHama.findOne({ 
      where: { 
        id: req.params.id,
        isDeleted: false
      } 
    });

    if (!data) {
      return res.status(404).json({
        message: "Data not found",
      });
    }
  
    return res.status(200).json({
      message: "Successfully retrieved jenis hama data",
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};

const createjenisHama = async (req, res) => {
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
    // const softDeleted = await JenisHama.findOne({
    //   where: {
    //     nama: req.body.nama,
    //     isDeleted: true,
    //   },
    // });

    // if (softDeleted) {
    //   softDeleted.isDeleted = false;
    //   await softDeleted.save();
    //   res.locals.createdData = softDeleted.toJSON();
    //   return res.status(200).json({
    //     message: "Successfully created jenis hama data",
    //     data: softDeleted,
    //   });
    // } else {
    //   const existing = await JenisHama.findOne({
    //     where: {
    //       nama: req.body.nama,
    //       isDeleted: false,
    //     },
    //   });

    //   if (existing) {
    //     return res.status(400).json({ message: 'Data already exists.' });
    //   }
    // }
    
    const data = await JenisHama.create(req.body);
    res.locals.createdData = data.toJSON();
    return res.status(201).json({
      message: "Successfully created new jenis hama data",
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};

const updatejenisHama = async (req, res) => {
  try {
    const data = await JenisHama.findOne({ where: { id: req.params.id, isDeleted: false } });
    if (!data) {
      return res.status(404).json({ message: "Data not found" });
    }
    await data.update(req.body);
    res.locals.updatedData = data.toJSON();
    return res.status(200).json({
      message: "Successfully updated jenis hama data",
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};

const deletejenisHama = async (req, res) => {
  try {
    const data = await JenisHama.findOne({ where: { id: req.params.id, isDeleted: false } });
    if (!data) {
      return res.status(404).json({ message: "Data not found" });
    }
    data.isDeleted = true;
    await data.save();
    res.locals.updatedData = data.toJSON();
    return res.status(200).json({ 
      message: "Successfully deleted jenis hama data",
      data: { id: req.params.id }
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};


module.exports = {
  getAlljenisHama,
  getjenisHamaById,
  getjenisHamaSearch,
  createjenisHama,
  updatejenisHama,
  deletejenisHama,
};