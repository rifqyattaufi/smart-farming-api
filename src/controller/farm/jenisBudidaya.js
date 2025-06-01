const sequelize = require("../../model/index");
const { Op } = require("sequelize");
const db = sequelize.sequelize;
const JenisBudidaya = sequelize.JenisBudidaya;
const UnitBudidaya = sequelize.UnitBudidaya;
const ObjekBudidaya = sequelize.ObjekBudidaya;

const { getPaginationOptions } = require('../../utils/paginationUtils');

const getAllJenisBudidaya = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const paginationOptions = getPaginationOptions(page, limit);

    const { count, rows } = await JenisBudidaya.findAndCountAll({
      where: {
        isDeleted: false,
      },
      order: [["createdAt", "DESC"]],
      ...paginationOptions,
    });

    if (rows.length === 0 && parseInt(page,10) === 1) {
      return res.status(200).json({
        message: "Data not found",
        data: [],
        totalItems: 0,
        totalPages: 0,
        currentPage: parseInt(page, 10) || 1,
      });
    }
     if (rows.length === 0 && parseInt(page,10) > 1) {
        return res.status(200).json({
            message: "No more data",
            data: [],
            totalItems: count,
            totalPages: Math.ceil(count / paginationOptions.limit),
            currentPage: parseInt(page, 10) || 1,
        });
    }


    return res.status(200).json({
      message: "Successfully retrieved all jenis budidaya data",
      data: rows,
      totalItems: count,
      totalPages: Math.ceil(count / paginationOptions.limit),
      currentPage: parseInt(page, 10) || 1,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};

const getJenisBudidayaById = async (req, res) => {
  try {
    const data = await JenisBudidaya.findOne({
      where: { id: req.params.id, isDeleted: false },
    });

    if (!data || data.isDeleted) {
      return res.status(404).json({
        message: "Data not found",
      });
    }
    
    const dataUnitBudidaya = await UnitBudidaya.findAll({
      where: {
        jenisBudidayaId: req.params.id,
        isDeleted: false,
      },
      include: [
        {
          model: ObjekBudidaya,
          where: { isDeleted: false },
          required: false,
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    let jumlahBudidaya = 0;
    for (let i = 0; i < dataUnitBudidaya.length; i++) {
      const unitBudidaya = dataUnitBudidaya[i];
      jumlahBudidaya += unitBudidaya["jumlah"];
    }

    return res.status(200).json({
      message: "Successfully retrieved jenis budidaya data",
      data: {
        jenisBudidaya: data,
        unitBudidaya: dataUnitBudidaya,
        jumlahBudidaya: jumlahBudidaya,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};

const getJenisBudidayaSearch = async (req, res) => {
  try {
    const { nama, tipe } = req.params;
    const { page, limit } = req.query;
    const paginationOptions = getPaginationOptions(page, limit);

    const whereClause = {
        isDeleted: false,
    };

    if (nama && nama.toLowerCase() !== 'all' && nama.trim() !== '') {
        whereClause.nama = {
            [Op.like]: `%${nama}%`,
        };
    }
    if (tipe && tipe.toLowerCase() !== 'all' && tipe.trim() !== '') {
        whereClause.tipe = tipe;
    }


    const { count, rows } = await JenisBudidaya.findAndCountAll({
      where: whereClause,
      order: [["createdAt", "DESC"]],
      ...paginationOptions,
    });

    if (rows.length === 0 && parseInt(page,10) === 1) {
      return res.status(200).json({
        message: "Data not found for the given search criteria",
        data: [],
        totalItems: 0,
        totalPages: 0,
        currentPage: parseInt(page, 10) || 1,
      });
    }
    if (rows.length === 0 && parseInt(page,10) > 1) {
        return res.status(200).json({
            message: "No more data for this search",
            data: [],
            totalItems: count,
            totalPages: Math.ceil(count / paginationOptions.limit),
            currentPage: parseInt(page, 10) || 1,
        });
    }

    return res.status(200).json({
      message: "Successfully retrieved jenis budidaya data",
      data: rows,
      totalItems: count,
      totalPages: Math.ceil(count / paginationOptions.limit),
      currentPage: parseInt(page, 10) || 1,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};

const getJenisBudidayaByTipe = async (req, res) => {
  try {
    const { tipe } = req.params;
    const { page, limit } = req.query;
    const paginationOptions = getPaginationOptions(page, limit);

    const { count, rows } = await JenisBudidaya.findAndCountAll({
      where: {
        tipe: tipe,
        // Jika ingin pencarian partial, gunakan Op.like
        // tipe: {
        //   [Op.like]: `%${tipe}%`,
        // },
        isDeleted: false,
      },
      order: [["createdAt", "DESC"]],
      ...paginationOptions,
    });

    if (rows.length === 0 && parseInt(page,10) === 1) {
      return res.status(200).json({
        message: "Data not found for this type",
        data: [],
        totalItems: 0,
        totalPages: 0,
        currentPage: parseInt(page, 10) || 1,
      });
    }
    if (rows.length === 0 && parseInt(page,10) > 1) {
        return res.status(200).json({
            message: "No more data for this type",
            data: [],
            totalItems: count,
            totalPages: Math.ceil(count / paginationOptions.limit),
            currentPage: parseInt(page, 10) || 1,
        });
    }

    return res.status(200).json({
      message: "Successfully retrieved jenis budidaya data by type",
      data: rows,
      totalItems: count,
      totalPages: Math.ceil(count / paginationOptions.limit),
      currentPage: parseInt(page, 10) || 1,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};


const createJenisBudidaya = async (req, res) => {
  try {
    const data = await JenisBudidaya.create(req.body);
    res.locals.createdData = data.toJSON();
    return res.status(201).json({
      message: "Successfully created new jenis budidaya data",
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};

const updateJenisBudidaya = async (req, res) => {
  try {
    const data = await JenisBudidaya.findOne({
      where: { id: req.params.id, isDeleted: false },
    });

    if (!data) {
      return res.status(404).json({
        message: "Data not found",
      });
    }

    await JenisBudidaya.update(req.body, {
      where: {
        id: req.params.id,
      },
    });

    const updated = await JenisBudidaya.findOne({
      where: { id: req.params.id },
    });

    res.locals.updatedData = updated.toJSON();

    return res.status(200).json({
      message: "Successfully updated jenis budidaya data",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};

const deleteJenisBudidaya = async (req, res) => {
  const t = await db.transaction();

  try {
    const data = await JenisBudidaya.findOne({
      where: { id: req.params.id, isDeleted: false },
      transaction: t,
    });

    if (!data) {
      await t.rollback();
      return res.status(404).json({
        message: "Data not found",
      });
    }

    const dataUnitBudidaya = await UnitBudidaya.findAll({
      where: {
        jenisBudidayaId: req.params.id,
        isDeleted: false,
      },
      transaction: t,
    });

    for (const obj of dataUnitBudidaya) {
      await ObjekBudidaya.update(
        { isDeleted: true },
        {
          where: {
            unitBudidayaId: obj.id,
            isDeleted: false,
          },
          transaction: t,
        }
      );
    }

    await UnitBudidaya.update(
      { isDeleted: true },
      {
        where: {
          jenisBudidayaId: req.params.id,
          isDeleted: false,
        },
        transaction: t,
      }
    );

    await data.update({ isDeleted: true }, { transaction: t });

    await t.commit();

    res.locals.updatedData = data.toJSON();

    return res.status(200).json({
      message: "Jenis Budidaya and related data deleted successfully",
      data: { id: req.params.id }
    });
  } catch (error) {
    await t.rollback();
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};

module.exports = {
  getAllJenisBudidaya,
  getJenisBudidayaById,
  getJenisBudidayaSearch,
  createJenisBudidaya,
  updateJenisBudidaya,
  deleteJenisBudidaya,
  getJenisBudidayaByTipe,
};