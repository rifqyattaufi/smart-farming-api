const sequelizeInstance = require("../../model/index").sequelize;
const { SaldoUser, MutasiSaldoUser, PenarikanSaldo, User, Rekening, Pendapatan, Pesanan, Toko } = require("../../model/index");



const getMySaldo = async (req, res) => {
    try {
        const userId = req.user.id;

        let saldo = await SaldoUser.findOne({
            where: { userId: userId },
        });

        if (!saldo) {
            saldo = await SaldoUser.create({
                userId: userId,
                saldoTersedia: 0.00,
            });
            saldo = await SaldoUser.findOne({
                where: { userId: userId },
                include: [
                    {
                        model: User,
                        as: 'user',
                        attributes: ['id', 'name', 'email']
                    }
                ]
            });
        }

        return res.status(200).json({
            message: "Successfully retrieved user saldo",
            data: saldo,
        });

    } catch (error) {
        console.error("Error in getMySaldo:", error);
        return res.status(500).json({
            message: "Failed to retrieve user saldo",
            detail: error.message,
        });
    }
};


const getMyMutasiSaldo = async (req, res) => {
    try {
        const userId = req.user.id;
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const offset = (page - 1) * limit;

        const { count, rows } = await MutasiSaldoUser.findAndCountAll({
            where: { userId: userId },
            order: [['createdAt', 'DESC']],
            limit: limit,
            offset: offset,
        });

        if (rows.length === 0 && page === 1) {
            return res.status(200).json({
                message: "No saldo mutations found for this user",
                data: [],
                currentPage: page,
                totalPages: 0,
                totalItems: 0,
            });
        }


        return res.status(200).json({
            message: "Successfully retrieved user saldo mutations",
            data: rows,
            currentPage: page,
            totalPages: Math.ceil(count / limit),
            totalItems: count,
        });

    } catch (error) {
        console.error("Error in getMyMutasiSaldo:", error);
        return res.status(500).json({
            message: "Failed to retrieve user saldo mutations",
            detail: error.message,
        });
    }
};


const createPenarikanSaldo = async (req, res) => {
    const t = await sequelizeInstance.transaction();

    try {
        const userId = req.user.id;
        const { jumlahDiminta: jumlahDimintaString } = req.body;
        const biayaAdmin = parseFloat(process.env.BIAYA_ADMIN_PENARIKAN) || 2500;


        if (!jumlahDimintaString) {
            await t.rollback();
            return res.status(400).json({
                message: "jumlahDiminta diperlukan",
            });
        }
        const jumlahDimintaNum = parseFloat(jumlahDimintaString);
        if (isNaN(jumlahDimintaNum) || jumlahDimintaNum <= 0) {
            await t.rollback();
            return res.status(400).json({
                message: "jumlahDiminta harus berupa angka positif",
            });
        }

        const MINIMUM_PENARIKAN = parseFloat(process.env.MINIMUM_PENARIKAN) || 20000;
        if (jumlahDimintaNum < MINIMUM_PENARIKAN) {
            await t.rollback();
            return res.status(400).json({ message: `Minimum penarikan adalah Rp ${MINIMUM_PENARIKAN.toLocaleString('id-ID')}` });
        }

        const rekeningPengguna = await Rekening.findOne({
            where: {
                userId: userId,
            },
            transaction: t,
        });

        if (!rekeningPengguna) {
            await t.rollback();
            return res.status(404).json({
                message: "Anda belum mendaftarkan rekening bank yang terverifikasi. Silakan daftarkan atau pastikan rekening Anda sudah terverifikasi.",
            });
        }


        let saldoUser = await SaldoUser.findOne({
            where: { userId: userId },
            transaction: t,
            lock: t.LOCK.UPDATE
        });

        if (!saldoUser) {
            saldoUser = await SaldoUser.create({ userId: userId, saldoTersedia: 0.00 }, { transaction: t });
        }


        const totalYangDitarikDariSaldo = jumlahDimintaNum;
        if (parseFloat(saldoUser.saldoTersedia) < totalYangDitarikDariSaldo) {
            await t.rollback();
            return res.status(400).json({
                message: "Saldo tidak mencukupi untuk melakukan penarikan sejumlah yang diminta.",
                saldoTersedia: parseFloat(saldoUser.saldoTersedia).toLocaleString('id-ID'),
            });
        }

        const jumlahDiterimaNum = jumlahDimintaNum - biayaAdmin;
        if (jumlahDiterimaNum < 0) {
            await t.rollback();
            return res.status(400).json({
                message: "Jumlah yang diminta terlalu kecil setelah dipotong biaya admin, menghasilkan jumlah diterima yang negatif.",
            });
        }


        const penarikan = await PenarikanSaldo.create({
            userId: userId,
            rekeningBankId: rekeningPengguna.id,
            jumlahDiminta: jumlahDimintaNum,
            biayaAdmin: biayaAdmin,
            jumlahDiterima: jumlahDiterimaNum,
            status: "pending",
            tanggalRequest: new Date(),
        }, { transaction: t });


        const saldoSebelumPengurangan = parseFloat(saldoUser.saldoTersedia);
        saldoUser.saldoTersedia = saldoSebelumPengurangan - totalYangDitarikDariSaldo;
        await saldoUser.save({ transaction: t });



        await t.commit();

        return res.status(201).json({
            message: "Permintaan penarikan saldo berhasil dibuat dan menunggu persetujuan admin.",
            data: penarikan,
            rekeningTujuan: {
                id: rekeningPengguna.id,
                namaBank: rekeningPengguna.namaBank,
                nomorRekening: rekeningPengguna.nomorRekening,
                namaPemilikRekening: rekeningPengguna.namaPemilikRekening
            }
        });

    } catch (error) {
        if (t && t.finished !== 'committed' && t.finished !== 'rolled back') {
            await t.rollback();
        }
        console.error("Error in createPenarikanSaldo:", error);
        return res.status(500).json({
            message: "Gagal membuat permintaan penarikan saldo",
            detail: error.message,
        });
    }
};


const getMyPenarikanSaldoHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const offset = (page - 1) * limit;

        const { count, rows } = await PenarikanSaldo.findAndCountAll({
            where: { userId: userId },
            include: [
                {
                    model: Rekening,
                    as: 'rekening',
                    attributes: ['id', 'namaBank', 'nomorRekening', 'namaPenerima']
                }
            ],
            order: [['tanggalRequest', 'DESC']],
            limit: limit,
            offset: offset,
        });

        if (rows.length === 0 && page === 1) {
            return res.status(200).json({
                message: "No penarikan saldo history found for this user",
                data: [],
                currentPage: page,
                totalPages: 0,
                totalItems: 0,
            });
        }


        return res.status(200).json({
            message: "Successfully retrieved user penarikan saldo history",
            data: rows,
            currentPage: page,
            totalPages: Math.ceil(count / limit),
            totalItems: count,
        });

    } catch (error) {
        console.error("Error in getMyPenarikanSaldoHistory:", error);
        return res.status(500).json({
            message: "Failed to retrieve user penarikan saldo history",
            detail: error.message,
        });
    }
};


const getAllPenarikanSaldoRequests = async (req, res) => {
    try {

        if (req.user.role !== 'pjawab') {
            return res.status(403).json({ message: "Forbidden: Admin access required" });
        }

        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const offset = (page - 1) * limit;
        const statusFilter = req.query.status || 'pending';

        const { count, rows } = await PenarikanSaldo.findAndCountAll({
            where: { status: statusFilter },
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'name', 'email']
                },
                {
                    model: Rekening,
                    as: 'rekening',
                    attributes: ['id', 'namaBank', 'nomorRekening', 'namaPenerima']
                }
            ],
            order: [['tanggalRequest', 'ASC']],
            limit: limit,
            offset: offset,
        });

        return res.status(200).json({
            message: `Successfully retrieved all penarikan saldo requests with status ${statusFilter}`,
            data: rows,
            currentPage: page,
            totalPages: Math.ceil(count / limit),
            totalItems: count,
        });

    } catch (error) {
        console.error("Error in getAllPenarikanSaldoRequests:", error);
        return res.status(500).json({
            message: "Failed to retrieve penarikan saldo requests",
            detail: error.message,
        });
    }
};


