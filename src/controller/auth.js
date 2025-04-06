const e = require("express");
const User = require("../model/user");
const db = require("../config/database");
const { sendMail, sendResetPasswordMail } = require("../config/sendMail");
const { dataValid } = require("../validation/dataValidation");
const { compare } = require("bcrypt");
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require("../config/jwt");
const { client } = require("../config/redis");
const { generateOTP } = require("../config/otp");

const login = async (req, res, next) => {
  try {
    const valid = {
      email: "required|email",
      password: "required",
    };

    const user = await dataValid(valid, req.body);

    const data = user.data;

    if (user.message.length > 0) {
      return res.status(400).json({
        error: user.message,
        message: "Login failed",
      });
    }

    const userExist = await User.findOne({
      where: {
        email: data.email,
      },
    });

    if (!userExist.isActive) {
      return res.status(400).json({
        message: "Email is not activated",
      });
    }

    if (userExist.isDeleted) {
      return res.status(400).json({
        message: "Email is banned",
      });
    }

    if (!userExist) {
      return res.status(400).json({
        message: "Email not registered",
      });
    }

    if (!compare(data.password, userExist.password)) {
      return res.status(400).json({
        message: "Wrong password",
      });
    }

    const usr = {
      id: userExist.id,
      name: userExist.name,
      email: userExist.email,
      role: userExist.role,
    };

    const token = generateAccessToken(usr);
    const refreshToken = generateRefreshToken(usr);

    return res.status(200).json({
      message: "Login success",
      data: usr,
      token: token,
      refreshToken: refreshToken,
    });
  } catch (error) {
    next(new Error("controller/auth.js:login: " + error.message));
    console.log(error);
  }
};

const register = async (req, res, next) => {
  const t = await db.transaction();

  const valid = {
    name: "required|string",
    email: "required|email",
    password: "required|strongPassword",
    confirmPassword: "required|same:password",
    role: "required|contains:inventor,user,petugas,pjawab",
  };

  try {
    const user = await dataValid(valid, req.body);
    if (user.message.length > 0) {
      return res.status(400).json({
        error: user.message,
        message: "Registration failed",
      });
    }

    const userExisted = await User.findOne({
      where: {
        email: user.data.email,
      },
    });

    if (userExisted && userExisted.isDeleted) {
      return res.status(400).json({
        message: "this email has been banned",
      });
    }

    if (userExisted && userExisted.isActive) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }

    if (
      userExisted &&
      !userExisted.isActive &&
      Date.parse(userExisted.expiredTime) > new Date()
    ) {
      return res.status(400).json({
        message:
          "Email already registered, please check your email to activate your account",
      });
    }

    if (userExisted) {
      userExisted.destroy({ transaction: t });
    }

    const userData = {
      ...user.data,
      expiredTime: user.data.role === "user" ? new Date() : null,
    };

    if (user.data.role !== "user") {
      userData.isActive = true;
    }

    const newUser = await User.create(userData, {
      transaction: t,
    });

    let result = true;

    if (newUser.role === "user") {
      const otp = await generateOTP(newUser.id);
      result = await sendMail(newUser.email, otp);
    }

    if (!result) {
      await t.rollback();
      next(new Error("Failed to send email"));
    } else {
      await t.commit();
      return res.status(201).json({
        message: "User created",
        data: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          expiredTime: newUser.expiredTime,
        },
      });
    }
  } catch (error) {
    await t.rollback();
    next(new Error("controller/auth.js:register: " + error.message));
    console.log(error);
  }
};

