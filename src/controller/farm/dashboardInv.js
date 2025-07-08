const { col, Op, fn, literal } = require("sequelize");
const sequelize = require("../../model/index");

const Inventaris = sequelize.Inventaris;
const KategoriInventaris = sequelize.KategoriInventaris;
const PenggunaanInventaris = sequelize.PenggunaanInventaris;
const Vitamin = sequelize.Vitamin;
const Satuan = sequelize.Satuan;
const Laporan = sequelize.Laporan;
const User = sequelize.User;

const dashboardInventaris = async (req, res) => {
  try {
    const totalItem = await Inventaris.count({
      where: {
        isDeleted: false,
      },
    });

    const stokRendah = await Inventaris.count({
      where: {
        isDeleted: false,
        jumlah: {
          [Op.lt]: col("stokMinim"),
          [Op.ne]: 0,
        },
      },
    });

    const stokHabis = await Inventaris.count({
      where: {
        isDeleted: false,
        jumlah: 0,
      },
    });

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const itemBaru = await Inventaris.count({
      where: {
        isDeleted: false,
        createdAt: {
          [Op.gte]: sevenDaysAgo,
        },
      },
    });

    const totalKategori = await KategoriInventaris.count({
      where: {
        isDeleted: false,
      },
    });

    const itemTersedia = await Inventaris.count({
      where: {
        isDeleted: false,
        ketersediaan: "tersedia",
      },
    });

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const penggunaan = await Inventaris.findAll({
      attributes: [
        "id",
        [fn("SUM", col("penggunaanInventaris.jumlah")), "totalJumlah"],
      ],
      include: [
        {
          model: PenggunaanInventaris,
          attributes: [],
          where: {
            isDeleted: false,
            createdAt: {
              [Op.gte]: thirtyDaysAgo,
            },
          },
          required: true,
        },
      ],
      where: { isDeleted: false },
      group: ["Inventaris.id"],
      order: [[literal("totalJumlah"), "DESC"]],
    });

    // // Hitung 20% teratas
    const topPercentage = 0.2;
    const topN = Math.ceil(penggunaan.length * topPercentage);

    const seringDigunakan = penggunaan.slice(0, topN);
    const jarangDigunakan = penggunaan.slice(topN);

    const seringDigunakanCount = seringDigunakan.length;
    const jarangDigunakanCount = jarangDigunakan.length;

    // Get all PenggunaanInventaris data
    const daftarPemakaianPIOrm = await PenggunaanInventaris.findAll({
      attributes: ["id", "jumlah", "createdAt"],
      include: [
        {
          model: Inventaris,
          as: "inventaris",
          attributes: ["id", "nama"],
          where: {
            isDeleted: false,
          },
          required: true,
        },
        {
          model: Laporan,
          as: "laporan",
          attributes: ["id", "userId", "gambar", "createdAt"],
          where: { isDeleted: false },
          required: true,
          include: [
            {
              model: User,
              as: "user",
              attributes: ["name"],
              where: {
                isDeleted: false,
              },
              required: true,
            },
          ],
        },
      ],
      where: {
        isDeleted: false,
      },
      order: [["createdAt", "DESC"]],
    });

    // Get all Vitamin data
    const daftarPemakaianVitaminOrm = await Vitamin.findAll({
      attributes: ["id", "jumlah", "createdAt"],
      include: [
        {
          model: Inventaris,
          as: "inventaris",
          attributes: ["id", "nama"],
          where: {
            isDeleted: false,
          },
          required: true,
        },
        {
          model: Laporan,
          attributes: ["id", "userId", "gambar", "createdAt"],
          where: { isDeleted: false },
          required: true,
          include: [
            {
              model: User,
              as: "user",
              attributes: ["name"],
              where: {
                isDeleted: false,
              },
              required: true,
            },
          ],
        },
      ],
      where: {
        isDeleted: false,
      },
      order: [["createdAt", "DESC"]],
    });

    // Transform PenggunaanInventaris data to match expected format
    const daftarPemakaianPI = daftarPemakaianPIOrm.map((item) => {
      const pi = item.toJSON();
      const inventarisData = pi.inventaris || {};
      const laporanData = pi.laporan || {};
      const userData = laporanData.user || {};

      let laporanTanggalFormatted = null;
      let laporanWaktuFormatted = null;

      if (laporanData.createdAt) {
        const laporanDate = new Date(laporanData.createdAt);
        try {
          laporanTanggalFormatted = laporanDate.toLocaleDateString("id-ID", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          });
          laporanWaktuFormatted = laporanDate.toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
          });
        } catch (e) {
          console.warn(
            "Warning: Locale 'id-ID' not fully supported for date formatting. Using default.",
            e.message
          );
          laporanTanggalFormatted = laporanDate.toDateString();
          laporanWaktuFormatted = laporanDate.toTimeString().substring(0, 5);
        }
      }

      return {
        id: pi.id,
        jumlah: pi.jumlah,
        createdAt: pi.createdAt,
        inventarisId: inventarisData.id,
        inventarisNama: inventarisData.nama,
        userId: laporanData.userId,
        laporanGambar: laporanData.gambar,
        petugasNama: userData.name,
        laporanId: laporanData.id,
        laporanTanggal: laporanTanggalFormatted,
        laporanWaktu: laporanWaktuFormatted,
        sourceTable: "penggunaan",
      };
    });

    // Transform Vitamin data to match expected format
    const daftarPemakaianVitamin = daftarPemakaianVitaminOrm.map((item) => {
      const vitamin = item.toJSON();
      const inventarisData = vitamin.inventaris || {};
      const laporanData = vitamin.Laporan || {};
      const userData = laporanData.user || {};

      let laporanTanggalFormatted = null;
      let laporanWaktuFormatted = null;

      if (laporanData.createdAt) {
        const laporanDate = new Date(laporanData.createdAt);
        try {
          laporanTanggalFormatted = laporanDate.toLocaleDateString("id-ID", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          });
          laporanWaktuFormatted = laporanDate.toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
          });
        } catch (e) {
          console.warn(
            "Warning: Locale 'id-ID' not fully supported for date formatting. Using default.",
            e.message
          );
          laporanTanggalFormatted = laporanDate.toDateString();
          laporanWaktuFormatted = laporanDate.toTimeString().substring(0, 5);
        }
      }

      return {
        id: vitamin.id,
        jumlah: vitamin.jumlah,
        createdAt: vitamin.createdAt,
        inventarisId: inventarisData.id,
        inventarisNama: inventarisData.nama,
        userId: laporanData.userId,
        laporanGambar: laporanData.gambar,
        petugasNama: userData.name,
        laporanId: laporanData.id,
        laporanTanggal: laporanTanggalFormatted,
        laporanWaktu: laporanWaktuFormatted,
        sourceTable: "vitamin",
      };
    });

    // Combine and sort by createdAt
    const daftarPemakaian = [
      ...daftarPemakaianPI,
      ...daftarPemakaianVitamin,
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const daftarPemakaianTerbaru = daftarPemakaian.slice(0, 5);

    const daftarInventaris = await Inventaris.findAll({
      attributes: [
        "id",
        "nama",
        "jumlah",
        "gambar",
        "satuanId",
        [col("Satuan.lambang"), "lambangSatuan"],
      ],
      where: {
        isDeleted: false,
      },
      order: [["createdAt", "DESC"]],
      limit: 10,
      include: [
        {
          model: Satuan,
          attributes: [],
        },
      ],
    });

    res.status(200).json({
      status: "success",
      message: "Dashboard data retrieved successfully",
      data: {
        totalItem,
        stokRendah,
        stokHabis,
        itemBaru,
        totalKategori,
        itemTersedia,
        seringDigunakanCount,
        jarangDigunakanCount,
        daftarInventaris,
        daftarPemakaianTerbaru,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    const errorMessage =
      process.env.NODE_ENV === "development"
        ? error.message
        : "Internal server error";
    const errorDetail = process.env.NODE_ENV === "development" ? error : {};
    return res.status(500).json({ message: errorMessage, detail: errorDetail });
  }
};

module.exports = {
  dashboardInventaris,
};
