const { where, QueryTypes, col, Op, fn, literal } = require("sequelize");
const sequelize = require("../../model/index");
const { default: axios } = require("axios");
const db = sequelize.sequelize;

const Inventaris = sequelize.Inventaris;
const KategoriInventaris = sequelize.KategoriInventaris;
const PenggunaanInventaris = sequelize.PenggunaanInventaris;
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
                },
            },
        });

        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const itemBaru = await Inventaris.count({
            where: {
                isDeleted: false,
                createdAt: {
                    [Op.gte]: oneDayAgo,
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

        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
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

        // const daftarPemakaianTerbaru = await PenggunaanInventaris.findAll({
        //     attributes: [
        //         "id",
        //         "jumlah",
        //         "createdAt",
        //         [col("Inventaris.id"), "inventarisId"],
        //         [col("Inventaris.nama"), "inventarisNama"],
        //         [col("Laporan.userId"), "userId"],
        //         [col("Laporan.gambar"), "laporanGambar"],
        //         [col("User.name"), "petugasNama"],
        //         [fn("DATE_FORMAT", col("Laporan.createdAt"), "%W, %d %M %Y"), "laporanTanggal"],
        //         [fn("DATE_FORMAT", col("Laporan.createdAt"), "%H:%i"), "laporanWaktu"],
        //     ],
        //     include: [
        //         {
        //             model: Inventaris,
        //             attributes: [],
        //             where: {
        //                 isDeleted: false,
        //             },
        //         },
        //         {
        //             model: Laporan,
        //             attributes: [],
        //             where: {
        //                 isDeleted: false,
        //             },
        //             include: [
        //                 {
        //                     model: User,
        //                     attributes: [],
        //                 },
        //             ],
        //         },
        //     ],
        //     where: {
        //         isDeleted: false,
        //     },
        //     order: [["createdAt", "DESC"]],
        //     limit: 5,
        // });
        const daftarPemakaianTerbaru = await db.query(`
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
                pi.createdAt DESC
            LIMIT 5;
        `, {
            type: QueryTypes.SELECT,
        });

        const daftarInventaris = await Inventaris.findAll({
            attributes: [
                "id",
                "nama",
                "jumlah",
                "gambar",
                "satuanId",
                [col('Satuan.lambang'), 'lambangSatuan'],
            ],
            where: {
                isDeleted: false,
            },
            order: [["createdAt", "DESC"]],
            limit: 10,
            include: [{
                model: Satuan,
                attributes: [],
            }]
        });

        res.status(200).json({
            status: "success",
            message: "Dashboard data retrieved successfully",
            data: {
                totalItem,
                stokRendah,
                itemBaru,
                totalKategori,
                itemTersedia,
                seringDigunakanCount,
                jarangDigunakanCount,
                daftarInventaris,
                daftarPemakaianTerbaru
            },
        })

    } catch (error) {
        console.error("Error fetching dashboard data:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

module.exports = {
  dashboardInventaris,
};