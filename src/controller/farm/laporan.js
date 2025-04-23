const e = require("express");
const sequelize = require("../../model/index");
const db = sequelize.sequelize;
const Op = sequelize.Sequelize.Op;
const Laporan = sequelize.Laporan;

const HarianKebun = sequelize.HarianKebun;
const HarianTernak = sequelize.HarianTernak;

const Sakit = sequelize.Sakit;
const Kematian = sequelize.Kematian;
const Vitamin = sequelize.Vitamin;

const Panen = sequelize.Panen;
const Hama = sequelize.Hama;

const PenggunaanInventaris = sequelize.PenggunaanInventaris;

const createLaporanHarianKebun = async (req, res) => {
    const t = await db.transaction();

    try {

        const {
            unitBudidayaId, 
            objekBudidayaId,
            judul, 
            tipe, 
            gambar, 
            catatan,
            harianKebun
        } = req.body;

        const data = await Laporan.create(
            {
                unitBudidayaId,
                objekBudidayaId,
                judul,
                tipe,
                gambar,
                catatan,
                userId: req.user.id,
            },
            { transaction: t }
        );

        const harian = await HarianKebun.create(
            {
                laporanID: data.id,
                penyiraman: harianKebun.penyiraman,
                pruning: harianKebun.pruning,
                repotting: harianKebun.repotting,
            },
            { transaction: t }
        );

        await t.commit();
    
        res.locals.createdData = { data, harian };
    
        return res.status(201).json({
            message: "Successfully created new laporan data",
            data: {
                data,
                harian,
            }
        });
    } catch (error) {
        await t.rollback();
        res.status(500).json({
            message: error.message,
            detail: error,
        });
    }
};

const createLaporanHarianTernak = async (req, res) => {
    const t = await db.transaction();

    try {

        const {
            unitBudidayaId, 
            objekBudidayaId,
            judul, 
            tipe, 
            gambar, 
            catatan,
            harianTernak
        } = req.body;

        const data = await Laporan.create(
            {
                unitBudidayaId,
                objekBudidayaId,
                judul,
                tipe,
                gambar,
                catatan,
                userId: req.user.id,
            },
            { transaction: t }
        );

        const laporan = await Laporan.findOne({
            where: {
                id: data.id,
            },
            transaction: t,
        });

        if (!laporan) {
            return res.status(404).json({
                message: "Laporan not found",
            });
        }

        const harian = await HarianTernak.create(
            {
                laporanID: laporan.id,
                pakan: harianTernak.pakan,
                cekKandang: harianTernak.cekKandang,
            },
            { transaction: t }
        );

        await t.commit();
    
        res.locals.createdData = { data, harian };
    
        return res.status(201).json({
            message: "Successfully created new laporan data",
            data: {
                data,
                harian,
            }
        });
    } catch (error) {
        await t.rollback();
        res.status(500).json({
            message: error.message,
            detail: error,
        });
    }
};

const createLaporanSakit = async (req, res) => {
    const t = await db.transaction();

    try {

        const {
            unitBudidayaId, 
            objekBudidayaId,
            judul, 
            tipe, 
            gambar, 
            catatan,
            sakit
        } = req.body;

        const data = await Laporan.create(
            {
                unitBudidayaId,
                objekBudidayaId,
                judul,
                tipe,
                gambar,
                catatan,
                userId: req.user.id,
            },
            { transaction: t }
        );

        const laporanSakit = await Sakit.create(
            {
                laporanID: data.id,
                penyakit: sakit.penyakit,
            },
            { transaction: t }
        );

        await t.commit();
    
        res.locals.createdData = { data, laporanSakit };
    
        return res.status(201).json({
            message: "Successfully created new laporan data",
            data: {
                data,
                laporanSakit,
            }
        });
    } catch (error) {
        await t.rollback();
        res.status(500).json({
            message: error.message,
            detail: error,
        });
    }
};

const createLaporanKematian = async (req, res) => {
    const t = await db.transaction();

    try {

        const {
            unitBudidayaId, 
            objekBudidayaId,
            judul, 
            tipe, 
            gambar, 
            catatan,
            kematian
        } = req.body;

        const data = await Laporan.create(
            {
                unitBudidayaId,
                objekBudidayaId,
                judul,
                tipe,
                gambar,
                catatan,
                userId: req.user.id,
            },
            { transaction: t }
        );

        const laporanKematian = await Kematian.create(
            {
                laporanID: data.id,
                tanggal: kematian.tanggal,
                penyebab: kematian.penyebab,
            },
            { transaction: t }
        );

        await t.commit();
    
        res.locals.createdData = { data, laporanKematian };
    
        return res.status(201).json({
            message: "Successfully created new laporan data",
            data: {
                data,
                laporanKematian,
            }
        });
    } catch (error) {
        await t.rollback();
        res.status(500).json({
            message: error.message,
            detail: error,
        });
    }
};

