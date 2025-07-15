const { where } = require("sequelize");
const sequelize = require("../../model");
const { sendNotificationToSingleUserById } = require('../../../services/notificationService');
const Pesanan = sequelize.Pesanan;
const PesananDetail = sequelize.PesananDetail;
const Produk = sequelize.Produk;
const Komoditas = sequelize.Komoditas;
const midtransOrder = sequelize.MidtransOrder;
const { creditUserSaldo } = require('./saldo.js');

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
        const produkList = [];
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
            if (typeof produk.stok === 'number' && produk.stok < item.jumlah) {
                await t.rollback();
                return res.status(400).json({
                    message: `Stok produk ${produk.nama} tidak mencukupi`,
                });
            }
            if (!tokoId) tokoId = produk.TokoId;
            totalHarga += produk.harga * item.jumlah;
            produkList.push({ produk, jumlah: item.jumlah });
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


        for (const { produk, jumlah } of produkList) {
            await PesananDetail.create({
                ProdukId: produk.id,
                jumlah,
                PesananId: pesanan.id
            }, { transaction: t });

            const komoditas = await Komoditas.findOne({
                where: { produkId: produk.id, isDeleted: false },
            })

            if (typeof produk.stok === 'number') {
                await Produk.update(
                    { stok: produk.stok - jumlah },
                    { where: { id: produk.id }, transaction: t }

                );
                if (komoditas) {
                    await Komoditas.update(
                        { jumlah: komoditas.jumlah - jumlah }
                        , { where: { produkId: produk.id }, transaction: t }
                    )
                }
            }
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

const getPesananById = async (req, res) => {
    try {
        const pesananId = req.params.id;
        if (!pesananId) {
            return res.status(400).json({
                message: "ID pesanan diperlukan"
            });
        }

        const pesanan = await Pesanan.findOne({
            where: { id: pesananId, isDeleted: false },
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
                    attributes: ['id', 'name', 'email', 'phone']
                },
                {
                    model: midtransOrder,
                    attributes: ['id', 'transaction_status', 'transaction_time', 'bank', 'payment_type', 'gross_amount']
                }
            ]
        });

        if (!pesanan) {
            return res.status(404).json({
                message: "Pesanan tidak ditemukan"
            });
        }

        return res.status(200).json({
            message: "Berhasil mengambil detail pesanan",
            data: pesanan
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Gagal mengambil detail pesanan",
            detail: error.message
        });
    }
}

