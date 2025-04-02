const validator = require("validator");
const { sanitize, isExist } = require("./sanitization");
const { options, param } = require("../routes/auth");

const dataValid = async (valid, dt) => {
  let msg = [];
  let dummy = [];
  let data = await sanitize(dt);

  const message = await new Promise((resolve, reject) => {
    Object.entries(data).forEach(async (item) => {
      const [key, value] = item;
      if (isExist(valid[key])) {
        const validate = valid[key].split("|");
        dummy = await new Promise((resolve, reject) => {
          let ms = [];
          validate.forEach((v) => {
            let param = [];
            if (v.includes(":")) {
              param = v.split(":");
              v = param[0];
              param = param[1].split(",");
              console.log(param);
              console.log(v);
            }
            switch (v) {
              case "required":
                if (isExist(data[key]) && validator.isEmpty(data[key])) {
                  ms.push(key + " is required");
                }
                break;
              case "email":
                if (isExist(data[key]) && !validator.isEmail(data[key])) {
                  ms.push(key + " is not a valid email");
                }
                break;
              case "strongPassword":
                if (
                  isExist(data[key]) &&
                  !validator.isStrongPassword(data[key])
                ) {
                  ms.push(
                    key +
                      " most be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number and one symbol"
                  );
                }
                break;
              case "string":
                if (
                  isExist(data[key]) &&
                  !validator.isAlpha(data[key], undefined, { ignore: " " })
                ) {
                  ms.push(key + " must be a string");
                }
                break;
              case "int":
                if (
                  isExist(data[key]) &&
                  !validator.isAlphanumeric(data[key])
                ) {
                  ms.push(key + " must be a number");
                }
                break;
              case "contains":
                if (isExist(data[key]) && !validator.isIn(data[key], param)) {
                  ms.push(key + " must contain one of this value " + param);
                }
                break;
            }
          });
          resolve(ms);
        });
      }
      msg.push(...dummy);
    });
    resolve(msg);
  });
  return {
    message,
    data,
  };
};

module.exports = {
  dataValid,
};
