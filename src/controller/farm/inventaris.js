const { QueryTypes, Op } = require("sequelize");
const sequelize = require("../../model/index");
const db = sequelize.sequelize;
const Inventaris = sequelize.Inventaris;
const Satuan = sequelize.Satuan;
const Kategori = sequelize.KategoriInventaris;

const { getPaginationOptions } = require('../../utils/paginationUtils');

const getAllInventaris = async (req, res) => {
  try {
    const { page, limit, kategoriId, nama } = req.query;
    const paginationOptions = getPaginationOptions(page, limit);

    const whereClause = { isDeleted: false };
    if (kategoriId && kategoriId !== 'all' && kategoriId.trim() !== '') { 
      whereClause.KategoriInventarisId = kategoriId;
    }
    if (nama && nama.trim() !== '') {
      whereClause.nama = { [Op.like]: `%${nama}%` };
    }

    const { count, rows } = await Inventaris.findAndCountAll({
      where: whereClause,
      include: [
        { model: Kategori, as: "kategoriInventaris", attributes: ["id", "nama"] },
        { model: Satuan, attributes: ["id", "nama", "lambang"] },
      ],
      order: [["createdAt", "DESC"]],
      distinct: true,
      ...paginationOptions,
    });

    if (rows.length === 0 && (parseInt(page, 10) || 1) === 1) {
      return res.status(200).json({
        message: "Data not found", data: [], totalItems: 0, totalPages: 0, currentPage: parseInt(page, 10) || 1,
      });
    }
    if (rows.length === 0 && (parseInt(page, 10) || 1) > 1) {
        return res.status(200).json({
            message: "No more data", data: [], totalItems: count, totalPages: Math.ceil(count / paginationOptions.limit), currentPage: parseInt(page, 10) || 1,
        });
    }

    return res.status(200).json({
      message: "Successfully retrieved all inventaris data",
      data: rows,
      totalItems: count,
      totalPages: Math.ceil(count / paginationOptions.limit),
      currentPage: parseInt(page, 10) || 1,
    });
  } catch (error) {
    console.error("Error getAllInventaris:", error);
    res.status(500).json({ message: error.message, detail: error });
  }
};

