const { QueryTypes, Op, fn, col } = require("sequelize");
const sequelize = require("../../model/index");
const db = sequelize.sequelize;
const Inventaris = sequelize.Inventaris;
const Satuan = sequelize.Satuan;
const Kategori = sequelize.KategoriInventaris;
const PenggunaanInventaris = sequelize.PenggunaanInventaris;
const Laporan = sequelize.Laporan;
const User = sequelize.User;

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

    const inventarisData = await Inventaris.findOne({
      where: { id: id, isDeleted: false },
      include: [
        { model: Kategori, as: "kategoriInventaris", attributes: ["id", "nama"] },
        { model: Satuan, attributes: ["id", "nama", "lambang"] },
      ],
    });

    if (!inventarisData || inventarisData.isDeleted) {
      return res.status(404).json({ message: "Data not found" });
    }

    // Last 7 days of usage
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);

    const pemakaianTerakhir7Hari = await PenggunaanInventaris.findAll({
      attributes: [
        [fn('DATE', col('PenggunaanInventaris.createdAt')), 'tanggal'],
        [fn('SUM', col('jumlah')), 'stokPemakaian'],
      ],
      where: {
        inventarisId: id,
        isDeleted: false,
        createdAt: {
          [Op.gte]: sevenDaysAgo, // Greater than or equal to seven days ago
          [Op.lte]: today,       // Less than or equal to today
        },
      },
      group: [fn('DATE', col('PenggunaanInventaris.createdAt'))],
      order: [[fn('DATE', col('PenggunaanInventaris.createdAt')), 'ASC']],
      raw: true, // Get plain objects
    });
    
    const allDatesLast7Days = [];
    for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(today.getDate() - i);
        allDatesLast7Days.push(date.toISOString().split('T')[0]);
    }
    allDatesLast7Days.reverse(); // from oldest to newest

    const defaultChartData = allDatesLast7Days.map(dateStr => {
    const found = pemakaianTerakhir7Hari.find(p => p.tanggal === dateStr);
    return {
        period: dateStr,
        stokPemakaian: found ? parseInt(found.stokPemakaian, 10) : 0,
    };
});


    return res.status(200).json({
      message: "Successfully retrieved inventaris data",
      data: {
        inventaris: inventarisData,
        defaultChartData: defaultChartData,
      },
    });
  } catch (error) {
    console.error("Error getInventarisById:", error);
    res.status(500).json({ message: error.message, detail: error });
  }
};

const getStatistikPemakaianInventaris = async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate, groupBy } = req.query;

    if (!startDate || !endDate || !groupBy) {
      return res.status(400).json({ message: "startDate, endDate, and groupBy query parameters are required." });
    }

    let dateColumn;

    switch (groupBy) {
      case 'day':
        dateColumn = fn('DATE', col('PenggunaanInventaris.createdAt'));
        break;
      case 'month':
        dateColumn = fn('DATE_FORMAT', col('PenggunaanInventaris.createdAt'), '%Y-%m-01');
        break;
      case 'year':
        dateColumn = fn('DATE_FORMAT', col('PenggunaanInventaris.createdAt'), '%Y-01-01');
        break;
      default:
        return res.status(400).json({ message: "Invalid groupBy value. Use 'day', 'month', or 'year'." });
    }

    const statistik = await PenggunaanInventaris.findAll({
      attributes: [
        [dateColumn, 'period'],
        [fn('SUM', col('jumlah')), 'stokPemakaian'],
      ],
      where: {
        inventarisId: id,
        isDeleted: false,
        createdAt: {
          [Op.between]: [new Date(startDate), new Date(endDate + 'T23:59:59.999Z')], // Ensure end date includes the whole day
        },
      },
      group: ['period'],
      order: [['period', 'ASC']],
      raw: true,
    });
    console.log("Backend Query Result (statistik):", statistik);

    return res.status(200).json({
      message: "Successfully retrieved usage statistics",
      data: statistik.map(s => ({ ...s, stokPemakaian: parseInt(s.stokPemakaian, 10) })),
    });
  } catch (error) {
    console.error("Error getStatistikPemakaianInventaris:", error);
    res.status(500).json({ message: error.message, detail: error });
  }
};

const getRiwayatPemakaianInventarisPaginated = async (req, res) => {
  try {
    const { id: inventarisId } = req.params;
    const { page, limit } = req.query;
    const paginationOptions = getPaginationOptions(page, limit);

    const { count, rows } = await PenggunaanInventaris.findAndCountAll({
      where: {
        inventarisId: inventarisId,
        isDeleted: false,
      },
      include: [
        {
          model: Laporan,
          as: 'laporan',
          attributes: ['id', 'gambar', 'createdAt', 'userId'],
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['name'],
            }
          ]
        },
        {
          model: Inventaris,
          as: 'inventaris',
          attributes: ['nama']
        }
      ],
      order: [['createdAt', 'DESC']],
      distinct: true,
      ...paginationOptions,
    });

    const formattedRows = rows.map(item => {
        return {
            id: item.id,
            jumlah: item.jumlah,
            createdAt: item.createdAt,
            inventarisId: item.inventarisId,
            inventarisNama: item.inventaris?.nama || 'Unknown',
            laporanGambar: item.laporan?.gambar,
            petugasNama: item.laporan?.user?.name || 'Unknown',
            
            laporanTanggal: item.laporan?.createdAt ? new Date(item.laporan.createdAt).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'}) : 'Unknown date',
            laporanWaktu: item.laporan?.createdAt ? new Date(item.laporan.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit'}) : 'Unknown time',
            laporanId: item.laporan?.id
        };
    });


    if (rows.length === 0 && (parseInt(page, 10) || 1) === 1) {
      return res.status(200).json({
        message: "No usage history found", data: [], totalItems: 0, totalPages: 0, currentPage: parseInt(page, 10) || 1,
      });
    }
    if (rows.length === 0 && (parseInt(page, 10) || 1) > 1) {
      return res.status(200).json({
        message: "No more usage history", data: [], totalItems: count, totalPages: Math.ceil(count / paginationOptions.limit), currentPage: parseInt(page, 10) || 1,
      });
    }

    return res.status(200).json({
      message: "Successfully retrieved usage history",
      data: formattedRows,
      totalItems: count,
      totalPages: Math.ceil(count / (paginationOptions.limit || limit)),
      currentPage: parseInt(page, 10) || 1,
    });

  } catch (error) {
    console.error("Error getRiwayatPemakaianInventarisPaginated:", error);
    res.status(500).json({ message: error.message, detail: error });
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
  getStatistikPemakaianInventaris,
  getRiwayatPemakaianInventarisPaginated,
};
