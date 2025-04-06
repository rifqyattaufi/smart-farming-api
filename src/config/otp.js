const { client } = require("./redis");

const generateOTP = async (id) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  //epired in 15 minute
  await client.set(`otp:${id}`, otp, {
    EX: 15 * 60,
  });

  return otp;
};

module.exports = {
  generateOTP,
};
