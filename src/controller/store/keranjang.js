const sequelize = require("../../model/index");
const { dataValid } = require("../../validation/dataValidation");
const Keranjang = sequelize.Keranjang;
const Op = sequelize.Sequelize.Op;

const createKeranjang = async (req, res) => {
    try {
        const { id_produk, jumlah } = req.body;
        const { error } = dataValid(req.body, "createKeranjang");
        if (error) {
        return res.status(400).json({
            message: error.details[0].message,
        });
        }
    
        const data = await Keranjang.create({
        id_produk,
        jumlah,
        UserId: req.user.id,
        });
    
        return res.status(201).json({
        message: "Successfully added to cart",
        data: data,
        });
    } catch (error) {
        res.status(500).json({
        message: error.message,
        detail: error,
        });
    }
}

module.exports = {
    createKeranjang
};