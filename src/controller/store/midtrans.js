
const midtransClient = require('midtrans-client');
const sequelize = require('../../model/index');
const { or } = require('sequelize');
const { param } = require('../../routes/store/keranjang');
const Produk = sequelize.Produk;
const { Pesanan, PesananDetail, MidtransOrder } = require("../../model");

const snap = new midtransClient.Snap({
    isProduction: false,
    serverKey: process.env.MIDTRANS_SERVER_KEY,
    clientKey: process.env.MIDTRANS_CLIENT_KEY
});
const midtransCoreApi = new midtransClient.CoreApi({
    isProduction: false,
    serverKey: process.env.MIDTRANS_SERVER_KEY,
    clientKey: process.env.MIDTRANS_CLIENT_KEY
});

const createTransaction = async (req, res) => {
    try {
        const { items } = req.body;

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: 'Daftar produk tidak boleh kosong' });
        }

        const produkIds = items.map(i => i.id);
        const produkList = await Produk.findAll({
            where: { id: produkIds },
            attributes: ['id', 'nama', 'harga'],
        });

        if (produkList.length !== items.length) {
            return res.status(400).json({ message: 'Beberapa produk tidak ditemukan' });
        }

        const itemDetails = items.map(i => {
            const produk = produkList.find(p => p.id === i.id);
            return {
                id: produk.id,
                price: produk.harga,
                quantity: i.jumlah,
                name: produk.nama,
            };
        });

        const grossAmount = itemDetails.reduce((sum, item) => sum + item.price * item.quantity, 0);

        const parameter = {
            transaction_details: {
                order_id: `RFC_Order-${Date.now()}`,
                gross_amount: grossAmount,
            },
            item_details: itemDetails,
            customer_details: {
                first_name: req.user.name || 'User',
                email: req.user.email || 'user@example.com',
            },
        };

        const transaction = await snap.createTransaction(parameter);
        return res.status(201).json({
            message: 'Transaksi berhasil dibuat',
            token: transaction.token,
            redirect_url: transaction.redirect_url,
            order_items: itemDetails,
            order_id: parameter.transaction_details.order_id,
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: 'Gagal membuat transaksi',
            detail: err.message,
        });
    }
};
const getTransactionStatus = async (req, res) => {
    const { orderId } = req.params;

    if (!orderId) {
        return res.status(400).json({ message: 'order_id wajib diisi' });
    }
    ;
    try {
        const statusResponse = await midtransCoreApi.transaction.status(orderId);

        return res.status(200).json({
            message: 'Status transaksi berhasil diambil',
            data: statusResponse
        });

    } catch (error) {
        console.error('Gagal mengambil status transaksi:', error.message);
        return res.status(500).json({
            message: 'Gagal mengambil status transaksi',
            detail: error.message
        });
    }
};
const recreateTransaction = async (req, res) => {
    try {
        const { pesananId } = req.body;

        const pesanan = await Pesanan.findOne({
            where: { id: pesananId },
            include: [{
                model: PesananDetail,
                include: [Produk]
            }]
        });

        if (!pesanan) return res.status(404).json({ message: 'Pesanan tidak ditemukan' });

        const items = pesanan.PesananDetails.map((item) => ({
            id: item.Produk.id,
            name: item.Produk.nama,
            quantity: item.jumlah,
            price: item.Produk.harga
        }));

        const orderId = `RFC_Order-${Date.now()}`;
        const transaction = await snap.createTransaction({
            transaction_details: {
                order_id: orderId,
                gross_amount: pesanan.totalHarga
            },
            item_details: items,
            customer_details: {
                first_name: req.user.name || 'User',
                email: req.user.email || 'user@example.com',
            },
        });
        return res.status(201).json({
            order_id: pesanan.id,
            redirect_url: transaction.redirect_url
        });
    } catch (e) {
        return res.status(500).json({ message: 'Gagal membuat transaksi', detail: e.message });
    }
};


const handleWebhook = async (req, res) => {
    try {
        const body = req.body;

        const orderId = body.order_id;
        const transactionStatus = body.transaction_status;
        const transactionId = body.transaction_id;

        await MidtransOrder.upsert({
            id: orderId,
            transaction_id: transactionId,
            transaction_status: transactionStatus,
            payment_type: body.payment_type,
            bank: body.va_numbers?.[0]?.bank || null,
            va_number: body.va_numbers?.[0]?.va_number || null,
            gross_amount: body.gross_amount,
            transaction_time: body.transaction_time,
            expiry_time: body.expiry_time,
            fraud_status: body.fraud_status
        });

        if (['settlement', 'capture'].includes(transactionStatus)) {
            const pesanan = await Pesanan.findOne({ where: { id: orderId.split("-")[0] } }); // ambil id asli jika formatnya custom
            if (pesanan) {
                await pesanan.update({ MidtransOrderId: orderId });
            }
        }

        return res.status(200).json({ message: "Webhook diterima" });
    } catch (e) {
        console.error("Webhook Error:", e);
        return res.status(500).json({ message: "Gagal proses webhook", detail: e.message });
    }
};


module.exports = { createTransaction, getTransactionStatus, recreateTransaction, handleWebhook };
