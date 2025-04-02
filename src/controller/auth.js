const e = require("express");
const User = require("../model/user");
const db = require("../config/database");
const { sendMail } = require("../config/sendMail");
const { dataValid } = require("../validation/dataValidation");

const login = async (req, res, next) => {};

const register = async (req, res, next) => {
  const t = await db.transaction();

  const valid = {
    name: "required|string",
    email: "required|email",
    password: "required|strongPassword",
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
      result = await sendMail(newUser.email, newUser.id);
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
        id: req.params.token,
      },
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid token",
      });
    }

    if (user.isActive) {
      return res.status(400).json({
        message: "Email already activated",
      });
    }

    if (user.expiredTime < new Date()) {
      return res.status(400).json({
        message: "Token expired",
      });
    }

    user.isActive = true;
    user.expiredTime = null;
    await user.save();

    return res.status(200).json({
      message: "Email activated",
    });
  } catch (error) {
    next(new Error("controller/auth.js:activate: " + error.message));
    console.log(error);
  }
};

module.exports = {
  login,
  register,
  activate,
};
