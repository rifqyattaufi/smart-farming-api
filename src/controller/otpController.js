const axios = require('axios');
const FONNTE_API_KEY = process.env.FONNTE_API_KEY;

const sendOTP = async (req, res, next) => {
  try {
    const { otp, phoneNumber } = req.body;

    if (!otp || !phoneNumber) {
      return res.status(400).json({ message: 'OTP dan Nomor telepon diperlukan' });
    }

    const message = `Kode OTP Anda untuk Rooftop Farming Center adalah: ${otp}. Jangan bagikan kode ini kepada siapa pun.`;

    const response = await axios.post(
      'https://api.fonnte.com/send',
      {
        target: phoneNumber,
        message: message,
        countryCode: "62",
      },
      {
        headers: {
          'Authorization': FONNTE_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('SMS sent:', response.data);
    return res.status(200).json({ message: 'OTP berhasil dikirim', otp: otp }); // Kirim OTP ke client untuk testing
  } catch (error) {
    console.error('Error sending SMS:', error.response ? error.response.data : error.message);
    return res.status(500).json({ message: 'Gagal mengirim OTP' });
  }
};

const verifyOTP = async (req, res, next) => {
  try {
    const { otp, userOtp } = req.body;

    if (!otp || !userOtp) {
      return res.status(400).json({ message: 'OTP diperlukan' });
    }

    if (otp === userOtp) {
      return res.status(200).json({ message: 'OTP valid' });
    } else {
      return res.status(400).json({ message: 'OTP tidak valid' });
    }
  } catch (error) {
    next(new Error("controller/otpController.js:verifyOTP: " + error.message));
    console.log(error);
  }
};

module.exports = {
  sendOTP,
  verifyOTP,
};