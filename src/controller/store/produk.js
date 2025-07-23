const sequelize = require("../../model/index");
const Produk = sequelize.Produk;
const Komoditas = sequelize.Komoditas;
const User = sequelize.User;

const createProduk = async (req, res) => {
    const idToko = await User.findOne({
        include: [{
            model: sequelize.Toko,
            attributes: ['id'],
        }],
        where: { id: req.user.id },
    })


    try {
        await Produk.create({
            ...req.body,
            TokoId: idToko.Toko.id,
        })
        return res.status(201).json({
            message: "Berhasil menambahkan produk",
            data: req.body,
        })
    }
    catch (error) {
        return res.status(500).json({
            message: error.message,
            detail: error,
        })
    }
}

const createProdukByKomoditas = async (req, res) => {
    const idToko = await User.findOne({
        include: [{
            model: sequelize.Toko,
            attributes: ['id'],
        }],
        where: { id: req.user.id },
    })
    const existingProduk = await Komoditas.findOne({
        where: {
            id: req.body.komoditasId,
            isDeleted: false,
        },
        include: [{
            model: Produk,
            required: true,
            attributes: ['id'],
        }]
    });
    // return res.status(500).json({
    //     existingProduk,
    // })
    try {
        if (!existingProduk) {
            const produk = await Produk.create({
                ...req.body,
                TokoId: idToko.Toko.id,
            })
            const produkId = produk.id;
            await sequelize.Komoditas.update(
                { produkId: produkId },
                { where: { id: req.body.komoditasId } }
            );

        } else {

            const produk = await Produk.update(
                {
                    ...req.body,
                    TokoId: idToko.Toko.id,
                    isDeleted: false,
                },
                { where: { id: existingProduk.Produk.id } },
            );
        }
        return res.status(201).json({
            message: "Berhasil menambahkan produk Komoditas",
            data: req.body,
        })
    }
    catch (error) {
        return res.status(500).json({
            message: error.message,
            detail: error,
        })
    }
}
const getAll = async (req, res) => {
    try {
        const data = await Produk.findAll({
            where: {
                isDeleted: false,
            },
        });

        if (data.length === 0) {
            return res.status(404).json({
                message: "Data not found",
            });
        }

        return res.status(200).json({
            message: "Successfully retrieved all produk data",
            data: data,
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
            detail: error,
        });
    }
}
const getProdukByRFC = async (req, res) => {
    try {
        const data = await Produk.findAll({
            include: [{
                model: sequelize.Toko,
                attributes: ['TypeToko'],
                where: { TypeToko: 'rfc' },
            }],
        });

        if (data.length === 0) {
            return res.status(404).json({
                message: "Data not found",
            });
        }

        return res.status(200).json({
            message: "Successfully retrieved produk data",
            data: data,
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
            detail: error,
        });
    }
};
const getProdukUMKM = async (req, res) => {
    try {
        const data = await Produk.findAll({
            include: [{
                model: sequelize.Toko,
                attributes: ['TypeToko'],
                where: { TypeToko: 'umkm' },
            }],
        });

        if (data.length === 0) {
            return res.status(404).json({
                message: "Data not found",
            });
        }

        return res.status(200).json({
            message: "Successfully retrieved produk data",
            data: data,
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
            detail: error,
        });
    }
};

const getProdukById = async (req, res) => {
    try {
        const data = await Produk.findOne({
            where: {
                id: req.params.id,
            },
            include: [{
                model: sequelize.Toko,
                attributes: ['TypeToko'],
            }],
        });
        return res.status(200).json({
            message: "Successfully retrieved produk data",
            data: [data],
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
            detail: error,
        });
    }
}
const getProdukbyTokoId = async (req, res) => {
    try {
        const data = await Produk.findAll({
            where: {
                TokoId: req.params.id,
                isDeleted: false,
            },
        });

        if (!data || data.isDeleted) {
            return res.status(404).json({
                message: "Data not found",
            });
        }

        return res.status(200).json({
            message: "Successfully retrieved produk data",
            data: data,
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
            detail: error,
        });
    }
}
const getAllProdukByIdUser = async (req, res) => {
    try {
        const idToko = await User.findOne({
            include: [{
                model: sequelize.Toko,
                attributes: ['id'],
            }],
            where: { id: req.params.id },
        })
        const data = await Produk.findAll({
            where: {
                TokoId: idToko.Toko.id,
            },
        });
        if (data.length === 0) {
            return res.status(404).json({
                message: "Data not found",
            });
        }
        return res.status(200).json({
            message: "Successfully retrieved produk data",
            data: data,
        });

    } catch (error) {
        res.status(500).json({
            message: error.message,
            detail: error,
        });
    }
}
const updateProduk = async (req, res) => {
    try {
        const data = await Produk.findOne({
            where: { id: req.params.id, isDeleted: false },
        });

        if (!data) {
            return res.status(404).json({
                message: "Produk not found",
            });
        }

        await Produk.update(req.body, {
            where: {
                id: req.params.id,
            },
        });

        const updated = await Produk.findOne({ where: { id: req.params.id } });

        return res.status(200).json({
            message: "Successfully updated produk data",
            data: updated,
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message,
            detail: error,
        });
    }
}

const deleteProdukById = async (req, res) => {
    try {
        const data = await Produk.findOne({
            where: {
                id: req.params.id,
                isDeleted: false
            },
        });
        if (!data) {
            return res.status(404).json({
                message: "Produk not found",
            });
        }
        else {
            await Produk.update(
                { isDeleted: true },
                { where: { id: req.params.id } }
            );
        }
        return res.status(200).json({
            message: "Successfully deleted produk data",
            data: data,
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message,
            detail: error,
        });
    }
}
const activateProdukById = async (req, res) => {
    try {
        const data = await Produk.findOne({
            where: {
                id: req.params.id,
                isDeleted: true
            },
        });
        if (!data) {
            return res.status(404).json({
                message: "Produk not found",
            });
        }
        else {
            await Produk.update(
                { isDeleted: false },
                { where: { id: req.params.id } }
            );
        }
        return res.status(200).json({
            message: "Successfully activate produk data",
            data: data,
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message,
            detail: error,
        });
    }
}
const getStokByProdukId = async (req, res) => {
    try {
        const data = await Produk.findOne({
            attributes: ['id', 'stok', 'nama'],
            where: {
                id: req.params.id,
                isDeleted: false,
            },
        });

        if (!data) {
            return res.status(404).json({
                message: "Produk not found",
            });
        }

        return res.status(200).json({
            message: "Successfully retrieved produk stock",
            data: {
                id: data.id,
                nama_produk: data.nama_produk,
                stok: data.stok
            },
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message,
            detail: error,
        });
    }
}


module.exports = {
    createProduk,
    getProdukByRFC,
    getProdukUMKM,
    getAll,
    getProdukById,
    updateProduk,
    deleteProdukById,
    activateProdukById,
    getAllProdukByIdUser,
    getProdukbyTokoId,
    getStokByProdukId,
    createProdukByKomoditas,
};
