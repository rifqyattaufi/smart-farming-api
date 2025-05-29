const sequelize = require("../../model/index");
const Op = sequelize.Sequelize.Op;
const Grade = sequelize.Grade;
const { dataValid } = require("../../validation/dataValidation");
const { getPaginationOptions } = require('../../utils/paginationUtils');

const getAllGrade = async (req, res) => {
  try {
    const { page, limit, nama } = req.query;
    const paginationOptions = getPaginationOptions(page, limit);
    
    const whereClause = { isDeleted: false };
    if (nama && nama.trim() !== '') {
      whereClause.nama = { [Op.like]: `%${nama}%` };
    }

    const { count, rows } = await Grade.findAndCountAll({
      where: whereClause,
      order: [["createdAt", "DESC"]],
      ...paginationOptions,
    });

    const currentPageNum = parseInt(page, 10) || 1;
    const totalPages = Math.ceil(count / (paginationOptions.limit || parseInt(limit, 10) || 10));

    if (rows.length === 0) {
      return res.status(200).json({
        message: currentPageNum > 1 ? "No more data" : "Data not found",
        data: [],
        totalItems: count,
        totalPages: totalPages,
        currentPage: currentPageNum,
      });
    }

    return res.status(200).json({
      message: "Successfully retrieved all grade data",
      data: rows,
      totalItems: count,
      totalPages: totalPages,
      currentPage: currentPageNum,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};

const getGradeById = async (req, res) => {
  try {
    const data = await Grade.findOne({
      where: { id: req.params.id, isDeleted: false },
    });

    if (!data || data.isDeleted) {
      return res.status(404).json({
        message: "Data not found",
      });
    }

    return res.status(200).json({
      message: "Successfully retrieved grade data",
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};

const getGradeBySearch = async (req, res) => {
  try {
    const { nama } = req.params;
    const { page, limit } = req.query;
    const paginationOptions = getPaginationOptions(page, limit);

    const { count, rows } = await Grade.findAndCountAll({
      where: {
        nama: { [Op.like]: `%${nama}%` },
        isDeleted: false,
      },
      order: [["createdAt", "DESC"]],
      ...paginationOptions,
    });
    
    const currentPageNum = parseInt(page, 10) || 1;
    const totalPages = rows.length > 0 ? Math.ceil(await Grade.count({ where: {nama: { [Op.like]: `%${nama}%` }, isDeleted: false} }) / (paginationOptions.limit || parseInt(limit, 10) || 10)) : 0;


    if (rows.length === 0) {
      return res.status(200).json({ 
        message: currentPageNum > 1 ? "No more data for this name" : "Data not found for this name",
        data: [],
        totalItems: totalPages,
        currentPage: currentPageNum,
      });
    }

    return res.status(200).json({
      message: "Successfully retrieved grade data by name",
      data: rows,
      totalItems: count,
      totalPages: totalPages,
      currentPage: currentPageNum,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};

const createGrade = async (req, res) => {
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
    // const softDeleted = await Grade.findOne({
    //   where: {
    //     nama: req.body.nama,
    //     isDeleted: 1,
    //   },
    // });

    // if (softDeleted) {
    //   softDeleted.isDeleted = 0;
    //   await softDeleted.save();
    //   return res.status(200).json({ message: 'Data already exists before, successfully restored grade data' });
    // } else {
    //   const existing = await Grade.findOne({
    //     where: {
    //       nama: req.body.nama,
    //       isDeleted: 0,
    //     },
    //   });

    //   if (existing) {
    //     return res.status(400).json({ message: 'Data already exists.' });
    //   }
    // }
    
    const data = await Grade.create(req.body);

    res.locals.createdData = data.toJSON();

    return res.status(201).json({
      message: "Successfully created new grade data",
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};

const updateGrade = async (req, res) => {
  try {
    const data = await Grade.findOne({
      where: { id: req.params.id, isDeleted: false },
    });

    if (!data || data.isDeleted) {
      return res.status(404).json({
        message: "Data not found",
      });
    }

    await Grade.update(req.body, {
      where: {
        id: req.params.id,
      },
    });

    const updated = await Grade.findOne({ where: { id: req.params.id } });

    res.locals.updatedData = updated.toJSON();

    return res.status(200).json({
      message: "Successfully updated grade data",
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

const deleteGrade = async (req, res) => {
  try {
    const data = await Grade.findOne({
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
      message: "Successfully deleted grade data",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};

module.exports = {
  getAllGrade,
  getGradeById,
  getGradeBySearch,
  createGrade,
  updateGrade,
  deleteGrade,
};
