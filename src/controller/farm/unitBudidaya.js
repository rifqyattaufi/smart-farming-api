const sequelize = require("../../model/index");
const db = sequelize.sequelize;
const JenisBudidaya = sequelize.JenisBudidaya;
const UnitBudidaya = sequelize.UnitBudidaya;
const ObjekBudidaya = sequelize.ObjekBudidaya;
const Logs = sequelize.Logs;
const Op = sequelize.Sequelize.Op;

const getAllUnitBudidaya = async (req, res) => {
  try {
    const data = await UnitBudidaya.findAll({
      where: {
        isDeleted: false,
      },
      order: [["createdAt", "DESC"]],
    });

    if (data.length === 0) {
      return res.status(404).json({
        message: "Data not found",
      });
    }

    return res.status(200).json({
      message: "Successfully retrieved all unit budidaya data",
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};

const getUnitBudidayaById = async (req, res) => {
  try {
    const data = await UnitBudidaya.findOne({
      include: [
        {
          model: JenisBudidaya,
          required: true,
        },
      ],
      where: {
        id: req.params.id,
        isDeleted: false,
      },
    });

    const dataObjekBudidaya = await ObjekBudidaya.findAll({
      include: [
        {
          model: UnitBudidaya,
          attributes: ["id"],
          required: true,
          include: [
            {
              model: JenisBudidaya,
              attributes: ["nama", "gambar"],
              required: true,
            },
          ],
        },
      ],
      where: {
        UnitBudidayaId: req.params.id,
        isDeleted: false,
      },
      order: [
        [db.fn("length", db.col("namaId")), "ASC"],
        ["namaId", "ASC"],
      ],
    });

    if (!data || data.isDeleted) {
      return res.status(404).json({
        message: "Data not found",
      });
    }

    return res.status(200).json({
      message: "Successfully retrieved unit budidaya data",
      data: {
        unitBudidaya: data,
        objekBudidaya: dataObjekBudidaya,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};

const getUnitBudidayaByName = async (req, res) => {
  try {
    const { nama, tipe } = req.params;

    const data = await UnitBudidaya.findAll({
      include: [
        {
          model: JenisBudidaya,
          where: {
            tipe: tipe,
          },
        },
      ],
      where: {
        nama: {
          [Op.like]: `%${nama}%`,
        },
        isDeleted: false,
      },
      order: [["createdAt", "DESC"]],
    });

    if (data.length === 0) {
      return res.status(404).json({ message: "Data not found" });
    }

    return res.status(200).json({
      message: "Successfully retrieved unit budidaya data",
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};

const createUnitBudidaya = async (req, res) => {
  const t = await db.transaction();

  try {
    const { jumlah = 0, tipe, jenisBudidayaId } = req.body;

    const jenisBudidaya = await JenisBudidaya.findOne({
      where: { id: jenisBudidayaId },
      isDeleted: false,
      transaction: t,
    });

    if (!jenisBudidaya || jenisBudidaya.isDeleted) {
      await t.rollback();
      return res.status(404).json({ message: "Data not found" });
    }

    const data = await UnitBudidaya.create(
      {
        ...req.body,
        JenisBudidayaId: jenisBudidayaId,
        isDeleted: false,
      },
      { transaction: t }
    );

    let objekList = [];
    let createdObjekList = [];

    if (tipe.toLowerCase() == "individu") {
      objekList = Array.from({ length: jumlah }, (_, i) => {
        const prefix = jenisBudidaya.tipe === "hewan" ? "Ternak" : "Tanaman";
        const deskripsi = `${prefix} ${jenisBudidaya.nama} pada ${
          data.nama
        } nomor ${i + 1}`;

        return {
          UnitBudidayaId: data.id,
          namaId: `${jenisBudidaya.nama} #${i + 1}`,
          status: true,
          deskripsi,
          isDeleted: false,
        };
      });

      createdObjekList = await ObjekBudidaya.bulkCreate(objekList, {
        transaction: t,
        returning: true,
      });

      for (const obj of createdObjekList) {
        await Logs.create({
          tableName: "ObjekBudidaya",
          action: "create",
          recordId: obj.id,
          before: null,
          after: obj.toJSON(),
          changedBy: req.user?.id,
        });
      }
    }

    await t.commit();

    res.locals.createdData = data.toJSON();

    return res.status(201).json({
      message: "Successfully created new unit budidaya data",
      data: {
        unitBudidaya: data,
        objekBudidaya: createdObjekList,
      },
    });
  } catch (error) {
    t.rollback();
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};

const updateUnitBudidaya = async (req, res) => {
  try {
    const data = await UnitBudidaya.findOne({
      where: { id: req.params.id, isDeleted: false },
    });

    if (!data || data.isDeleted) {
      return res.status(404).json({
        message: "Data not found",
      });
    }

    await UnitBudidaya.update(req.body, {
      where: {
        id: req.params.id,
      },
    });

    const updated = await UnitBudidaya.findOne({
      where: { id: req.params.id },
    });

    res.locals.updatedData = updated.toJSON();

    return res.status(200).json({
      message: "Successfully updated unit budidaya data",
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

// *PR kalau mau delete unit budidaya, harus perhatikan relasi yg dimiliki unit budidaya tsb !!!
const deleteUnitBudidaya = async (req, res) => {
  try {
    const data = await UnitBudidaya.findOne({
      where: { id: req.params.id, isDeleted: false },
    });

    if (!data || data.isDeleted) {
      return res.status(404).json({ message: "Data not found" });
    }

    data.isDeleted = true;
    await data.save();

    res.locals.updatedData = data;

    return res
      .status(200)
      .json({ message: "Successfully deleted unit budidaya data" });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};

const getUnitBudidayaByTipe = async (req, res) => {
  try {
    const { tipe } = req.params;

    const data = await UnitBudidaya.findAll({
      include: [
        {
          model: JenisBudidaya,
          where: {
            tipe: tipe,
          },
        },
      ],
      where: {
        isDeleted: false,
      },
      order: [["createdAt", "DESC"]],
    });

    if (data.length === 0) {
      return res.status(404).json({ message: "Data not found" });
    }

    return res.status(200).json({
      message: "Successfully retrieved unit budidaya data",
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
  getAllUnitBudidaya,
  getUnitBudidayaById,
  getUnitBudidayaByName,
  createUnitBudidaya,
  updateUnitBudidaya,
  deleteUnitBudidaya,
  getUnitBudidayaByTipe,
};
