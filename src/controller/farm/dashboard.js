const { where, QueryTypes } = require("sequelize");
const sequelize = require("../../model/index");
const { default: axios } = require("axios");
const db = sequelize.sequelize;
const ObjekBudidaya = sequelize.ObjekBudidaya;
const jenisBudidaya = sequelize.JenisBudidaya;
const Kematian = sequelize.Kematian;
const Panen = sequelize.Panen;
const PanenKebun = sequelize.PanenKebun;
const UnitBudidaya = sequelize.UnitBudidaya;
const JenisBudidaya = sequelize.JenisBudidaya;
const Komoditas = sequelize.Komoditas;
const Laporan = sequelize.Laporan;
const HarianKebun = sequelize.HarianKebun;
const Sakit = sequelize.Sakit;
const Satuan = sequelize.Satuan;

const { getPaginationOptions } = require("../../utils/paginationUtils");

const dashboardPerkebunan = async (req, res) => {
  const openWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=-7.249&lon=112.751&units=metric&appid=${process.env.OPEN_WEATHER_API_KEY}`;

  try {
    const suhu = await axios.get(openWeatherUrl);

    const jenisTanaman = await jenisBudidaya.count({
      where: {
        tipe: "tumbuhan",
        isDeleted: false,
      },
    });

    const jumlahTanaman = await ObjekBudidaya.count({
      include: [
        {
          model: sequelize.UnitBudidaya,
          required: true,
          include: [
            {
              model: sequelize.JenisBudidaya,
              required: true,
              where: {
                tipe: "tumbuhan",
              },
            },
          ],
        },
      ],
      where: {
        isDeleted: false,
      },
    });

    const jumlahSakit = await Sakit.count({
      include: [
        {
          model: Laporan,
          required: true,
          where: {
            isDeleted: false,
          },
          include: [
            {
              model: UnitBudidaya,
              required: true,
              where: {
                isDeleted: false,
              },
              include: [
                {
                  model: JenisBudidaya,
                  required: true,
                  where: {
                    tipe: "tumbuhan",
                    isDeleted: false,
                  },
                },
              ],
            },
          ],
        },
      ],
      where: {
        isDeleted: false,
        createdAt: {
          [sequelize.Sequelize.Op.gte]: new Date(
            new Date() - 30 * 24 * 60 * 60 * 1000
          ),
        },
      },
    });

    const jumlahKematian = await Kematian.count({
      include: [
        {
          model: sequelize.Laporan,
          required: true,
          where: {
            isDeleted: false,
          },
          include: [
            {
              model: sequelize.UnitBudidaya,
              required: true,
              where: {
                isDeleted: false,
              },
              include: [
                {
                  model: sequelize.JenisBudidaya,
                  required: true,
                  where: {
                    tipe: "tumbuhan",
                    isDeleted: false,
                  },
                },
              ],
            },
          ],
        },
      ],
      where: {
        isDeleted: false,
        createdAt: {
          [sequelize.Sequelize.Op.gte]: new Date(
            new Date() - 30 * 24 * 60 * 60 * 1000
          ),
        },
      },
    });

    const jumlahPanen = await PanenKebun.count({
      //hitung jumlah panenkebun dalam 30 hari terakhir
      include: [
        {
          model: sequelize.Laporan,
          required: true,
          where: {
            isDeleted: false,
            tipe: "panen",
          },
          include: [
            {
              model: sequelize.UnitBudidaya,
              required: true,
              where: {
                isDeleted: false,
              },
              include: [
                {
                  model: sequelize.JenisBudidaya,
                  required: true,
                  where: {
                    tipe: "tumbuhan",
                    isDeleted: false,
                  },
                },
              ],
            },
          ],
        },
      ],
      where: {
        isDeleted: false,
        createdAt: {
          [sequelize.Sequelize.Op.gte]: new Date(
            new Date() - 30 * 24 * 60 * 60 * 1000
          ),
        },
      },
    });

    const aktivitasTerbaru = await db.query(
      `
      SELECT 
      l.*, 
      u.name AS userName, 
      u.avatarUrl AS userAvatarUrl, 
      ub.tipe AS unitBudidayaTipe, 
      jb.tipe AS jenisBudidayaTipe, 
      i.nama AS inventarisNama, 
      iv.nama AS vitaminNama
      FROM laporan l
      LEFT JOIN user u ON l.userId = u.id
      LEFT JOIN unitBudidaya ub ON l.unitBudidayaId = ub.id
      LEFT JOIN jenisBudidaya jb ON ub.jenisBudidayaId = jb.id
      LEFT JOIN penggunaanInventaris pi ON l.id = pi.laporanId
      LEFT JOIN inventaris i ON pi.inventarisId = i.id
      LEFT JOIN vitamin v ON l.id = v.laporanId
      LEFT JOIN inventaris iv ON v.inventarisId = iv.id
      WHERE l.isDeleted = false
      ORDER BY l.createdAt DESC
      LIMIT 2
      `,
      { type: QueryTypes.SELECT }
    );

    const daftarKebun = await UnitBudidaya.findAll({
      include: [
        {
          model: sequelize.JenisBudidaya,
          required: true,
          where: {
            tipe: "tumbuhan",
            isDeleted: false,
          },
        },
      ],
      where: {
        isDeleted: false,
      },
      order: [["createdAt", "DESC"]],
    });

    const daftarTanaman = await JenisBudidaya.findAll({
      where: {
        tipe: "tumbuhan",
        isDeleted: false,
        status: true,
      },
      order: [["createdAt", "DESC"]],
    });

    const daftarKomoditas = await Komoditas.findAll({
      include: [
        {
          model: sequelize.JenisBudidaya,
          required: true,
          where: {
            tipe: "tumbuhan",
          },
        },
        {
          model: Satuan,
          required: true,
          where: {
            isDeleted: false,
          },
        },
      ],
      where: {
        isDeleted: false,
      },
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      status: "success",
      message: "Dashboard data retrieved successfully",
      data: {
        suhu: Math.round(suhu.data.main.temp),
        jenisTanaman: jenisTanaman,
        jumlahTanaman: jumlahTanaman,
        jumlahKematian: jumlahKematian,
        jumlahSakit: jumlahSakit,
        jumlahPanen: jumlahPanen,
        aktivitasTerbaru: aktivitasTerbaru,
        daftarKebun: daftarKebun,
        daftarTanaman: daftarTanaman,
        daftarKomoditas: daftarKomoditas,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const riwayatAktivitasAll = async (req, res) => {
  try {
    const { page: pageQuery, limit: limitQuery } = req.query;

    const { limit, offset } = getPaginationOptions(pageQuery, limitQuery);
    const currentPage = parseInt(pageQuery, 10) || 1;

    const aktivitasTerbaru = await db.query(
      `
      SELECT 
        l.*, 
        u.name AS userName, 
        u.avatarUrl AS userAvatarUrl, 
        ub.tipe AS unitBudidayaTipe, 
        jb.tipe AS jenisBudidayaTipe, 
        i.nama AS inventarisNama, 
        iv.nama AS vitaminNama
      FROM laporan l
      LEFT JOIN user u ON l.userId = u.id
      LEFT JOIN unitBudidaya ub ON l.unitBudidayaId = ub.id
      LEFT JOIN jenisBudidaya jb ON ub.jenisBudidayaId = jb.id
      LEFT JOIN penggunaanInventaris pi ON l.id = pi.laporanId
      LEFT JOIN inventaris i ON pi.inventarisId = i.id
      LEFT JOIN vitamin v ON l.id = v.laporanId
      LEFT JOIN inventaris iv ON v.inventarisId = iv.id
      WHERE l.isDeleted = false
      ORDER BY l.createdAt DESC
      LIMIT :limit OFFSET :offset 
      `,
      {
        replacements: { limit, offset },
        type: db.QueryTypes.SELECT,
      }
    );

    const totalItemsResult = await db.query(
      `
      SELECT COUNT(l.id) as totalItems
      FROM laporan l
      WHERE l.isDeleted = false
      `,
      { type: db.QueryTypes.SELECT }
    );
    const totalItems = parseInt(totalItemsResult[0].totalItems, 10);
    const totalPages = Math.ceil(totalItems / limit);

    res.status(200).json({
      status: "success",
      message: "Riwayat aktivitas retrieved successfully",
      data: {
        aktivitasTerbaru: aktivitasTerbaru,
      },
      pagination: {
        currentPage: currentPage,
        totalPages: totalPages,
        totalItems: totalItems,
        limit: limit,
      },
    });
  } catch (error) {
    console.error("Error fetching riwayat aktivitas:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const dashboardPeternakan = async (req, res) => {
  try {
    const countObjekBudidaya = await ObjekBudidaya.count({
      include: [
        {
          model: sequelize.UnitBudidaya,
          required: true,
          include: [
            {
              model: sequelize.JenisBudidaya,
              required: true,
              where: {
                tipe: "hewan",
              },
            },
          ],
        },
      ],
      where: {
        isDeleted: false,
      },
    });

    const sumKolektif = await db.query(
      `
      SELECT SUM(ub.jumlah) AS totalJumlah
      FROM unitBudidaya ub
      INNER JOIN jenisBudidaya jb ON ub.jenisBudidayaId = jb.id
      WHERE ub.tipe = 'kolektif' AND ub.isDeleted = false AND jb.tipe = 'hewan'
      `,
      { type: QueryTypes.SELECT }
    );

    const jumlahTernak =
      parseInt(countObjekBudidaya, 10) +
      parseInt(sumKolektif[0]?.totalJumlah || 0, 10);

    const jenisTernak = await jenisBudidaya.count({
      where: {
        tipe: "hewan",
        isDeleted: false,
      },
    });

    const jumlahKematian = await Kematian.count({
      include: [
        {
          model: sequelize.Laporan,
          required: true,
          where: {
            isDeleted: false,
          },
          include: [
            {
              model: sequelize.UnitBudidaya,
              required: true,
              where: {
                isDeleted: false,
              },
              include: [
                {
                  model: sequelize.JenisBudidaya,
                  required: true,
                  where: {
                    tipe: "hewan",
                    isDeleted: false,
                  },
                },
              ],
            },
          ],
        },
      ],
      where: {
        isDeleted: false,
        createdAt: {
          [sequelize.Sequelize.Op.gte]: new Date(
            new Date() - 30 * 24 * 60 * 60 * 1000
          ),
        },
      },
    });

    const jumlahPanen = await Panen.count({
      include: [
        {
          model: sequelize.Laporan,
          required: true,
          where: {
            isDeleted: false,
          },
          include: [
            {
              model: sequelize.UnitBudidaya,
              required: true,
              where: {
                isDeleted: false,
              },
              include: [
                {
                  model: sequelize.JenisBudidaya,
                  required: true,
                  where: {
                    tipe: "hewan",
                    isDeleted: false,
                  },
                },
              ],
            },
          ],
        },
      ],
      where: {
        isDeleted: false,
        createdAt: {
          [sequelize.Sequelize.Op.gte]: new Date(
            new Date() - 30 * 24 * 60 * 60 * 1000
          ),
        },
      },
    });

    const aktivitasTerbaru = await db.query(
      `
      SELECT 
      l.*, 
      u.name AS userName, 
      u.avatarUrl AS userAvatarUrl, 
      ub.tipe AS unitBudidayaTipe, 
      jb.tipe AS jenisBudidayaTipe, 
      i.nama AS inventarisNama, 
      iv.nama AS vitaminNama
      FROM laporan l
      LEFT JOIN user u ON l.userId = u.id
      LEFT JOIN unitBudidaya ub ON l.unitBudidayaId = ub.id
      LEFT JOIN jenisBudidaya jb ON ub.jenisBudidayaId = jb.id
      LEFT JOIN penggunaanInventaris pi ON l.id = pi.laporanId
      LEFT JOIN inventaris i ON pi.inventarisId = i.id
      LEFT JOIN vitamin v ON l.id = v.laporanId
      LEFT JOIN inventaris iv ON v.inventarisId = iv.id
      WHERE l.isDeleted = false
      ORDER BY l.createdAt DESC
      LIMIT 2
      `,
      { type: QueryTypes.SELECT }
    );

    const daftarKandang = await UnitBudidaya.findAll({
      include: [
        {
          model: sequelize.JenisBudidaya,
          required: true,
          where: {
            tipe: "hewan",
            isDeleted: false,
          },
        },
      ],
      where: {
        isDeleted: false,
      },
      where: {
        isDeleted: false,
      },
      order: [["createdAt", "DESC"]],
    });

    const daftarTernak = await JenisBudidaya.findAll({
      where: {
        tipe: "hewan",
        isDeleted: false,
      },
      order: [["createdAt", "DESC"]],
    });

    const daftarKomoditas = await Komoditas.findAll({
      include: [
        {
          model: sequelize.JenisBudidaya,
          required: true,
          where: {
            tipe: "hewan",
            isDeleted: false,
          },
        },
        {
          model: Satuan,
          required: true,
          where: {
            isDeleted: false,
          },
        },
      ],
      where: {
        isDeleted: false,
      },
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      status: "success",
      message: "Dashboard data retrieved successfully",
      data: {
        jumlahTernak: jumlahTernak,
        jenisTernak: jenisTernak,
        jumlahKematian: jumlahKematian,
        jumlahPanen: jumlahPanen,
        aktivitasTerbaru: aktivitasTerbaru,
        daftarKandang: daftarKandang,
        daftarTernak: daftarTernak,
        daftarKomoditas: daftarKomoditas,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  dashboardPerkebunan,
  dashboardPeternakan,
  riwayatAktivitasAll,
};