const activate = async (req, res, next) => {
  try {
    const user = await User.findOne({
      where: {
        email: req.body.email,
      },
    });
    const saved = await client.get(`otp:${user.id}`);

    if (!user) {
      return res.status(400).json({
        message: "Email not registered",
      });
    }

    if (user.isActive) {
      return res.status(400).json({
        message: "Email already activated",
      });
    }

    if (user.isDeleted) {
      return res.status(400).json({
        message: "Email is banned",
      });
    }

    if (!saved) {
      return res.status(400).json({
        message: "OTP expired",
      });
    }

    if (saved !== req.body.otp) {
      return res.status(400).json({
        message: "Wrong OTP",
      });
    }

    await client.del(`otp:${user.id}`);
    user.isActive = true;
    user.expiredTime = null;
    await user.save();
    return res.status(200).json({
      message: "Email activated",
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    next(new Error("controller/auth.js:activate: " + error.message));
    console.log(error);
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const headerToken = req.headers["authorization"];
    const token = headerToken && headerToken.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const data = verifyRefreshToken(token);
    const user = User.findOne({
      where: {
        id: data.id,
      },
    });

    if (!user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    if (user.isDeleted) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const usr = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    const newToken = generateAccessToken(usr);
    const newRefreshToken = generateRefreshToken(usr);

    return res.status(200).json({
      message: "Token refreshed",
      data: usr,
      token: newToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    next(new Error("controller/auth.js:refreshToken: " + error.message));
    console.log(error);
  }
};

const forgotPassword = async (req, res, next) => {
  const t = await db.transaction();
  const valid = {
    email: "required|email",
  };
  try {
    const user = await dataValid(valid, req.body);
    if (user.message.length > 0) {
      return res.status(400).json({
        error: user.message,
        message: "Forgot password failed",
      });
    }

    const userExist = await User.findOne({
      where: {
        email: user.data.email,
      },
    });

    if (!userExist) {
      return res.status(400).json({
        message: "Email not registered",
      });
    }

    if (userExist.isDeleted) {
      return res.status(400).json({
        message: "Email is banned",
      });
    }

    if (!userExist.isActive) {
      return res.status(400).json({
        message: "Email is not activated",
      });
    }

    const otp = await generateOTP(userExist.id);
    const result = await sendResetPasswordMail(userExist.email, otp);

    if (!result) {
      await t.rollback();
      next(new Error("Failed to send email"));
    } else {
      await t.commit();
      return res.status(200).json({
        message: "Email sent",
        data: {
          id: userExist.id,
          name: userExist.name,
          email: userExist.email,
        },
      });
    }
  } catch (error) {
    await t.rollback();
    next(new Error("controller/auth.js:forgotPassword: " + error.message));
  }
};

const resetPassword = async (req, res, next) => {
  const t = await db.transaction();
  const valid = {
    email: "required|email",
    password: "required|strongPassword",
    confirmPassword: "required|same:password",
    otp: "required",
  };
  try {
    const user = await dataValid(valid, req.body);
    if (user.message.length > 0) {
      return res.status(400).json({
        error: user.message,
        message: "Reset password failed",
      });
    }

    const userExist = await User.findOne({
      where: {
        email: req.body.email,
      },
    });

    if (!userExist) {
      return res.status(400).json({
        message: "User not found",
      });
    }

    if (userExist.isDeleted) {
      return res.status(400).json({
        message: "Email is banned",
      });
    }

    if (!userExist.isActive) {
      return res.status(400).json({
        message: "Email is not activated",
      });
    }

    const saved = await client.get(`otp:${userExist.id}`);

    if (!saved) {
      return res.status(400).json({
        message: "OTP expired",
      });
    }

    if (saved !== user.data.otp) {
      return res.status(400).json({
        message: "Wrong OTP",
      });
    }

    await client.del(`otp:${userExist.id}`);
    userExist.password = user.data.password;
    await userExist.save({ transaction: t });
    await t.commit();
    return res.status(200).json({
      message: "Password changed",
      data: {
        id: userExist.id,
        name: userExist.name,
        email: userExist.email,
      },
    });
  } catch (error) {
    await t.rollback();
    next(new Error("controller/auth.js:resetPassword: " + error.message));
  }
};

module.exports = {
  login,
  register,
  activate,
  refreshToken,
  forgotPassword,
  resetPassword,
};
