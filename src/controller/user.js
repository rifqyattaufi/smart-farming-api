const e = require("express");
const sequelize = require("../model/index");
const { where } = require("sequelize");
const db = sequelize.sequelize;
const User = sequelize.User;
const Toko = sequelize.Toko;
const Rekening = sequelize.Rekening;

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

const getUsersGroupByRole = async (req, res) => {
  try {
    const users = await User.findAll({
      where: { isDeleted: false },
      attributes: { exclude: ["password"] }, // exclude password if exists
    });

    // Grouping users by role
    const grouped = {
      pjawab: [],
      petugas: [],
      inventor: [],
    };

    users.forEach((user) => {
      if (grouped[user.role]) {
        grouped[user.role].push(user);
      }
    });

    return res.status(200).json({
      message: "Successfully retrieved users grouped by role",
      data: grouped,
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
    const data = await User.findOne({
      where: { id: req.params.id, isDeleted: false },
    });

    if (!data) {
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
};

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

    const updatedUser = await User.findOne({
      where: { id: req.params.id },
    });

    const usr = {
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      role: updatedUser.role,
      avatar: updatedUser.avatarUrl,
    };

    return res.status(200).json({
      message: "Successfully updated user data",
      data: {
        id: req.params.id,
        ...usr,
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
    const data = await User.findOne({
      where: { id: req.params.id, isDeleted: false },
    });

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

const getPenjual = async (req, res) => {
  try {
    const data = await User.findAll({
      where: {
        role: "penjual",
        isDeleted: false,
      },
      include: [
        {
          model: Toko,
          required: true,
          attributes: [
            "id",
            "nama",
            "logoToko",
            "alamat",
            "deskripsi",
            "tokoStatus",
          ],
          where: {
            isDeleted: false,
          },
        },
        {
          model: Rekening,
          attributes: ["id", "namaBank", "nomorRekening", "namaPenerima"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    if (data.length === 0) {
      return res.status(404).json({
        message: "No penjual found",
      });
    }

    return res.status(200).json({
      message: "Successfully retrieved all penjual data",
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};
const getPenjualById = async (req, res) => {
  id = req.params.id;
  try {
    const data = await User.findOne({
      where: {
        id: id,
        role: "penjual",
        isDeleted: false,
      },
      include: [
        {
          model: Toko,
          require: true,
          attributes: [
            "id",
            "nama",
            "logoToko",
            "alamat",
            "deskripsi",
            "tokoStatus",
          ],
        },
        {
          model: Rekening,
          attributes: ["id", "namaBank", "nomorRekening", "namaPenerima"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    if (data.length === 0) {
      return res.status(404).json({
        message: "No penjual found",
      });
    }

    return res.status(200).json({
      message: "Successfully retrieved all penjual data",
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};

const deactivateUser = async (req, res) => {
  try {
    const data = await User.findOne({
      where: { id: req.params.id, isDeleted: false },
    });

    if (!data) {
      return res.status(404).json({
        message: "Data not found",
      });
    }

    data.isActive = false;
    await data.save();

    return res.status(200).json({
      message: "Successfully deactivated user",
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};

const activateUser = async (req, res) => {
  try {
    const data = await User.findOne({
      where: { id: req.params.id, isDeleted: false },
    });

    if (!data) {
      return res.status(404).json({
        message: "Data not found",
      });
    }

    data.isActive = true;
    await data.save();

    return res.status(200).json({
      message: "Successfully activated user",
      data: data,
    });
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
  getPenjual,
  getPenjualById,
  getUsersGroupByRole,
  deactivateUser,
  activateUser,
};
