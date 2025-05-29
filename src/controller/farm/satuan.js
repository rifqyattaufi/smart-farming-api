const sequelize = require("../../model/index");
const Op = sequelize.Sequelize.Op;
const Satuan = sequelize.Satuan;
const { dataValid } = require("../../validation/dataValidation");
const { getPaginationOptions } = require('../../utils/paginationUtils');

const getAllSatuan = async (req, res) => {
  try {
    const { page, limit, nama, lambang } = req.query;
    const paginationOptions = getPaginationOptions(page, limit);

    const whereClause = { isDeleted: false };
    if (nama && nama.trim() !== '') {
      whereClause.nama = { [Op.like]: `%${nama}%` };
      whereClause.lambang = { [Op.like]: `%${nama}%` };
    }

    const { count, rows } = await Satuan.findAndCountAll({
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
      message: "Successfully retrieved all satuan data",
      data: rows,
      totalItems: count,
      totalPages: totalPages,
      currentPage: currentPageNum,
    });
  }
  catch (error) {
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

const getSatuanSearch = async (req, res) => {
  try {
    const { nama, lambang } = req.params;
    const { page, limit } = req.query;
    const paginationOptions = getPaginationOptions(page, limit);

    const { count, rows } = await Satuan.findAndCountAll({
      where: {
        [Op.or]: [
          { nama: { [Op.like]: `%${nama}%` } },
          { lambang: { [Op.like]: `%${lambang}%` } },
        ],
        isDeleted: false,
      },
      order: [["createdAt", "DESC"]],
      ...paginationOptions,
    });

    const currentPageNum = parseInt(page, 10) || 1;
    const totalPages = rows.length > 0 ? Math.ceil(await Satuan.count({ where: { [Op.or]: [{ nama: { [Op.like]: `%${nama}%` } }, { lambang: { [Op.like]: `%${lambang}%` } }], isDeleted: false } }) / (paginationOptions.limit || parseInt(limit, 10) || 10)) : 0;

    if (rows.length === 0) {
      return res.status(200).json({ 
        message: currentPageNum > 1 ? "No more data for this search" : "Data not found for this search",
        data: [],
        totalItems: totalPages,
        currentPage: currentPageNum,
      });
    }

    return res.status(200).json({
      message: "Successfully retrieved grade data",
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
    const softDeleted = await Satuan.findOne({
      where: {
        nama: req.body.nama,
        isDeleted: 1,
      },
    });

    if (softDeleted) {
      softDeleted.isDeleted = 0;
      softDeleted.lambang = req.body.lambang || softDeleted.lambang;
      await softDeleted.save();
      return res.status(200).json({ message: 'Data already exists before, successfully restored satuan data' });
    } else {
      const existing = await Satuan.findOne({
        where: {
          nama: req.body.nama,
          isDeleted: 0,
        },
      });

      if (existing) {
        return res.status(400).json({ message: 'Data already exists.' });
      }
    }
    
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
  getSatuanSearch,
  createSatuan,
  updateSatuan,
  deleteSatuan,
};
