const e = require("express");
const sequelize = require("../model/index");
const db = sequelize.sequelize;
const User = sequelize.User;

const getAllUsers = async (req, res) => {
  try {
    const data = await User.findAll();

    if (data.length === 0) {
      return res.status(404).json({
        message: "Data not found",
      });
    }

    return res.status(200).json({
      message: "Successfully retrieved all user data",
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};

const getUserById = async (req, res) => {
  try {
    const data = await User.findOne({ where: { id: req.params.id, isDeleted: false } });

    if (!data || data.isDeleted) {
      return res.status(404).json({
        message: "Data not found",
      });
    }

    return res.status(200).json({
      message: "Successfully retrieved user data",
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
}

const createUser = async (req, res) => {
  try {
    const data = await User.create(req.body);

    return res.status(201).json({
      message: "Successfully created new user data",
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

    const data = await User.findOne({ where: { id: req.params.id } });

    if (!data) {
      return res.status(404).json({
        message: "Data not found",
      });
    }

    await User.update(req.body, {
      where: {
        id: req.params.id,
      },
    });

    return res.status(200).json({
      message: "Successfully updated user data",
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
    const data = await User.findOne({ where: { id: req.params.id, isDeleted: false } });
    
    if (!data || data.isDeleted) {
        return res.status(404).json({ message: "Data not found" });
    }

    data.isDeleted = true;
    await data.save();

    return res.status(200).json({ message: "Successfully deleted user data" });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
