const sequelize = require("../../model/index");
const { Op } = require("sequelize");
const JenisHama = sequelize.JenisHama;
const { dataValid } = require("../../validation/dataValidation");

const { getPaginationOptions } = require("../../utils/paginationUtils");

const getAlljenisHama = async (req, res) => {
  try {
    const { page, limit, nama } = req.query;
    const paginationOptions = getPaginationOptions(page, limit);

    const whereClause = { isDeleted: false };
    if (nama && nama.trim() !== "") {
      whereClause.nama = { [Op.like]: `%${nama}%` };
    }

    const { count, rows } = await JenisHama.findAndCountAll({
      where: whereClause,
      order: [["createdAt", "DESC"]],
      ...paginationOptions,
    });

    const currentPageNum = parseInt(page, 10) || 1;
    const totalPages = Math.ceil(
      count / (paginationOptions.limit || parseInt(limit, 10) || 10)
    );

    if (rows.length === 0) {
      return res.status(200).json({
        message: currentPageNum > 1 ? "Tidak ada data lagi" : "Data tidak ditemukan",
        data: [],
        totalItems: count,
        totalPages: totalPages,
        currentPage: currentPageNum,
      });
    }

    return res.status(200).json({
      message: "Berhasil mendapatkan data jenis hama",
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

const getjenisHamaSearch = async (req, res) => {
  try {
    const { nama } = req.params;
    const { page, limit } = req.query;
    const paginationOptions = getPaginationOptions(page, limit);

    const { count, rows } = await JenisHama.findAndCountAll({
      where: {
        nama: { [Op.like]: `%${nama}%` },
        isDeleted: false,
      },
      order: [["createdAt", "DESC"]],
      ...paginationOptions,
    });

    const currentPageNum = parseInt(page, 10) || 1;
    const totalPages = Math.ceil(
      count / (paginationOptions.limit || parseInt(limit, 10) || 10)
    );

    if (rows.length === 0) {
      return res.status(200).json({
        message:
          currentPageNum > 1
            ? "Tidak ada data lagi untuk pencarian ini"
            : "Data tidak ditemukan",
        data: [],
        totalItems: 0,
        totalPages: 0,
        currentPage: currentPageNum,
      });
    }

    return res.status(200).json({
      message: "Berhasil mendapatkan data jenis hama",
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

const getjenisHamaById = async (req, res) => {
  try {
    const data = await JenisHama.findOne({
      where: {
        id: req.params.id,
        isDeleted: false,
      },
    });

    if (!data) {
      return res.status(404).json({
        message: "Data tidak ditemukan",
      });
    }

    return res.status(200).json({
      message: "Berhasil mendapatkan data jenis hama",
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
      message: "Validasi gagal",
    });
  }
  try {
    // Cek apakah ada data dengan nama yang sama yang sudah di-soft delete
    const softDeleted = await JenisHama.findOne({
      where: {
        nama: req.body.nama,
        isDeleted: true,
      },
    });

    if (softDeleted) {
      // Restore data yang sudah di-soft delete dengan update semua field
      await JenisHama.update(
        {
          ...req.body,
          isDeleted: false,
          updatedAt: new Date(),
        },
        {
          where: { id: softDeleted.id },
        }
      );

      const restoredData = await JenisHama.findOne({
        where: { id: softDeleted.id },
      });

      res.locals.createdData = restoredData.toJSON();

      return res.status(201).json({
        status: true,
        message:
          "Data dengan nama tersebut sudah ada sebelumnya dan telah dipulihkan.",
        data: restoredData,
      });
    }

    // Cek apakah ada data aktif dengan nama yang sama
    const existing = await JenisHama.findOne({
      where: {
        nama: req.body.nama,
        isDeleted: false,
      },
    });

    if (existing) {
      return res.status(400).json({
        status: false,
        message:
          "Jenis hama dengan nama tersebut sudah ada. Silakan gunakan nama yang berbeda.",
      });
    }

    // Buat data baru jika tidak ada duplikasi
    const data = await JenisHama.create({
      ...req.body,
      isDeleted: false,
    });

    res.locals.createdData = data.toJSON();

    return res.status(201).json({
      status: true,
      message: "Berhasil membuat data jenis hama baru",
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
    const data = await JenisHama.findOne({
      where: { id: req.params.id, isDeleted: false },
    });

    if (!data) {
      return res.status(404).json({
        status: false,
        message: "Data tidak ditemukan",
      });
    }

    // Jika nama diubah, cek apakah nama baru sudah ada
    if (req.body.nama && req.body.nama !== data.nama) {
      const existing = await JenisHama.findOne({
        where: {
          nama: req.body.nama,
          isDeleted: false,
          id: { [Op.ne]: req.params.id },
        },
      });

      if (existing) {
        return res.status(400).json({
          status: false,
          message:
            "Jenis hama dengan nama tersebut sudah ada. Silakan gunakan nama yang berbeda.",
        });
      }
    }

    await JenisHama.update(req.body, {
      where: {
        id: req.params.id,
      },
    });

    const updated = await JenisHama.findOne({ where: { id: req.params.id } });

    res.locals.updatedData = updated.toJSON();

    return res.status(200).json({
      status: true,
      message: "Berhasil memperbarui data jenis hama",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
      detail: error,
    });
  }
};

const deletejenisHama = async (req, res) => {
  try {
    const data = await JenisHama.findOne({
      where: { id: req.params.id, isDeleted: false },
    });

    if (!data) {
      return res.status(404).json({
        status: false,
        message: "Data tidak ditemukan",
      });
    }

    data.isDeleted = true;
    await data.save();

    res.locals.updatedData = data.toJSON();

    return res.status(200).json({
      status: true,
      message: "Berhasil menghapus data jenis hama",
    });
  } catch (error) {
    res.status(500).json({
      status: false,
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
