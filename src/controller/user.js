const UserModel = require('../model/user');

const getAllUsers = async (req, res) => {
    try {
        const [data] = await UserModel.getAllUser();

        return res.json({
            message: "Success",
            data: data
        })
    } catch (error) {
        res.status(500).json({
            message: error.message,
            detail: error
        })
    }
}

const createUser = async (req, res) => {
    try {
        const [data] = await UserModel.createUser(req.body);

        return res.status(201).json({
            message: "User created",
            data: {
                id: data.insertId,
                ...req.body
            }
        })
    } catch (error) {
        res.status(500).json({
            message: error.message,
            detail: error
        })
    }
}

const updateUser = async (req, res) => {
    try {
        await UserModel.updateUser(req.body, req.params.id);

        return res.status(201).json({
            message: "User updated",
            data: {
                id: req.params.id,
                ...req.body
            }
        })
    }

    catch (error) {
        res.status(500).json({
            message: error.message,
            detail: error
        })
    }
}

const deleteUser = async (req, res) => {
    try {
        await UserModel.deleteUser(req.params.id);

        return res.json({
            message: "User deleted",
            data: null
        })
    } catch (error) {
        res.status(500).json({
            message: error.message,
            detail: error
        })
    }
}

module.exports = {
    getAllUsers,
    createUser,
    updateUser,
    deleteUser
};