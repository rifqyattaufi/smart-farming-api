const nodemailer = require("nodemailer");

const base_url = process.env.BASE_URL;

const transporter = nodemailer.createTransport({
  service: process.env.MAIL_SERVICE,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

const createEmail = (email, otp) => {
  return {
    from: process.env.MAIL_FROM,
    to: email,
    subject: "Email Verification For SmartFarming APP",
    html: `<div style="text-align: center; padding: 20px;">
        <h2>Welcome to SmartFarming</h2>
        <p>Use the OTP below to verify your email address on the SmartFarming app.</p>
        <h3 style="color: #4CAF50;">${otp}</h3>
        <p>This OTP will expire in 15 minutes.</p>
        <p>If you didn't create an account, no further action is required.</p>
      </div>`,
  };
};

const sendMail = (email, otp) => {
  return new Promise((resolve, reject) => {
    transporter.sendMail(createEmail(email, otp), (err, info) => {
      if (err) {
        console.log(err);
        reject(err);
      } else {
        console.log("Email sent: " + info.response);
        resolve(true);
      }
    });
  });
};

const createResetPassword = (email, otp) => {
  return {
    from: process.env.MAIL_FROM,
    to: email,
    subject: "Reset Password For SmartFarming APP",
    html: `<div style="text-align: center; padding: 20px;">
        <h2>Reset Password</h2>
        <p>Use the OTP below to reset your password on the SmartFarming app.</p>
        <h3 style="color: #4CAF50;">${otp}</h3>
        <p>This OTP will expire in 15 minutes.</p>
        <p>If you didn't request a password reset, no further action is required.</p>
      </div>`,
  };
}

const sendResetPasswordMail = (email, otp) => {
  return new Promise((resolve, reject) => {
    transporter.sendMail(createResetPassword(email, otp), (err, info) => {
      if (err) {
        console.log(err);
        reject(err);
      } else {
        console.log("Email sent: " + info.response);
        resolve(true);
      }
    });
  });
};

module.exports = {
  sendMail,
  sendResetPasswordMail
};
