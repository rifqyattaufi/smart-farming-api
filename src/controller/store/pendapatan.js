const { where } = require('sequelize');
const sequelize = require("../../model/index");
const Pesanan = sequelize.Pesanan;
const Toko = sequelize.Toko;
const Pendapatan = sequelize.Pendapatan;


const addPendapatan = async (req, res) => {
    const { pesananId, jumlahPendapatan } = req.body;

    if (!pesananId || !jumlahPendapatan) {
        return res.status(400).json({
            message: "Pesanan ID dan jumlah pendapatan diperlukan"
        });
    }

    try {
        const pesanan = await Pesanan.findOne({
            where: { id: pesananId, isDeleted: false },
            include: [{
                model: Toko,
                attributes: ['id', 'nama']
            }]
        })

        const pendapatan = await Pendapatan.create({
            pesananId: pesananId,
            tokoId: pesanan.Toko.id,
            harga: jumlahPendapatan
        });
        return res.status(201).json({
            message: "Pendapatan berhasil ditambahkan",
            data: pendapatan,
            toko: {
                id: pesanan.Toko.id,
                nama: pesanan.Toko.nama
            }
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Gagal menambahkan pendapatan",
            detail: error.message
        });
    }
}

const getPendapatanByTokoId = async (req, res) => {
    const tokoId = req.params.id;

    if (!tokoId) {
        return res.status(400).json({
            message: "ID toko diperlukan"
        });
    }
    try {
        const pendapatan = await Pendapatan.findAll({
            where: { tokoId: tokoId, isDeleted: false },
        });
        return res.status(200).json({
            message: "Pendapatan berhasil diambil",
            data: pendapatan
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Gagal mengambil pendapatan",
            detail: error.message
        });
    }
}

module.exports = {
    addPendapatan
    , getPendapatanByTokoId
}