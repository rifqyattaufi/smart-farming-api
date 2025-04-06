const jwt = require("jsonwebtoken");

const generateAccessToken = (user) => {
  return jwt.sign(user, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRED_IN,
  });
};

const generateRefreshToken = (user) => {
  return jwt.sign(user, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRED_IN,
  });
};

const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (err) {
    return null;
  }
};

const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return null;
  }
};

const parseJWT = (token) => {
  return jwt.decode(token);
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  parseJWT,
  verifyRefreshToken,
  verifyAccessToken,
};
