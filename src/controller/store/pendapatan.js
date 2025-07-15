const { where } = require('sequelize');
const db = require("../../model/index");
const Pesanan = db.Pesanan;
const Toko = db.Toko;
const Pendapatan = db.Pendapatan;
const { creditUserSaldo } = require('./saldo.js');



const addPendapatan = async (req, res) => {
    const { pesananId, jumlahPendapatan } = req.body;

    if (!pesananId || !jumlahPendapatan) {
        return res.status(400).json({
            message: "Pesanan ID dan jumlah pendapatan diperlukan"
        });
    }
    const t = await db.sequelize.transaction();
    try {
        const pesanan = await Pesanan.findOne({
            where: { id: pesananId, isDeleted: false },
            include: [{
                model: Toko,
                attributes: ['id', 'nama', 'UserId'],
            }],
            transaction: t
        })
        if (!pesanan) {
            await t.rollback();
            return res.status(404).json({ message: "Pesanan tidak ditemukan" });
        }
        if (!pesanan.Toko) {
            await t.rollback();
            return res.status(404).json({ message: "Toko terkait pesanan tidak ditemukan" });
        }
        if (!pesanan.Toko.UserId) {
            await t.rollback();
            return res.status(404).json({ message: "Pemilik toko tidak ditemukan untuk pesanan ini" });
        }
        const tokoId = pesanan.Toko.id;
        const namaToko = pesanan.Toko.nama;
        const userIdPemilikToko = pesanan.Toko.UserId;

        const pendapatan = await Pendapatan.create({
            pesananId: pesananId,
            tokoId: tokoId,
            harga: parseFloat(jumlahPendapatan)
        }, { transaction: t });

        await creditUserSaldo(
            userIdPemilikToko,
            parseFloat(jumlahPendapatan),
            'pendapatan_masuk_penjual',
            pendapatan.id,
            'pendapatan',
            `Pendapatan dari penjualan pesanan ID : ${pesananId}`,
            t
        );

        await t.commit();

        return res.status(201).json({
            message: "Pendapatan berhasil ditambahkan dan saldo penjual telah diperbarui",
            data: pendapatan,
            toko: {
                id: tokoId,
                nama: namaToko
            }
        });

    } catch (error) {
        await t.rollback();
        console.error("Error in addPendapatan:", error);
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