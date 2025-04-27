const sequelize = require("../../model/index");
const { dataValid } = require("../../validation/dataValidation");
const Artikel = sequelize.Artikel;
const Op = sequelize.Sequelize.Op;

const getAllArtikel = async (req, res) => {
    try {
        const data = await Artikel.findAll({
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
            message: "Successfully retrieved all artikel data",
            data: data,
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
            detail: error,
        });
    }
};

const getArtikelById = async (req, res) => {
    try {
        const data = await Artikel.findOne({
            where: {
                id: req.params.id,
                isDeleted: false,
            },
        });

        if (!data || data.isDeleted) {
            return res.status(404).json({
                message: "Data not found",
            });
        }

        return res.status(200).json({
            message: "Successfully retrieved artikel data",
            data: data,
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
            detail: error,
        });
    }
};

const getArtikelByTitle = async (req, res) => {
    try {
        const { judul } = req.params;

        const data = await Artikel.findAll({
            where: {
                judul: {
                    [Op.like]: `%${judul}%`,
                },
                isDeleted: false,
            },
        });

        if (data.length === 0) {
            return res.status(404).json({ message: "Data not found" });
        }

        return res.status(200).json({
            message: "Successfully retrieved artikel data",
            data: data,
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
            detail: error,
        });
    }
};

const createArtikel = async (req, res) => {
    try {
        const { judul, images, deskripsi } = req.body;

        if (!judul || !deskripsi) {
            return res.status(400).json({
                message: "Fields judul and deskripsi are required.",
            });
        }

        const data = await Artikel.create({
            judul,
            images,
            deskripsi,
            UserId: req.user.id,
        });

        return res.status(201).json({
            message: "Successfully created new artikel",
            data,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error",
            detail: error.message,
        });
    }
};

const updateArtikel = async (req, res) => {
    try {
        const data = await Artikel.findOne({
            where: { id: req.params.id, isDeleted: false },
        });

        if (!data || data.isDeleted) {
            return res.status(404).json({
                message: "Data not found",
            });
        }

        await Artikel.update(req.body, {
            where: {
                id: req.params.id,
            },
        });

        const updated = await Artikel.findOne({ where: { id: req.params.id } });

        res.locals.updatedData = updated.toJSON();

        return res.status(200).json({
            message: "Successfully updated artikel data",
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

const deleteArtikel = async (req, res) => {
    try {
        const data = await Artikel.findOne({
            where: { id: req.params.id, isDeleted: false },
        });

        if (!data || data.isDeleted) {
            return res.status(404).json({
                message: "Data not found",
            });
        }

        data.isDeleted = true;
        await data.save();

        res.locals.updatedData = data;

        return res.status(200).json({
            message: "Successfully deleted artikel data",
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
            detail: error,
        });
    }
};

module.exports = {
    getAllArtikel,
    getArtikelById,
    getArtikelByTitle,
    createArtikel,
    updateArtikel,
    deleteArtikel,
};