const prosesPenarikanSaldo = async (req, res) => {
    const { id } = req.params;
    const { status, catatanAdmin, buktiTransfer, referensiBank } = req.body; // status baru: 'completed' atau 'rejected'

    if (req.user.role !== 'pjawab') {
        return res.status(403).json({ message: "Forbidden: Admin access required" });
    }

    if (!status || !['completed', 'rejected'].includes(status)) {
        return res.status(400).json({
            message: "Invalid status. Must be 'completed' or 'rejected'.",
        });
    }

    const t = await sequelizeInstance.transaction();
    try {
        const penarikan = await PenarikanSaldo.findOne({
            where: { id: id, status: 'pending' },
            transaction: t,
        });

        if (!penarikan) {
            await t.rollback();
            return res.status(404).json({
                message: "Penarikan saldo request not found or already processed",
            });
        }

        const userId = penarikan.userId;
        const jumlahDiminta = penarikan.jumlahDiminta;

        if (status === 'completed') {

            const saldoUser = await SaldoUser.findOne({ where: { userId: userId }, transaction: t });
            if (!saldoUser) {
                await t.rollback();
                return res.status(500).json({ message: "Saldo user record not found." });
            }
            const saldoSebelumMutasi = saldoUser.saldoTersedia + jumlahDiminta;
            const saldoSesudahMutasi = saldoUser.saldoTersedia;


            await MutasiSaldoUser.create({
                userId: userId,
                tipeTransaksi: 'penarikan_dana',
                jumlah: -parseFloat(jumlahDiminta),
                saldoSebelum: saldoSebelumMutasi,
                saldoSesudah: saldoSesudahMutasi,
                referensiId: penarikan.id,
                referensiTabel: 'penarikan_saldo',
                keterangan: `Penarikan dana disetujui. ID: ${penarikan.id}. ${catatanAdmin || ''}`.trim(),
            }, { transaction: t });

            penarikan.status = 'completed';
            penarikan.catatanAdmin = catatanAdmin;
            penarikan.buktiTransfer = buktiTransfer;
            penarikan.referensiBank = referensiBank;
            penarikan.tanggalProses = new Date();
            await penarikan.save({ transaction: t });


        } else if (status === 'rejected') {
            const saldoUser = await SaldoUser.findOne({ where: { userId: userId }, transaction: t });
            if (!saldoUser) {
                await t.rollback();
                return res.status(500).json({ message: "Saldo user record not found." });
            }
            const saldoSebelumPengembalian = parseFloat(saldoUser.saldoTersedia);
            saldoUser.saldoTersedia = saldoSebelumPengembalian + parseFloat(jumlahDiminta);
            await saldoUser.save({ transaction: t });
            const saldoSesudahPengembalian = parseFloat(saldoUser.saldoTersedia);



            await MutasiSaldoUser.create({
                userId: userId,
                tipeTransaksi: 'penarikan_dibatalkan_dikembalikan',
                jumlah: parseFloat(jumlahDiminta),
                saldoSebelum: saldoUser.saldoTersedia - parseFloat(jumlahDiminta),
                saldoSesudah: saldoUser.saldoTersedia,
                referensiId: penarikan.id,
                referensiTabel: 'penarikan_saldo',
                keterangan: `Penarikan dana ditolak, dana dikembalikan. ID: ${penarikan.id}. Alasan: ${penarikan.catatanAdmin}`,
            }, { transaction: t });
            penarikan.status = 'rejected';
        }

        await t.commit();

        return res.status(200).json({
            message: `Penarikan saldo request ${status} successfully`,
            data: penarikan,
        });

    } catch (error) {
        await t.rollback();
        console.error("Error in prosesPenarikanSaldo:", error);
        return res.status(500).json({
            message: "Failed to process penarikan saldo request",
            detail: error.message,
        });
    }
};



/**
 * INTERNAL: Menambah saldo user dan mencatat mutasi.
 * @param {string} userId - ID User yang akan ditambah saldonya.
 * @param {number} jumlahTambah - Jumlah yang akan ditambahkan.
 * @param {string} tipeTransaksi - Tipe transaksi dari ENUM MutasiSaldoUser.
 * @param {string} referensiId - ID dari record sumber (misal, Pendapatan.id, Pesanan.id).
 * @param {string} referensiTabel - Nama tabel sumber.
 * @param {string} keterangan - Keterangan mutasi.
 * @param {object} transaction - Transaksi Sequelize (opsional, jika dipanggil dari dalam transaksi lain).
 * @returns {Promise<MutasiSaldoUser>}
 */
const creditUserSaldo = async (userId, jumlahTambah, tipeTransaksi, referensiId, referensiTabel, keterangan, transaction) => {
    const internalTransaction = !transaction; // Jika tidak ada transaksi eksternal, buat internal
    const t = internalTransaction ? await sequelize.transaction() : transaction;

    try {
        if (jumlahTambah <= 0) {
            if (internalTransaction) await t.rollback();
            throw new Error("Jumlah tambah harus positif untuk kredit saldo.");
        }

        let saldoUser = await SaldoUser.findOne({ where: { userId: userId }, transaction: t, lock: t.LOCK.UPDATE });
        if (!saldoUser) {
            saldoUser = await SaldoUser.create({ userId: userId, saldoTersedia: 0.00 }, { transaction: t });
        }

        const saldoSebelum = parseFloat(saldoUser.saldoTersedia);
        saldoUser.saldoTersedia = saldoSebelum + parseFloat(jumlahTambah);
        await saldoUser.save({ transaction: t });
        const saldoSesudah = parseFloat(saldoUser.saldoTersedia);

        const mutasi = await MutasiSaldoUser.create({
            userId,
            tipeTransaksi,
            jumlah: parseFloat(jumlahTambah), // Positif
            saldoSebelum,
            saldoSesudah,
            referensiId,
            referensiTabel,
            keterangan,
        }, { transaction: t });

        if (internalTransaction) await t.commit();
        return mutasi;

    } catch (error) {
        if (internalTransaction) await t.rollback();
        console.error(`Error in creditUserSaldo for userId ${userId}:`, error);
        throw error; // Re-throw error untuk ditangani oleh pemanggil
    }
};



module.exports = {
    getMySaldo,
    getMyMutasiSaldo,
    createPenarikanSaldo,
    getMyPenarikanSaldoHistory,
    getAllPenarikanSaldoRequests,
    prosesPenarikanSaldo,
    creditUserSaldo,
};