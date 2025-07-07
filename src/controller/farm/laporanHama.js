const sequelize = require("../../model/index");
const { Op } = require("sequelize");
const Laporan = sequelize.Laporan;
const Hama = sequelize.Hama;
const JenisHama = sequelize.JenisHama;
const UnitBudidaya = sequelize.UnitBudidaya;
const ObjekBudidaya = sequelize.ObjekBudidaya;
const User = sequelize.User;

const { getPaginationOptions } = require("../../utils/paginationUtils");

const getAllLaporanHama = async (req, res) => {
  try {
    const { page, limit, search } = req.query;
    const paginationOptions = getPaginationOptions(page, limit);

    // Build where clause for search functionality
    const whereClause = {
      tipe: "hama",
      isDeleted: false,
    };

    // Add search condition if search query exists
    if (search && search.trim() !== "") {
      const searchTerm = search.trim();
      whereClause[Op.or] = [
        { judul: { [Op.like]: `%${searchTerm}%` } },
        { catatan: { [Op.like]: `%${searchTerm}%` } },
        // Search in related models using subqueries
        {
          "$Hama.JenisHama.nama$": { [Op.like]: `%${searchTerm}%` },
        },
        {
          "$UnitBudidaya.nama$": { [Op.like]: `%${searchTerm}%` },
        },
        {
          "$user.name$": { [Op.like]: `%${searchTerm}%` },
        },
      ];
    }

    const { count, rows } = await Laporan.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Hama,
          required: true,
          include: [
            {
              model: JenisHama,
              attributes: ["id", "nama"],
              required: false,
            },
          ],
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
          required: false,
        },
      ],
      order: [["createdAt", "DESC"]],
      distinct: true,
      ...paginationOptions,
    });

    const currentPageNum = parseInt(page, 10) || 1;
    const totalPages = Math.ceil(
      count / (paginationOptions.limit || parseInt(limit, 10) || 10)
    );

    if (rows.length === 0) {
      return res.status(200).json({
        status: true,
        message: currentPageNum > 1 ? "No more data" : "Data not found",
        data: [],
        totalItems: count,
        totalPages: totalPages,
        currentPage: currentPageNum,
      });
    }

    return res.status(200).json({
      status: true,
      message: "Successfully retrieved all hama reports",
      data: rows,
      totalItems: count,
      totalPages: totalPages,
      currentPage: currentPageNum,
    });
  } catch (error) {
    console.error("Error getAllLaporanHama:", error);
    res.status(500).json({
      status: false,
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

    if (!query || query.trim() === "") {
      return res.status(400).json({
        status: false,
        message: "Search query is required",
      });
    }

    const searchTerm = query.trim();

    const { count, rows } = await Laporan.findAndCountAll({
      where: {
        tipe: "hama",
        isDeleted: false,
        [Op.or]: [
          { judul: { [Op.like]: `%${searchTerm}%` } },
          { catatan: { [Op.like]: `%${searchTerm}%` } },
          {
            "$Hama.JenisHama.nama$": { [Op.like]: `%${searchTerm}%` },
          },
          {
            "$UnitBudidaya.nama$": { [Op.like]: `%${searchTerm}%` },
          },
          {
            "$user.name$": { [Op.like]: `%${searchTerm}%` },
          },
        ],
      },
      include: [
        {
          model: Hama,
          required: true,
          include: [
            {
              model: JenisHama,
              attributes: ["id", "nama", "gambar"],
              required: false,
            },
          ],
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
        },
      ],
      order: [["createdAt", "DESC"]],
      distinct: true,
      ...paginationOptions,
    });

    const currentPageNum = parseInt(page, 10) || 1;
    const totalPages = Math.ceil(
      count / (paginationOptions.limit || parseInt(limit, 10) || 10)
    );

    if (rows.length === 0) {
      return res.status(200).json({
        status: true,
        message:
          currentPageNum > 1
            ? "No more data for this search"
            : "Data not found for this search",
        data: [],
        totalItems: count,
        totalPages: totalPages,
        currentPage: currentPageNum,
      });
    }

    return res.status(200).json({
      status: true,
      message:
        "Successfully retrieved hama reports matching the search criteria",
      data: rows,
      totalItems: count,
      totalPages: totalPages,
      currentPage: currentPageNum,
    });
  } catch (error) {
    console.error("Error searchLaporanHama:", error);
    res.status(500).json({
      status: false,
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
        {
          model: User,
          as: "user",
          attributes: ["id", "name"],
          required: false,
        },
      ],
    });

    if (!data) {
      return res.status(404).json({
        status: false,
        message: "Data not found",
      });
    }

    return res.status(200).json({
      status: true,
      message: "Successfully retrieved hama report",
      data: data,
    });
  } catch (error) {
    console.error("Error getLaporanHamaById:", error);
    res.status(500).json({
      status: false,
      message: error.message,
      detail: error,
    });
  }
};

const updateStatusHama = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate input
    if (typeof status !== "boolean") {
      return res.status(400).json({
        message:
          "Status must be a boolean value (true for handled, false for not handled)",
      });
    }

    // Find the laporan hama
    const laporan = await Laporan.findOne({
      where: { id: id, tipe: "hama", isDeleted: false },
      include: [
        {
          model: Hama,
          required: true,
        },
      ],
    });

    if (!laporan) {
      return res.status(404).json({
        message: "Hama report not found",
      });
    }

    // Update the hama status
    await Hama.update({ status: status }, { where: { id: laporan.Hama.id } });

    return res.status(200).json({
      status: true,
      message: `Hama status successfully updated to ${
        status ? "handled" : "not handled"
      }`,
      data: {
        id: laporan.id,
        hamaId: laporan.Hama.id,
        newStatus: status,
      },
    });
  } catch (error) {
    console.error("Error updateStatusHama:", error);
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};

module.exports = {
  getAllLaporanHama,
  searchLaporanHama,
  getLaporanHamaById,
  updateStatusHama,
};