const updatePesananStatus = async (req, res) => {
    const t = await sequelize.sequelize.transaction();
    try {
        const { pesananId, status } = req.body;
        const userId = req.user.id;

        if (!pesananId) {
            await t.rollback();
            return res.status(400).json({
                message: "ID pesanan diperlukan"
            });
        }

        const validStatuses = ['menunggu', 'diterima', 'selesai', 'ditolak', 'expired'];
        if (!status || !validStatuses.includes(status)) {
            await t.rollback();
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
        const statusSebelumnya = pesanan.status;
        pesanan.status = status;
        await pesanan.save({ transaction: t });

        if (status === 'ditolak' && statusSebelumnya !== 'ditolak') {
            const userIdPembeli = pesanan.UserId;
            const jumlahRefund = pesanan.totalHarga;

            if (!userIdPembeli) {
                await t.rollback();
                console.error(`Error: Pesanan ${pesananId} tidak memiliki UserId (pembeli). Refund gagal.`);
                return res.status(500).json({ message: "Data pesanan tidak lengkap (tidak ada info pembeli), refund gagal." });
            }
            if (jumlahRefund === undefined || jumlahRefund === null || parseFloat(jumlahRefund) <= 0) {
                await t.rollback();
                console.error(`Error: Jumlah refund untuk pesanan ${pesananId} tidak valid atau nol (${jumlahRefund}). Refund tidak diproses.`);
                return res.status(400).json({ message: `Jumlah refund untuk pesanan ${pesananId} tidak valid atau nol. Refund tidak diproses.` });
            }

            await creditUserSaldo(
                userIdPembeli,
                parseFloat(jumlahRefund),
                'refund_pesanan_pembeli',
                pesanan.id,
                'pesanan',
                `Refund untuk pesanan #${pesanan.id} karena status diubah menjadi 'ditolak'.`,
                t
            );
        }
        await t.commit();

        let responseMessage = "Status pesanan berhasil diperbarui";
        if (status === 'ditolak' && statusSebelumnya !== 'ditolak') {
            responseMessage = "Status pesanan berhasil diperbarui menjadi 'ditolak' dan dana telah dikembalikan ke saldo pembeli.";
        }

        return res.status(200).json({
            message: responseMessage,
            data: {
                id: pesanan.id,
                UserId: pesanan.UserId,
                status: pesanan.status,
                updatedAt: pesanan.updatedAt
            }
        });
    } catch (error) {
        await t.rollback();
        console.error(`Gagal memperbarui status pesanan (ID: ${req.body.pesananId}): ${error.message}`, error);
        return res.status(500).json({
            message: "Gagal memperbarui status pesanan",
            detail: error.message
        });
    }
};


const updatePesananStatusandNotif = async (req, res) => {
    const t = await sequelize.sequelize.transaction();
    try {
        const { pesananId, status } = req.body;

        if (!pesananId) {
            return res.status(400).json({
                message: "ID pesanan diperlukan"
            });
        }

        const validStatuses = ['menunggu', 'diterima', 'selesai', 'ditolak', 'expired'];
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

        if (pesanan.UserId) {
            const targetUserId = pesanan.UserId;
            const notificationTitle = "Status Pesanan Anda Diperbarui";
            const notificationBody = `Status pesanan untuk pesanan id #${pesanan.id} Anda telah diubah menjadi "${status}".`;
            const notificationData = {
                pesananId: String(pesanan.id),
                newStatus: status,
                notificationType: "ORDER_STATUS_UPDATE"
            };

            try {
                console.log(`Attempting to send notification to userId: ${targetUserId} for order ${pesanan.id}`);
                await sendNotificationToSingleUserById(
                    targetUserId,
                    notificationTitle,
                    notificationBody,
                    notificationData
                );
            } catch (notifError) {
                console.error(`Failed to send notification for order ${pesanan.id} to user ${targetUserId}:`, notifError);
            }
        } else {
            console.log(`UserId not found on order ${pesanan.id}, skipping notification.`);
        }

        return res.status(200).json({
            message: "Status pesanan berhasil diperbarui",
            data: {
                id: pesanan.id,
                UserId: pesanan.UserId,
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
const CreatebuktiDiterima = async (req, res) => {
    try {
        const { buktiDiterima, pesananId } = req.body;

        if (!pesananId || !buktiDiterima) {
            return res.status(400).json({
                message: "Bukti diterima dan pesanan Id diperlukan"
            });
        }

        const bukti = await sequelize.BuktiDiterima.create({
            fotoBukti: buktiDiterima,
        });

        await Pesanan.update({
            buktiDiterimaId: bukti.id,
        }, {
            where: {
                id: pesananId,
                isDeleted: false
            }
        }
        )

        return res.status(200).json({
            message: "Bukti diterima berhasil dibuat",
            data: {
                buktiDiterima
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Gagal membuat bukti diterima",
            detail: error.message
        });

    }
}
// get bukti diterima by id
const getBuktiDiterimaById = async (req, res) => {
    try {
        const buktiId = req.params.id;
        if (!buktiId) {
            return res.status(400).json({
                message: "ID bukti diterima diperlukan"
            });
        }

        const bukti = await sequelize.BuktiDiterima.findOne({
            where: { id: buktiId, isDeleted: false },
            include: [{
                model: Pesanan,
                as: 'pesanan',
                attributes: ['id', 'status']
            }]
        });

        if (!bukti) {
            return res.status(404).json({
                message: "Bukti diterima tidak ditemukan"
            });
        }

        return res.status(200).json({
            message: "Berhasil mengambil bukti diterima",
            data: bukti
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Gagal mengambil bukti diterima",
            detail: error.message
        });
    }
};

module.exports = {
    createPesanan,
    getPesananByUser,
    getPesananById,
    updatePesananStatus,
    getPesananByTokoId,
    CreatebuktiDiterima,
    getBuktiDiterimaById,
    updatePesananStatusandNotif
};
