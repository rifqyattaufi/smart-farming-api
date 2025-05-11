// File: controllers/paymentController.js
const midtransClient = require('midtrans-client');
const sequelize = require('../../model/index');
const Produk = sequelize.Produk;

const snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY,
});

const createTransaction = async (req, res) => {
  try {
    const { items } = req.body; // [{ id, jumlah }]

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Daftar produk tidak boleh kosong' });
    }

    // Ambil detail produk dari DB dan validasi stok
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
        order_id: 'ORDER-' + Date.now(),
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
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: 'Gagal membuat transaksi',
      detail: err.message,
    });
  }
};

module.exports = { createTransaction };