const createLaporanVitamin = async (req, res) => {
    const t = await db.transaction();

    try {

        const {
            unitBudidayaId, 
            objekBudidayaId,
            judul, 
            tipe, 
            gambar, 
            catatan,
            vitamin
        } = req.body;

        const data = await Laporan.create(
            {
                unitBudidayaId,
                objekBudidayaId,
                judul,
                tipe,
                gambar,
                catatan,
                userId: req.user.id,
            },
            { transaction: t }
        );

        const laporanVitamin = await Vitamin.create(
            {
                laporanId: data.id,
                inventarisId: vitamin.inventarisId,
                tipe: vitamin.tipe,
                jumlah: vitamin.jumlah,
            },
            { transaction: t }
        );

        await t.commit();
    
        res.locals.createdData = { data, laporanVitamin };
    
        return res.status(201).json({
            message: "Successfully created new laporan data",
            data: {
                data,
                laporanVitamin,
            }
        });
    } catch (error) {
        await t.rollback();
        res.status(500).json({
            message: error.message,
            detail: error,
        });
    }
};

const createLaporanPanen = async (req, res) => {
    const t = await db.transaction();

    try {

        const {
            unitBudidayaId, 
            objekBudidayaId,
            judul, 
            tipe, 
            gambar, 
            catatan,
            panen
        } = req.body;

        const data = await Laporan.create(
            {
                unitBudidayaId,
                objekBudidayaId,
                judul,
                tipe,
                gambar,
                catatan,
                userId: req.user.id,
            },
            { transaction: t }
        );

        const laporanPanen = await Panen.create(
            {
                laporanID: data.id,
                komoditasID: panen.komoditasID,
                jumlah: panen.jumlah,

            },
            { transaction: t }
        );

        await t.commit();
    
        res.locals.createdData = { data, laporanPanen };
    
        return res.status(201).json({
            message: "Successfully created new laporan data",
            data: {
                data,
                laporanPanen,
            }
        });
    } catch (error) {
        await t.rollback();
        res.status(500).json({
            message: error.message,
            detail: error,
        });
    }
};

const createLaporanHama = async (req, res) => {
    const t = await db.transaction();

    try {

        const {
            unitBudidayaId, 
            objekBudidayaId,
            judul, 
            tipe, 
            gambar, 
            catatan,
            hama
        } = req.body;

        const data = await Laporan.create(
            {
                unitBudidayaId,
                objekBudidayaId,
                judul,
                tipe,
                gambar,
                catatan,
                userId: req.user.id,
            },
            { transaction: t }
        );

        const laporanHama = await Hama.create(
            {
                laporanID: data.id,
                jenisHamaID: hama.jenisHamaID,
                jumlah: hama.jumlah,
                status: hama.status,
            },
            { transaction: t }
        );

        await t.commit();
    
        res.locals.createdData = { data, laporanHama };
    
        return res.status(201).json({
            message: "Successfully created new laporan data",
            data: {
                data,
                laporanHama,
            }
        });
    } catch (error) {
        await t.rollback();
        res.status(500).json({
            message: error.message,
            detail: error,
        });
    }
};

// Ini harusnya gaada hubungan dengan unitBudidayaId dan objekBudidayaId
// const createLaporanPenggunaanInventaris = async (req, res) => {
//     const t = await db.transaction();

//     try {

//         const {
//             unitBudidayaId, 
//             objekBudidayaId,
//             judul, 
//             tipe, 
//             gambar, 
//             catatan,
//             penggunaanInv
//         } = req.body;

//         const data = await Laporan.create(
//             {
//                 unitBudidayaId,
//                 objekBudidayaId,
//                 judul,
//                 tipe,
//                 gambar,
//                 catatan,
//                 userId: req.user.id,
//             },
//             { transaction: t }
//         );

//         const laporanPenggunaanInventaris = await PenggunaanInventaris.create(
//             {
//                 laporanId: data.id,
//                 inventarisId: penggunaanInv.inventarisId,
//                 jumlah: penggunaanInv.jumlah,
//             },
//             { transaction: t }
//         );

//         await t.commit();
    
//         res.locals.createdData = { data, laporanPenggunaanInventaris };
    
//         return res.status(201).json({
//             message: "Successfully created new laporan data",
//             data: {
//                 data,
//                 laporanPenggunaanInventaris,
//             }
//         });
//     } catch (error) {
//         await t.rollback();
//         res.status(500).json({
//             message: error.message,
//             detail: error,
//         });
//     }
// };

module.exports = {
    createLaporanHarianKebun,
    createLaporanHarianTernak,
    createLaporanSakit,
    createLaporanKematian,
    createLaporanVitamin,
    createLaporanPanen,
    createLaporanHama,
};
  