const e = require("express");
const sequelize = require("../../model/index");
const { where, fn, col } = require("sequelize");
const model = require("../../model/index");
const db = sequelize.sequelize;
const Op = sequelize.Sequelize.Op;
const Laporan = sequelize.Laporan;

const User = sequelize.User;

const UnitBudidaya = sequelize.UnitBudidaya;
const ObjekBudidaya = sequelize.ObjekBudidaya;
const JenisBudidaya = sequelize.JenisBudidaya;

const HarianKebun = sequelize.HarianKebun;
const HarianTernak = sequelize.HarianTernak;

const Sakit = sequelize.Sakit;
const Kematian = sequelize.Kematian;
const Vitamin = sequelize.Vitamin;

const PanenKebun = sequelize.PanenKebun;
const PanenRincianGrade = sequelize.PanenRincianGrade;
const Panen = sequelize.Panen;
const Hama = sequelize.Hama;

const PenggunaanInventaris = sequelize.PenggunaanInventaris;
const KategoriInventaris = sequelize.KategoriInventaris;

const Inventaris = sequelize.Inventaris;
const Komoditas = sequelize.Komoditas;
const Satuan = sequelize.Satuan;
const Grade = sequelize.Grade;

const createLaporanHarianKebun = async (req, res) => {
  const t = await db.transaction();

  try {
    const { harianKebun } = req.body;

    const data = await Laporan.create(
      {
        ...req.body,
        UserId: req.user.id,
        ObjekBudidayaId: req.body.objekBudidayaId,
        UnitBudidayaId: req.body.unitBudidayaId,
      },
      { transaction: t }
    );

    const harian = await HarianKebun.create(
      {
        LaporanId: data.id,
        penyiraman: harianKebun.penyiraman,
        pruning: harianKebun.pruning,
        repotting: harianKebun.repotting,
        tinggiTanaman: harianKebun.tinggiTanaman,
        kondisiDaun: harianKebun.kondisiDaun,
        statusTumbuh: harianKebun.statusTumbuh,
      },
      { transaction: t }
    );

    await t.commit();

    res.locals.createdData = { data, harian };

    return res.status(201).json({
      message: "Successfully created new laporan data",
      data: {
        data,
        harian,
      },
    });
  } catch (error) {
    await t.rollback();
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};

const getLastHarianKebunByObjekBudidayaId = async (req, res) => {
  try {
    const { objekBudidayaId } = req.params;

    const laporan = await Laporan.findOne({
      where: {
        objekBudidayaId: objekBudidayaId,
        isDeleted: false,
        tipe: "harian",
      },
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: HarianKebun,
        },
      ],
    });

    if (!laporan) {
      return res.status(404).json({
        message: "Laporan not found",
      });
    }

    return res.status(200).json({
      message: "Successfully retrieved last harian kebun data",
      data: laporan,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};

const createLaporanHarianTernak = async (req, res) => {
  const t = await db.transaction();

  try {
    const { harianTernak } = req.body;

    const data = await Laporan.create(
      {
        ...req.body,
        UnitBudidayaId: req.body.unitBudidayaId,
        ObjekBudidayaId: req.body.objekBudidayaId,
        UserId: req.user.id,
      },
      { transaction: t }
    );

    const laporan = await Laporan.findOne({
      where: {
        id: data.id,
      },
      transaction: t,
    });

    if (!laporan) {
      return res.status(404).json({
        message: "Laporan not found",
      });
    }

    const harian = await HarianTernak.create(
      {
        LaporanId: laporan.id,
        pakan: harianTernak.pakan,
        cekKandang: harianTernak.cekKandang,
      },
      { transaction: t }
    );

    await t.commit();

    res.locals.createdData = { data, harian };

    return res.status(201).json({
      message: "Successfully created new laporan data",
      data: {
        data,
        harian,
      },
    });
  } catch (error) {
    await t.rollback();
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};

const createLaporanSakit = async (req, res) => {
  const t = await db.transaction();

  try {
    const { sakit } = req.body;

    const data = await Laporan.create(
      {
        ...req.body,
        UnitBudidayaId: req.body.unitBudidayaId,
        ObjekBudidayaId: req.body.objekBudidayaId,
        UserId: req.user.id,
      },
      { transaction: t }
    );

    const laporanSakit = await Sakit.create(
      {
        LaporanId: data.id,
        penyakit: sakit.penyakit,
      },
      { transaction: t }
    );

    await t.commit();

    res.locals.createdData = { data, laporanSakit };

    return res.status(201).json({
      message: "Successfully created new laporan data",
      data: {
        data,
        laporanSakit,
      },
    });
  } catch (error) {
    await t.rollback();
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};

const createLaporanKematian = async (req, res) => {
  const t = await db.transaction();

  try {
    const { kematian } = req.body;

    const { jumlah } = req.body;

    const unitBudidaya = await UnitBudidaya.findOne({
      where: {
        id: req.body.unitBudidayaId,
        isDeleted: false,
      },
    });

    if (unitBudidaya.tipe == "individu") {
      await ObjekBudidaya.update(
        {
          isDeleted: true,
        },
        {
          transaction: t,
          where: {
            id: req.body.objekBudidayaId,
          },
        }
      );
    }

    if (jumlah && !isNaN(jumlah) && jumlah > 0) {
      await unitBudidaya.update(
        {
          jumlah: unitBudidaya.jumlah - jumlah,
        },
        {
          transaction: t,
        }
      );
    } else {
      await unitBudidaya.update(
        {
          jumlah: unitBudidaya.jumlah - 1,
        },
        {
          transaction: t,
        }
      );
    }

    let data;
    let laporanKematian;

    let i = 0;
    do {
      data = await Laporan.create(
        {
          ...req.body,
          UnitBudidayaId: req.body.unitBudidayaId,
          ObjekBudidayaId: req.body.objekBudidayaId,
          UserId: req.user.id,
        },
        { transaction: t }
      );

      laporanKematian = await Kematian.create(
        {
          LaporanId: data.id,
          tanggal: kematian.tanggal,
          penyebab: kematian.penyebab,
        },
        { transaction: t }
      );
      i++;
    } while (i < jumlah);

    await t.commit();

    const updatedUnit = await UnitBudidaya.findOne({
      where: {
        id: req.body.unitBudidayaId,
      },
    });

    if (unitBudidaya.tipe == "individu") {
      const updatedObjek = await ObjekBudidaya.findOne({
        where: {
          id: req.body.objekBudidayaId,
        },
      });
      res.locals.updatedData = updatedObjek.toJSON();
    }

    res.locals.createdData = { data, laporanKematian };
    res.locals.updatedData = updatedUnit.toJSON();

    return res.status(201).json({
      message: "Successfully created new laporan data",
      data: {
        data,
        laporanKematian,
      },
    });
  } catch (error) {
    console.log(error);
    await t.rollback();
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};

const createLaporanVitamin = async (req, res) => {
  const t = await db.transaction();

  try {
    const { vitamin } = req.body;

    if (!vitamin || typeof vitamin.jumlah !== "number" || vitamin.jumlah <= 0) {
      await t.rollback();
      return res.status(400).json({
        message:
          "Jumlah penggunaan vitamin tidak valid atau harus lebih besar dari 0.",
      });
    }
    if (!vitamin.inventarisId) {
      await t.rollback();
      return res.status(400).json({
        message: "ID Inventaris untuk vitamin tidak disertakan.",
      });
    }

    const inventaris = await Inventaris.findOne({
      where: { id: vitamin.inventarisId },
      transaction: t,
    });

    if (!inventaris) {
      await t.rollback();
      return res.status(404).json({
        message: `Inventaris (vitamin) dengan ID ${vitamin.inventarisId} tidak ditemukan.`,
      });
    }

    if (inventaris.jumlah < vitamin.jumlah) {
      await t.rollback();
      return res.status(400).json({
        message: `Stok inventaris (vitamin) "${inventaris.nama}" tidak mencukupi. Tersedia: ${inventaris.jumlah}, Dibutuhkan: ${vitamin.jumlah}.`,
      });
    }

    const data = await Laporan.create(
      {
        ...req.body,
        UnitBudidayaId: req.body.unitBudidayaId,
        ObjekBudidayaId: req.body.objekBudidayaId,
        UserId: req.user.id,
      },
      { transaction: t }
    );

    const laporanVitamin = await Vitamin.create(
      {
        LaporanId: data.id,
        inventarisId: vitamin.inventarisId,
        tipe: vitamin.tipe,
        jumlah: vitamin.jumlah,
      },
      { transaction: t }
    );

    inventaris.jumlah -= vitamin.jumlah;

    await inventaris.save({ transaction: t });

    await t.commit();

    res.locals.createdData = { data, laporanVitamin };

    return res.status(201).json({
      message: "Successfully created new laporan data",
      data: {
        data,
        laporanVitamin,
      },
    });
  } catch (error) {
    await t.rollback();
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};

const createLaporanPanen = async (req, res) => {
  const t = await db.transaction();

  try {
    const { panen } = req.body;

    const data = await Laporan.create(
      {
        ...req.body,
        UnitBudidayaId: req.body.unitBudidayaId,
        ObjekBudidayaId: req.body.objekBudidayaId,
        UserId: req.user.id,
      },
      { transaction: t }
    );

    const laporanPanen = await Panen.create(
      {
        LaporanId: data.id,
        komoditasId: panen.komoditasId,
        jumlah: panen.jumlah,
      },
      { transaction: t }
    );

    const komoditas = await Komoditas.findOne({
      where: { id: panen.komoditasId },
    });

    komoditas.jumlah += panen.jumlah;

    await komoditas.save({ transaction: t });

    await t.commit();

    res.locals.createdData = { data, laporanPanen };

    return res.status(201).json({
      message: "Successfully created new laporan data",
      data: {
        data,
        laporanPanen,
      },
    });
  } catch (error) {
    await t.rollback();
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};

const createLaporanPanenKebun = async (req, res) => {
  const t = await db.transaction();

  try {
    const { panen } = req.body;

    const data = await Laporan.create(
      {
        ...req.body,
        UnitBudidayaId: req.body.unitBudidayaId,
        ObjekBudidayaId: req.body.objekBudidayaId,
        UserId: req.user.id,
      },
      { transaction: t }
    );

    const laporanPanen = await PanenKebun.create(
      {
        LaporanId: data.id,
        komoditasId: panen.komoditasId,
        tanggalPanen: panen.tanggalPanen,
        estimasiPanen: panen.estimasiPanen,
        realisasiPanen: panen.realisasiPanen,
        gagalPanen: panen.gagalPanen,
        umurTanamanPanen: panen.umurTanamanPanen,
      },
      { transaction: t }
    );

    if (panen.rincianGrade && panen.rincianGrade.length > 0) {
      for (const rincianGrade of panen.rincianGrade) {
        await PanenRincianGrade.create(
          {
            panenKebunId: laporanPanen.id,
            gradeId: rincianGrade.gradeId,
            jumlah: rincianGrade.jumlah,
          },
          { transaction: t }
        );
      }
    }

    const komoditas = await Komoditas.findOne({
      where: { id: panen.komoditasId },
    });

    komoditas.jumlah += panen.realisasiPanen;

    await komoditas.save({ transaction: t });

    await t.commit();

    res.locals.createdData = { data, laporanPanen };

    return res.status(201).json({
      message: "Successfully created new laporan data",
      data: {
        data,
        laporanPanen,
      },
    });
  } catch (error) {
    await t.rollback();
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};

const createLaporanHama = async (req, res) => {
  const t = await db.transaction();

  try {
    const { hama } = req.body;

    const data = await Laporan.create(
      {
        ...req.body,
        UnitBudidayaId: req.body.unitBudidayaId,
        ObjekBudidayaId: req.body.objekBudidayaId,
        UserId: req.user.id,
      },
      { transaction: t }
    );

    const laporanHama = await Hama.create(
      {
        LaporanId: data.id,
        JenisHamaId: hama.jenisHamaId,
        jumlah: hama.jumlah,
        status: hama.status,
      },
      { transaction: t }
    );

    await t.commit();

    res.locals.createdData = { data, laporanHama };

    return res.status(201).json({
      message: "Successfully created new laporan data",
      data: {
        data,
        laporanHama,
      },
    });
  } catch (error) {
    await t.rollback();
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};

const createLaporanPenggunaanInventaris = async (req, res) => {
  const t = await db.transaction();

  try {
    const { penggunaanInv } = req.body;

    if (
      !penggunaanInv ||
      typeof penggunaanInv.jumlah !== "number" ||
      penggunaanInv.jumlah <= 0
    ) {
      await t.rollback();
      return res.status(400).json({
        message:
          "Jumlah penggunaan inventaris tidak valid atau harus lebih besar dari 0.",
      });
    }

    const inventaris = await Inventaris.findOne({
      where: { id: penggunaanInv.inventarisId },
      transaction: t,
    });

    if (!inventaris) {
      await t.rollback();
      return res.status(404).json({
        message: `Inventaris dengan ID ${penggunaanInv.inventarisId} tidak ditemukan.`,
      });
    }

    if (inventaris.jumlah < penggunaanInv.jumlah) {
      await t.rollback();
      return res.status(400).json({
        message: `Stok inventaris "${inventaris.nama}" tidak mencukupi (tersedia: ${inventaris.jumlah}, dibutuhkan: ${penggunaanInv.jumlah}). Inventaris tidak dapat digunakan.`,
      });
    }

    const data = await Laporan.create(
      {
        ...req.body,
        UnitBudidayaId: req.body.unitBudidayaId,
        ObjekBudidayaId: req.body.objekBudidayaId,
        UserId: req.user.id,
      },
      { transaction: t }
    );

    const laporanPenggunaanInventaris = await PenggunaanInventaris.create(
      {
        LaporanId: data.id,
        inventarisId: penggunaanInv.inventarisId,
        jumlah: penggunaanInv.jumlah,
      },
      { transaction: t }
    );

    inventaris.jumlah -= penggunaanInv.jumlah;

    await inventaris.save({ transaction: t });

    await t.commit();

    res.locals.createdData = { data, laporanPenggunaanInventaris };

    return res.status(201).json({
      message: "Successfully created new laporan data",
      data: {
        data,
        laporanPenggunaanInventaris,
      },
    });
  } catch (error) {
    await t.rollback();
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};

const getJumlahKematian = async (req, res) => {
  try {
    const { unitBudidayaId } = req.params;

    const laporan = await Laporan.findAll({
      where: {
        UnitBudidayaId: unitBudidayaId,
        isDeleted: false,
        tipe: "kematian",
      },
      attributes: [[fn("COUNT", col("id")), "jumlahKematian"]],
      group: ["UnitBudidayaId"],
    });

    if (laporan.length === 0) {
      return res.status(404).json({
        message: "No kematian reports found for this unit.",
      });
    }

    return res.status(200).json({
      message: "Successfully retrieved jumlah kematian",
      data: laporan[0].dataValues.jumlahKematian,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};

const getLaporanHarianKebunById = async (req, res) => {
  try {
    const { id } = req.params;

    const laporan = await Laporan.findOne({
      where: {
        id: id,
        isDeleted: false,
        tipe: "harian",
      },
      include: [
        {
          model: HarianKebun,
          attributes: {
            exclude: ["createdAt", "updatedAt", "LaporanId", "id", "isDeleted"],
          },
          require: true,
        },
        {
          model: ObjekBudidaya,
          attributes: ["namaId"],
          require: true,
        },
        {
          model: UnitBudidaya,
          attributes: ["nama"],
          require: true,
          include: [
            {
              model: JenisBudidaya,
              attributes: ["nama"],
              require: true,
            },
          ],
        },
        {
          model: User,
          as: "user",
          attributes: ["name"],
          require: true,
        },
      ],
    });

    if (!laporan) {
      return res.status(404).json({
        message: "Laporan not found",
      });
    }

    return res.status(200).json({
      message: "Successfully retrieved laporan data",
      data: laporan,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};

const getLaporanHarianTernakById = async (req, res) => {
  try {
    const { id } = req.params;

    const laporan = await Laporan.findOne({
      where: {
        id: id,
        isDeleted: false,
        tipe: "harian",
      },
      include: [
        {
          model: HarianTernak,
          attributes: {
            exclude: ["createdAt", "updatedAt", "LaporanId", "id", "isDeleted"],
          },
          require: true,
        },
        {
          model: UnitBudidaya,
          attributes: ["nama"],
          require: true,
          include: [
            {
              model: JenisBudidaya,
              attributes: ["nama"],
              require: true,
            },
          ],
        },
        {
          model: User,
          as: "user",
          attributes: ["name"],
          require: true,
        },
      ],
    });

    if (!laporan) {
      return res.status(404).json({
        message: "Laporan not found",
      });
    }

    return res.status(200).json({
      message: "Successfully retrieved laporan data",
      data: laporan,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};

const getLaporanSakitById = async (req, res) => {
  try {
    const { id } = req.params;

    const laporan = await Laporan.findOne({
      where: {
        id: id,
        isDeleted: false,
        tipe: "sakit",
      },
      include: [
        {
          model: Sakit,
          attributes: ["penyakit"],
          require: true,
        },
        {
          model: ObjekBudidaya,
          attributes: ["namaId"],
          require: false,
        },
        {
          model: UnitBudidaya,
          attributes: ["nama"],
          require: true,
          include: [
            {
              model: JenisBudidaya,
              attributes: ["nama", "tipe"],
              require: true,
            },
          ],
        },
        {
          model: User,
          as: "user",
          attributes: ["name"],
          require: true,
        },
      ],
    });

    if (!laporan) {
      return res.status(404).json({
        message: "Laporan not found",
      });
    }

    return res.status(200).json({
      message: "Successfully retrieved laporan data",
      data: laporan,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};

const getLaporanKematianById = async (req, res) => {
  try {
    const { id } = req.params;

    const laporan = await Laporan.findOne({
      where: {
        id: id,
        isDeleted: false,
        tipe: "kematian",
      },
      include: [
        {
          model: Kematian,
          attributes: ["tanggal", "penyebab"],
          require: true,
        },
        {
          model: ObjekBudidaya,
          attributes: ["namaId"],
          require: false,
        },
        {
          model: UnitBudidaya,
          attributes: ["nama"],
          require: true,
          include: [
            {
              model: JenisBudidaya,
              attributes: ["nama", "tipe"],
              require: true,
            },
          ],
        },
        {
          model: User,
          as: "user",
          attributes: ["name"],
          require: true,
        },
      ],
    });

    if (!laporan) {
      return res.status(404).json({
        message: "Laporan not found",
      });
    }

    return res.status(200).json({
      message: "Successfully retrieved laporan data",
      data: laporan,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};

const getLaporanVitaminById = async (req, res) => {
  try {
    const { id } = req.params;

    const laporan = await Laporan.findOne({
      where: {
        id: id,
        isDeleted: false,
        tipe: "vitamin",
      },
      include: [
        {
          model: Vitamin,
          attributes: ["tipe", "jumlah"],
          include: [
            {
              as: "inventaris",
              model: Inventaris,
              attributes: ["nama", "gambar"],
              require: true,
              include: [
                {
                  model: KategoriInventaris,
                  as: "kategoriInventaris",
                  attributes: ["nama"],
                },
                {
                  model: Satuan,
                  attributes: ["nama", "lambang"],
                  require: true,
                },
              ],
            },
          ],
          require: true,
        },
        {
          model: ObjekBudidaya,
          attributes: ["namaId"],
          require: false,
        },
        {
          model: UnitBudidaya,
          attributes: ["nama"],
          require: true,
          include: [
            {
              model: JenisBudidaya,
              attributes: ["nama", "tipe"],
              require: true,
            },
          ],
        },
        {
          model: User,
          as: "user",
          attributes: ["name"],
          require: true,
        },
      ],
    });

    if (!laporan) {
      return res.status(404).json({
        message: "Laporan not found",
      });
    }

    return res.status(200).json({
      message: "Successfully retrieved laporan data",
      data: laporan,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};

const getLaporanPanenById = async (req, res) => {
  try {
    const { id } = req.params;

    const laporan = await Laporan.findOne({
      where: {
        id: id,
        isDeleted: false,
        tipe: "panen",
      },
      include: [
        {
          model: Panen,
          include: [
            {
              model: Komoditas,
              as: "komoditas",
              attributes: ["nama"],
              include: [
                {
                  model: Satuan,
                  attributes: ["nama", "lambang"],
                },
              ],
            },
          ],
        },
        {
          model: ObjekBudidaya,
          attributes: ["namaId"],
          require: false,
        },
        {
          model: UnitBudidaya,
          attributes: ["nama"],
          require: true,
          include: [
            {
              model: JenisBudidaya,
              attributes: ["nama", "tipe"],
              require: true,
            },
          ],
        },
        {
          model: User,
          as: "user",
          attributes: ["name"],
          require: true,
        },
      ],
    });

    if (!laporan) {
      return res.status(404).json({
        message: "Laporan not found",
      });
    }

    return res.status(200).json({
      message: "Successfully retrieved laporan data",
      data: laporan,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};

const getLaporanPanenKebunById = async (req, res) => {
  try {
    const { id } = req.params;

    const laporan = await Laporan.findOne({
      where: {
        id: id,
        isDeleted: false,
        tipe: "panen",
      },
      include: [
        {
          model: PanenKebun,
          include: [
            {
              model: Komoditas,
              as: "komoditas",
              attributes: ["nama"],
              include: [
                {
                  model: Satuan,
                  attributes: ["nama", "lambang"],
                },
              ],
            },
            {
              model: PanenRincianGrade,
              include: [
                {
                  model: Grade,
                  attributes: ["nama"],
                },
              ],
            },
          ],
        },
        {
          model: UnitBudidaya,
          attributes: ["nama"],
          include: [
            {
              model: JenisBudidaya,
              attributes: ["nama"],
            },
          ],
        },
        {
          model: User,
          as: "user",
          attributes: ["name"],
        },
      ],
    });

    if (!laporan) {
      return res.status(404).json({
        message: "Laporan not found",
      });
    }

    return res.status(200).json({
      message: "Successfully retrieved laporan data",
      data: laporan,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};

const getLaporanHamaById = async (req, res) => {
  try {
    const { id } = req.params;

    const laporan = await Laporan.findOne({
      where: {
        id: id,
        isDeleted: false,
        tipe: "hama",
      },
      include: [
        {
          model: Hama,
        },
      ],
    });

    if (!laporan) {
      return res.status(404).json({
        message: "Laporan not found",
      });
    }

    return res.status(200).json({
      message: "Successfully retrieved laporan data",
      data: laporan,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};

const getLaporanPenggunaanInventarisById = async (req, res) => {
  try {
    const { id } = req.params;

    const laporan = await Laporan.findOne({
      where: {
        id: id,
        isDeleted: false,
        tipe: "inventaris",
      },
      include: [
        {
          model: PenggunaanInventaris,
          include: [Inventaris],
        },
      ],
    });

    if (!laporan) {
      return res.status(404).json({
        message: "Laporan not found",
      });
    }

    return res.status(200).json({
      message: "Successfully retrieved laporan data",
      data: laporan,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};

module.exports = {
  createLaporanHarianKebun,
  getLastHarianKebunByObjekBudidayaId,
  createLaporanHarianTernak,
  createLaporanSakit,
  createLaporanKematian,
  createLaporanVitamin,
  createLaporanPanen,
  createLaporanPanenKebun,
  createLaporanHama,
  createLaporanPenggunaanInventaris,
  getLaporanHarianKebunById,
  getLaporanHarianTernakById,
  getLaporanSakitById,
  getLaporanKematianById,
  getLaporanVitaminById,
  getLaporanPanenById,
  getLaporanPanenKebunById,
  getLaporanHamaById,
  getLaporanPenggunaanInventarisById,
  getJumlahKematian,
};
