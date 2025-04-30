const { where, QueryTypes } = require("sequelize");
const sequelize = require("../../model/index");
const model = require("../../model/index");
const { default: axios } = require("axios");
const db = sequelize.sequelize;
const ObjekBudidaya = sequelize.ObjekBudidaya;
const jenisBudidaya = sequelize.JenisBudidaya;
const Kematian = sequelize.Kematian;
const Panen = sequelize.Panen;
const Laporan = sequelize.Laporan;
const UnitBudidaya = sequelize.UnitBudidaya;
const JenisBudidaya = sequelize.JenisBudidaya;
const PenggunaanInventaris = sequelize.PenggunaanInventaris;
const Inventaris = sequelize.Inventaris;

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
      FROM Laporan l
      LEFT JOIN User u ON l.userId = u.id
      LEFT JOIN UnitBudidaya ub ON l.unitBudidayaId = ub.id
      LEFT JOIN JenisBudidaya jb ON ub.jenisBudidayaId = jb.id
      LEFT JOIN PenggunaanInventaris pi ON l.id = pi.laporanId
      LEFT JOIN Inventaris i ON pi.inventarisId = i.id
      LEFT JOIN Vitamin v ON l.id = v.laporanId
      LEFT JOIN Inventaris iv ON v.inventarisId = iv.id
      WHERE l.isDeleted = false
      ORDER BY l.createdAt DESC
      LIMIT 2
      `,
      { type: QueryTypes.SELECT }
    );

    const aktivitasTerbaruFormatted = aktivitasTerbaru.map((aktivitas) => {
      const userName = aktivitas.userName || "Pengguna";
      let judul;

      switch (aktivitas.tipe) {
        case "inventaris":
          judul = `${userName} telah melaporkan penggunaan ${aktivitas.inventarisNama}`;
          break;
        case "vitamin":
          judul = `${userName} telah melaporkan penggunaan ${aktivitas.inventarisNama}}`;
          break;
        default:
          judul = `${userName} telah melaporkan ${aktivitas.tipe} ${aktivitas.jenisBudidayaTipe}`;
      }

      return {
        ...aktivitas,
        judul: judul,
      };
    });

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
      limit: 2,
    });

    const daftarTanaman = await JenisBudidaya.findAll({
      where: {
        tipe: "tumbuhan",
        isDeleted: false,
      },
      order: [["createdAt", "DESC"]],
      limit: 2,
    });

    res.status(200).json({
      status: "success",
      message: "Dashboard data retrieved successfully",
      data: {
        suhu: Math.round(suhu.data.main.temp),
        jenisTanaman: jenisTanaman,
        jumlahKematian: jumlahKematian,
        jumlahPanen: jumlahPanen,
        aktivitasTerbaru: aktivitasTerbaruFormatted,
        daftarKebun: daftarKebun,
        daftarTanaman: daftarTanaman,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
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
      FROM UnitBudidaya ub
      INNER JOIN JenisBudidaya jb ON ub.jenisBudidayaId = jb.id
      WHERE ub.tipe = 'kolektif' AND ub.isDeleted = false AND jb.tipe = 'hewan'
      `,
      { type: QueryTypes.SELECT }
    );

    const jumlahTernak = countObjekBudidaya + (sumKolektif[0]?.totalJumlah || 0);

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
      FROM Laporan l
      LEFT JOIN User u ON l.userId = u.id
      LEFT JOIN UnitBudidaya ub ON l.unitBudidayaId = ub.id
      LEFT JOIN JenisBudidaya jb ON ub.jenisBudidayaId = jb.id
      LEFT JOIN PenggunaanInventaris pi ON l.id = pi.laporanId
      LEFT JOIN Inventaris i ON pi.inventarisId = i.id
      LEFT JOIN Vitamin v ON l.id = v.laporanId
      LEFT JOIN Inventaris iv ON v.inventarisId = iv.id
      WHERE l.isDeleted = false
      ORDER BY l.createdAt DESC
      LIMIT 2
      `,
      { type: QueryTypes.SELECT }
    );

    const aktivitasTerbaruFormatted = aktivitasTerbaru.map((aktivitas) => {
      const userName = aktivitas.userName || "Pengguna";
      let judul;

      switch (aktivitas.tipe) {
        case "inventaris":
          judul = `${userName} telah melaporkan penggunaan ${aktivitas.inventarisNama}`;
          break;
        case "vitamin":
          judul = `${userName} telah melaporkan penggunaan ${aktivitas.inventarisNama}}`;
          break;
        default:
          judul = `${userName} telah melaporkan ${aktivitas.tipe} ${aktivitas.jenisBudidayaTipe}`;
      }

      return {
        ...aktivitas,
        judul: judul,
      };
    });

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
      limit: 2,
    });

    const daftarTernak = await JenisBudidaya.findAll({
      where: {
        tipe: "hewan",
        isDeleted: false,
      },
      order: [["createdAt", "DESC"]],
      limit: 2,
    });

    res.status(200).json({
      status: "success",
      message: "Dashboard data retrieved successfully",
      data: {
        jumlahTernak: jumlahTernak,
        jenisTernak: jenisTernak,
        jumlahKematian: jumlahKematian,
        jumlahPanen: jumlahPanen,
        aktivitasTerbaru: aktivitasTerbaruFormatted,
        daftarKandang: daftarKandang,
        daftarTernak: daftarTernak,
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
};
