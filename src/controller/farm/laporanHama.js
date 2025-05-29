const sequelize = require("../../model/index");
const { Op } = require("sequelize");
const Laporan = sequelize.Laporan;
const Hama = sequelize.Hama;
const JenisHama = sequelize.JenisHama;
const UnitBudidaya = sequelize.UnitBudidaya;
const ObjekBudidaya = sequelize.ObjekBudidaya;
const User = sequelize.User;

const { getPaginationOptions } = require('../../utils/paginationUtils');

const getAllLaporanHama = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const paginationOptions = getPaginationOptions(page, limit);

    const { count, rows } = await Laporan.findAndCountAll({
      where: {
        tipe: "hama",
        isDeleted: false,
      },
      include: [
        {
          model: Hama,
          required: true,
          include: [{ model: JenisHama, attributes: ["id", "nama"] }],
        },
        {
          model: UnitBudidaya,
          attributes: ["id", "nama"],
          required: false,
        },
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "avatarUrl"],
        }
      ],
      order: [["createdAt", "DESC"]],
      distinct: true,
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
      message: "Successfully retrieved all hama reports",
      data: rows,
      totalItems: count,
      totalPages: Math.ceil(count / paginationOptions.limit),
      currentPage: parseInt(page, 10) || 1,
    });
  } catch (error) {
    console.error("Error getAllLaporanHama:", error);
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};

const searchLaporanHama = async (req, res) => {
  try {
    const { query } = req.params;
    const { page, limit } = req.query;
    const paginationOptions = getPaginationOptions(page, limit);

    const searchCondition = {
        [Op.or]: [
            { judul: { [Op.like]: `%${query}%` } },
            { catatan: { [Op.like]: `%${query}%` } },
            { "$JenisHama.nama$": { [Op.like]: `%${query}%` } },
            { "$UnitBudidaya.nama$": { [Op.like]: `%${query}%` } },
            { "$User.name$": { [Op.like]: `%${query}%` } },
        ],
    };

    const { count, rows } = await Laporan.findAndCountAll({
      where: {
        tipe: "hama",
        isDeleted: false,
        ...searchCondition,
      },
      include: [
        {
          model: Hama,
          required: true,
          include: [{ model: JenisHama, attributes: ["id", "nama", "gambar"] }],
        },
        {
          model: UnitBudidaya,
          attributes: ["id", "nama"],
          required: false,
        },
        {
          model: User,
          attributes: ["id", "name"],
          required: false,
        }
      ],
      order: [["createdAt", "DESC"]],
      distinct: true,
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
      message: "Successfully retrieved hama reports matching the search criteria",
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

const getLaporanHamaById = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await Laporan.findOne({
            where: { id: id, tipe: "hama", isDeleted: false },
            include: [
                {
                  model: Hama,
                  required: true,
                  include: [{ model: JenisHama }],
                },
                { model: UnitBudidaya, required: false },
                { model: ObjekBudidaya, required: false },
                { model: User, as: 'user', attributes: ['id', 'name'], required: false }
            ],
        });

        if (!data) {
            return res.status(404).json({ message: "Data not found" });
        }
        return res.status(200).json({ message: "Successfully retrieved hama report", data: data });
    } catch (error) {
        res.status(500).json({ message: error.message, detail: error });
    }
};


module.exports = {
  getAllLaporanHama,
  searchLaporanHama,
  getLaporanHamaById,
};