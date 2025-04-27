const { where } = require("sequelize");
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

    const aktivitasTerbaru = await Laporan.findAll({
      include: [
        {
          model: sequelize.User,
          attributes: ["name", "avatarUrl"],
        },
      ],
      where: {
        isDeleted: false,
      },
      order: [["createdAt", "DESC"]],
      limit: 2,
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
        suhu: suhu.data.main.temp,
        jenisTanaman: jenisTanaman,
        jumlahKematian: jumlahKematian,
        jumlahPanen: jumlahPanen,
        aktivitasTerbaru: aktivitasTerbaru,
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

    const sumKolektif = await sequelize.UnitBudidaya.sum("jumlah", {
      include: [
        {
          model: sequelize.JenisBudidaya,
          required: true,
          where: {
            tipe: "hewan",
          },
        },
      ],
      where: {
        tipe: "kolektif",
        isDeleted: false,
      },
    });

    const jumlahTernak = countObjekBudidaya + (sumKolektif || 0);

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

    const aktivitasTerbaru = await Laporan.findAll({
      include: [
        {
          model: sequelize.User,
          attributes: ["name", "avatarUrl"],
        },
      ],
      where: {
        isDeleted: false,
      },
      order: [["createdAt", "DESC"]],
      limit: 2,
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
        aktivitasTerbaru: aktivitasTerbaru,
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
