const sequelize = require("../../model/index");
const { dataValid } = require("../../validation/dataValidation");
const Keranjang = sequelize.Keranjang;
const Produk = sequelize.Produk;
const Toko = sequelize.Toko;

const createKeranjang = async (req, res) => {
    try {
        const { produkId, jumlah } = req.body;
        if (!produkId || !jumlah || jumlah < 1) {
            return res.status(400).json({
                message: "Product ID and quantity greater than 0 are required",
            });
        }

        const existingCartItem = await Keranjang.findOne({
            where: {
                ProdukId: produkId,
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
                ProdukId: produkId,
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

const getKeranjangByUserId = async (req, res) => {
    try {
        const userId = req.user.id;

        const cartItems = await Keranjang.findAll({
            where: {
                UserId: userId,
                isDeleted: false
            },
            include: [
                {
                    model: sequelize.Produk,
                    where: {
                        isDeleted: false
                    },
                    include: [
                        {
                            model: sequelize.Toko,
                            attributes: ['id', 'nama', 'logoToko', "alamat"],
                        }
                    ]
                }
            ],
            order: [
                [Produk, 'createdAt', 'DESC']
            ]
        });

        if (cartItems.length === 0) {
            return res.status(200).json({
                message: "Cart is empty",
                data: []
            });
        }

        return res.status(200).json({
            message: "Successfully retrieved cart items",
            data: cartItems
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Error retrieving cart items",
            detail: error.message
        });
    }
};
const updateKeranjang = async (req, res) => {
    try {
        const { id } = req.params;
        const { jumlah } = req.body;

        if (!jumlah || jumlah < 1) {
            return res.status(400).json({
                message: "Jumlah salah, keranjang tidak bisa berjumlah 0.",
            });
        }

        const cartItem = await Keranjang.findOne({
            where: {
                id,
                UserId: req.user.id,
                isDeleted: false
            }
        });

        if (!cartItem) {
            return res.status(404).json({
                message: "Cart item not found",
            });
        }

        cartItem.jumlah = parseInt(jumlah);
        await cartItem.save();

        return res.status(200).json({
            message: "Cart item updated successfully",
            data: cartItem,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Error updating cart item",
            detail: error.message
        });
    }
};

const deleteKeranjang = async (req, res) => {
    try {
        const { id } = req.params;

        const cartItem = await Keranjang.findOne({
            where: {
                id,
                UserId: req.user.id,
                isDeleted: false
            }
        });

        if (!cartItem) {
            return res.status(404).json({
                message: "Cart item not found",
            });
        }

        cartItem.isDeleted = true;
        await cartItem.save();

        return res.status(200).json({
            message: "Cart item deleted successfully",
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Error deleting cart item",
            detail: error.message
        });
    }
};


module.exports = {
    createKeranjang,
    getKeranjangByUserId,
    updateKeranjang,
    deleteKeranjang
};