const getInventarisById = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await Inventaris.findOne({
      where: {
        id: id,
        isDeleted: false,
      },
      include: [
        {
          model: Kategori,
          as: "kategoriInventaris",
          attributes: ["id", "nama"],
        },
        {
          model: Satuan,
          attributes: ["id", "nama", "lambang"],
        },
      ],
    });

    const daftarPemakaian = await db.query(
      `
      SELECT 
          pi.id,
          pi.jumlah,
          pi.createdAt,
          i.id AS inventarisId,
          i.nama AS inventarisNama,
          l.userId AS userId,
          l.gambar AS laporanGambar,
          u.name AS petugasNama,
          DATE_FORMAT(l.createdAt, '%W, %d %M %Y') AS laporanTanggal,
          DATE_FORMAT(l.createdAt, '%H:%i') AS laporanWaktu
      FROM 
          penggunaanInventaris pi
      JOIN 
          inventaris i ON pi.inventarisId = i.id
      JOIN 
          laporan l ON pi.laporanId = l.id
      JOIN
          user u ON l.userId = u.id
      WHERE 
          pi.isDeleted = FALSE
          AND i.isDeleted = FALSE
          AND i.id = :inventarisId
      ORDER BY 
          pi.createdAt DESC;
    `,
      {
        type: QueryTypes.SELECT,
        replacements: { inventarisId: id },
      }
    );

    const pemakaianPerMinggu = await db.query(
      `
      SELECT 
      YEARWEEK(pi.createdAt, 1) AS mingguKe,
      MIN(pi.createdAt) AS mingguAwal,
      SUM(pi.jumlah) AS stokPemakaian
      FROM 
          penggunaanInventaris pi
      JOIN 
          inventaris i ON pi.inventarisId = i.id
      WHERE 
          pi.isDeleted = FALSE
          AND i.isDeleted = FALSE
          AND i.id = :inventarisId
      GROUP BY 
          YEARWEEK(pi.createdAt, 1)
      ORDER BY 
          mingguAwal ASC
    `,
      {
        type: QueryTypes.SELECT,
        replacements: { inventarisId: id },
      }
    );

    if (!data || data.isDeleted) {
      return res.status(404).json({
        message: "Data not found",
      });
    }

    return res.status(200).json({
      message: "Successfully retrieved inventaris data",
      data: { data, daftarPemakaian, pemakaianPerMinggu },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};

const getInventarisByName = async (req, res) => {
  try {
    const { nama } = req.params;
    const { page, limit } = req.query;
    const paginationOptions = getPaginationOptions(page, limit);

    const { count, rows } = await Inventaris.findAndCountAll({
      where: {
        nama: { [Op.like]: `%${nama}%` },
        isDeleted: false,
      },
      include: [
        { model: Kategori, as: "kategoriInventaris", attributes: ["id", "nama"] },
        { model: Satuan, attributes: ["id", "nama", "lambang"] },
      ],
      order: [["createdAt", "DESC"]],
      distinct: true,
      ...paginationOptions,
    });

    if (rows.length === 0 && (parseInt(page, 10) || 1) === 1) {
      return res.status(200).json({
        message: "Data not found", data: [], totalItems: 0, totalPages: 0, currentPage: parseInt(page, 10) || 1,
      });
    }
    if (rows.length === 0 && (parseInt(page, 10) || 1) > 1) {
        return res.status(200).json({
            message: "No more data", data: [], totalItems: count, totalPages: Math.ceil(count / paginationOptions.limit), currentPage: parseInt(page, 10) || 1,
        });
    }

    return res.status(200).json({
      message: "Successfully retrieved inventaris data", data: rows, totalItems: count,
      totalPages: Math.ceil(count / paginationOptions.limit), currentPage: parseInt(page, 10) || 1,
    });
  } catch (error) {
    console.error("Error getInventaris:", error);
    res.status(500).json({ message: error.message, detail: error });
  }
};

const getInventarisByKategoriName = async (req, res) => {
  try {
    const { kategori } = req.params;

    const data = await Inventaris.findAll({
      include: [
        {
          model: Kategori,
          as: "kategoriInventaris",
          where: {
            nama: {
              [Op.like]: `%${kategori}%`,
            },
          },
          attributes: ["id", "nama"],
        },
      ],
      where: {
        isDeleted: false,
      },
      order: [["createdAt", "DESC"]],
    });

    if (data.length === 0) {
      return res.status(404).json({ message: "Data not found" });
    }

    return res.status(200).json({
      message: "Successfully retrieved inventaris data",
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};

const getInventarisByKategoriId = async (req, res) => {
  try {
    const { kategoriId } = req.params;
    const data = await Inventaris.findAll({
      where: {
        KategoriInventarisId: kategoriId,
        isDeleted: false,
      },
      include: [
        {
          model: Kategori,
          as: "kategoriInventaris",
          attributes: ["id", "nama"],
        },
        {
          model: Satuan,
          attributes: ["id", "nama", "lambang"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });
    
    if (data.length === 0) {
      return res.status(404).json({
        message: "Data not found",
      });
    }

    return res.status(200).json({
      message: "Successfully retrieved inventaris data by kategori",
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};

const createInventaris = async (req, res) => {
  try {
    const data = await Inventaris.create({
      SatuanId: req.body.satuanId,
      KategoriInventarisId: req.body.kategoriInventarisId,
      ...req.body,
    });

    res.locals.createdData = data.toJSON();

    return res.status(201).json({
      message: "Successfully created new inventaris data",
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};

const updateInventaris = async (req, res) => {
  try {
    const data = await Inventaris.findOne({
      where: { id: req.params.id, isDeleted: false },
    });

    if (!data || data.isDeleted) {
      return res.status(404).json({
        message: "Data not found",
      });
    }

    await Inventaris.update(req.body, {
      where: {
        id: req.params.id,
      },
    });

    const updated = await Inventaris.findOne({ where: { id: req.params.id } });

    res.locals.updatedData = updated.toJSON();

    return res.status(200).json({
      message: "Successfully updated inventaris data",
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

const deleteInventaris = async (req, res) => {
  try {
    const data = await Inventaris.findOne({
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
      message: "Successfully deleted inventaris data",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};

const getRiwayatPenggunaanInventaris = async (req, res) => {
  try {
    const daftarPemakaian = await db.query(
      `
      SELECT 
          pi.id,
          pi.jumlah,
          pi.createdAt,
          i.id AS inventarisId,
          i.nama AS inventarisNama,
          l.userId AS userId,
          l.gambar AS laporanGambar,
          u.name AS petugasNama,
          DATE_FORMAT(l.createdAt, '%W, %d %M %Y') AS laporanTanggal,
          DATE_FORMAT(l.createdAt, '%H:%i') AS laporanWaktu
      FROM 
          penggunaanInventaris pi
      JOIN 
          inventaris i ON pi.inventarisId = i.id
      JOIN 
          laporan l ON pi.laporanId = l.id
      JOIN
          user u ON l.userId = u.id
      WHERE 
          pi.isDeleted = FALSE
          AND i.isDeleted = FALSE
      ORDER BY 
          pi.createdAt DESC;
  `,
      {
        type: QueryTypes.SELECT,
      }
    );

    const daftarPemakaianTerbaru = daftarPemakaian.slice(0, 3);

    res.status(200).json({
      status: "success",
      message: "Data retrieved successfully",
      data: {
        daftarPemakaian,
        daftarPemakaianTerbaru,
      },
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getAllInventaris,
  getInventarisById,
  getInventarisByName,
  getInventarisByKategoriName,
  getInventarisByKategoriId,
  createInventaris,
  updateInventaris,
  deleteInventaris,
  getRiwayatPenggunaanInventaris,
};
