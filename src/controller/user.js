const e = require("express");
const sequelize = require("../model/index");
const db = sequelize.sequelize;
const User = sequelize.User;

const getAllUsers = async (req, res) => {
  try {
    const data = await User.findAll();

    return res.json({
      message: "Success",
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};

const createUser = async (req, res) => {
  try {
    const data = await User.create(req.body);

    return res.status(201).json({
      message: "User created",
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};

const updateUser = async (req, res) => {
  try {
    await User.update(req.body, {
      where: {
        id: req.params.id,
      },
    });

    return res.status(201).json({
      message: "User updated",
      data: {
        id: req.params.id,
        ...req.body,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const usr = await User.findOne({ where: { id: req.params.id, isDeleted: false } });
    
    if (!usr) {
        return res.status(404).json({ message: "User not found" });
    }

      usr.isDeleted = true;
      await usr.save();
      res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error deleting user", error });
  }
  // try {
  //   await User.destroy({
  //     where: {
  //       id: req.params.id,
  //     },
  //   });

  //   return res.json({
  //     message: "User deleted",
  //     data: null,
  //   });
  // } catch (error) {
  //   res.status(500).json({
  //     message: error.message,
  //     detail: error,
  //   });
  // }
};

module.exports = {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
};
