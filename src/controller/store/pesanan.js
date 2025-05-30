const sequelize = require("../../model");
const Pesanan = sequelize.Pesanan;
const PesananDetail = sequelize.PesananDetail;
const Produk = sequelize.Produk;
const midtransOrder = sequelize.MidtransOrder;

const createPesanan = async (req, res) => {
    const t = await sequelize.sequelize.transaction();

    try {
        const { orderId, items } = req.body;
        const userId = req.user.id;

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                message: "Item pesanan tidak boleh kosong",
            });
        }

        let tokoId = null;
        let totalHarga = 0;
        for (const item of items) {
            if (!item.produkId || !item.jumlah || item.jumlah < 1) {
                return res.status(400).json({
                    message: "Setiap item harus memiliki produkId dan jumlah minimal 1",
                });
            }

            const produk = await Produk.findOne({
                where: { id: item.produkId, isDeleted: false }
            });

            if (!produk) {
                return res.status(404).json({
                    message: `Produk dengan ID ${item.produkId} tidak ditemukan`,
                });
            }
            if (!tokoId) tokoId = produk.TokoId;
            totalHarga += produk.harga * item.jumlah;
        }
        await midtransOrder.findOrCreate({
            where: { id: orderId },
            defaults: {
                id: orderId,
                transaction_status: "pending",
                transaction_time: new Date(),
            },
            transaction: t,
        });

        const pesanan = await Pesanan.create({
            UserId: userId,
            status: "menunggu",
            totalHarga,
            MidtransOrderId: orderId,
            TokoId: tokoId,
        }, { transaction: t, logging: console.log, });


        for (const item of items) {
            await PesananDetail.create({
                ProdukId: item.produkId,
                jumlah: item.jumlah,
                PesananId: pesanan.id
            }, { transaction: t });
        }

        await t.commit();

        return res.status(201).json({
            message: "Pesanan berhasil dibuat",
            data: pesanan
        });
    } catch (error) {
        await t.rollback();
        return res.status(500).json({
            message: "Gagal membuat pesanan",
            detail: error.message
        });
    }
};
const getPesananByUser = async (req, res) => {
    try {
        const userId = req.user.id;

        const pesanan = await Pesanan.findAll({
            where: { UserId: userId, isDeleted: false },
            include: [
                {
                    model: PesananDetail,
                    include: [
                        {
                            model: Produk,
                            attributes: ['id', 'nama', 'gambar', 'satuan', 'harga'],
                            include: [
                                {
                                    model: sequelize.Toko,
                                    attributes: ['id', 'nama', 'alamat']
                                }
                            ]
                        }
                    ]
                },
                {
                    model: sequelize.Toko,
                    attributes: ['id', 'nama', 'alamat', 'logoToko']
                },
                {
                    model: midtransOrder,
                    attributes: ['id', 'transaction_status', 'transaction_time', 'bank']
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        return res.status(200).json({
            message: "Berhasil mengambil daftar pesanan",
            data: pesanan
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Gagal mengambil pesanan",
            detail: error.message
        });
    }
};

const updatePesananStatus = async (req, res) => {
    const t = await sequelize.sequelize.transaction();
    try {
        const { pesananId, status } = req.body;
        const userId = req.user.id;

        if (!pesananId) {
            return res.status(400).json({
                message: "ID pesanan diperlukan"
            });
        }

        const validStatuses = ['menunggu', 'diterima', 'selesai', 'ditolak'];
        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({
                message: `Status tidak valid. Status harus salah satu dari: ${validStatuses.join(', ')}`
            });
        }
        const pesanan = await Pesanan.findOne({
            where: {
                id: pesananId,
                isDeleted: false
            },
            transaction: t
        });

        if (!pesanan) {
            await t.rollback();
            return res.status(404).json({
                message: "Pesanan tidak ditemukan"
            });
        }

        pesanan.status = status;
        await pesanan.save({ transaction: t });
        await t.commit();

        return res.status(200).json({
            message: "Status pesanan berhasil diperbarui",
            data: {
                id: pesanan.id,
                status: pesanan.status,
                updatedAt: pesanan.updatedAt
            }
        });
    } catch (error) {
        await t.rollback();
        console.error(`Gagal memperbarui status pesanan: ${error.message}`);
        return res.status(500).json({
            message: "Gagal memperbarui status pesanan",
            detail: error.message
        });
    }
};
const getPesananByTokoId = async (req, res) => {
    try {
        const tokoId = req.params.id;
        if (!tokoId) {
            return res.status(400).json({
                message: "ID toko diperlukan"
            });
        }
        const pesanan = await Pesanan.findAll({
            where: { TokoId: tokoId, isDeleted: false },
            include: [
                {
                    model: PesananDetail,
                    include: [
                        {
                            model: Produk,
                            attributes: ['id', 'nama', 'gambar', 'satuan', 'harga'],
                            include: [
                                {
                                    model: sequelize.Toko,
                                    attributes: ['id', 'nama', 'alamat']
                                }
                            ]
                        }
                    ]
                },
                {
                    model: sequelize.User,
                    attributes: ['id', 'name', 'email']
                },
                {
                    model: midtransOrder,
                    attributes: ['id', 'transaction_status', 'transaction_time', 'bank']
                }
            ],
            order: [['createdAt', 'DESC']]
        });
        if (pesanan.length === 0) {
            return res.status(404).json({
                message: "Tidak ada pesanan ditemukan untuk toko ini"
            });
        }
        return res.status(200).json({
            message: "Berhasil mengambil daftar pesanan untuk toko",
            data: pesanan
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Gagal mengambil pesanan",
            detail: error.message
        });
    }
}

module.exports = {
    createPesanan,
    getPesananByUser,
    updatePesananStatus,
    getPesananByTokoId
};
