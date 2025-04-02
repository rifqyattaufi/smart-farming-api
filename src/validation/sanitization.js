const validator = require("validator");

const sanitize = async (data) => {
  let obj = {};

  return await new Promise((resolve, reject) => {
    Object.entries(data).forEach((element) => {
      const [key, value] = element;
      if (key == "password") {
        obj[key] = validator.trim(value);
      } else {
        obj[key] = validator.escape(validator.trim(value));
      }
    });

    resolve(obj);
  });
};

const isExist = (variable) => {
  if (typeof variable === "undefined") {
    return false;
  }

  return true;
};

module.exports = {
  sanitize,
  isExist,
};
