const nodemailer = require("nodemailer");

const base_url = process.env.BASE_URL;

const transporter = nodemailer.createTransport({
  service: process.env.MAIL_SERVICE,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

const createEmail = (email, token) => {
  return {
    from: process.env.MAIL_FROM,
    to: email,
    subject: "Email Verification For SmartFarming APP",
    html: `<h1>Welcome to SmartFarming</h1>
        <p>Click the link below to verify your email address:</p>
        <a href="${base_url}/auth/activate/${token}">Verify Email</a>
        <p>If you didn't request this, please ignore this email.</p>
        <p>Thank you for using SmartFarming!</p>
        <p>Best regards,</p>
        <p>SmartFarming Team</p>
        `,
  };
};

const sendMail = (email, token) => {
  return new Promise((resolve, reject) => {
    transporter.sendMail(createEmail(email, token), (err, info) => {
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
};
