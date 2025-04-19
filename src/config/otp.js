const { client } = require("./redis");

const generateOTP = async (id) => {

  if (await client.exists(`otp:${id}`)) {
    client.del(`otp:${id}`);
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  await client.set(`otp:${id}`, otp, {
    EX: 15 * 60,
  });

  return otp;
};

module.exports = {
  generateOTP,
};
