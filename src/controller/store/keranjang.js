const sequelize = require("../../model/index");
const { dataValid } = require("../../validation/dataValidation");
const Keranjang = sequelize.Keranjang;
const Op = sequelize.Sequelize.Op;

const createKeranjang = async (req, res) => {
    try {
        const { produkId, jumlah } = req.body;
        const { error } = dataValid(req.body, "createKeranjang");
        if (error) {
            return res.status(400).json({
                message: error.details[0].message,
            });
        }

        // Check if this product is already in user's cart
        const existingCartItem = await Keranjang.findOne({
            where: {
                produkId,
                UserId: req.user.id,
                isDeleted: false
            }
        });

        let data;
        
        if (existingCartItem) {
            existingCartItem.jumlah += parseInt(jumlah);
            data = await existingCartItem.save();
            
            return res.status(200).json({
                message: "Cart quantity updated successfully",
                data: data,
            });
        } else {
            data = await Keranjang.create({
                produkId,
                jumlah,
                UserId: req.user.id,
            });
            
            return res.status(201).json({
                message: "Successfully added to cart",
                data: data,
            });
        }
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