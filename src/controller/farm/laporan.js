const e = require("express");
const sequelize = require("../../model/index");
const { where } = require("sequelize");
const db = sequelize.sequelize;
const Op = sequelize.Sequelize.Op;
const Laporan = sequelize.Laporan;

const UnitBudidaya = sequelize.UnitBudidaya;
const ObjekBudidaya = sequelize.ObjekBudidaya;

const HarianKebun = sequelize.HarianKebun;
const HarianTernak = sequelize.HarianTernak;

const Sakit = sequelize.Sakit;
const Kematian = sequelize.Kematian;
const Vitamin = sequelize.Vitamin;

const Panen = sequelize.Panen;
const Hama = sequelize.Hama;

const PenggunaanInventaris = sequelize.PenggunaanInventaris;

const Inventaris = sequelize.Inventaris;
const Komoditas = sequelize.Komoditas;

const createLaporanHarianKebun = async (req, res) => {
  const t = await db.transaction();

  try {
    const { harianKebun } = req.body;

    const data = await Laporan.create(
      {
        ...req.body,
        UserId: req.user.id,
        objekBudidayaId: req.body.objekBudidayaId,
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
    const { kematian, jumlah } = req.body;

    const unitBudidaya = await UnitBudidaya.findOne({
      where: {
        id: req.body.unitBudidayaId,
        isDeleted: false,
      },
    });

    if (unitBudidaya.tipe == "individu") {
      ObjekBudidaya.update(
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

    if (jumlah != null) {
      unitBudidaya.update(
        {
          jumlah: unitBudidaya.jumlah - jumlah,
        },
        {
          transaction: t,
        }
      );
    } else {
      unitBudidaya.update(
        {
          jumlah: unitBudidaya.jumlah - 1,
        },
        {
          transaction: t,
        }
      );
      jumlah = 1;
    }

    let data;
    let laporanKematian;

    for (let i = 0; i < jumlah; i++) {
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
    }

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

    const inventaris = await Inventaris.findOne({
      where: { id: vitamin.inventarisId },
    });

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

    const inventaris = await Inventaris.findOne({
      where: { id: penggunaanInv.inventarisId },
    });

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

module.exports = {
  createLaporanHarianKebun,
  createLaporanHarianTernak,
  createLaporanSakit,
  createLaporanKematian,
  createLaporanVitamin,
  createLaporanPanen,
  createLaporanHama,
  createLaporanPenggunaanInventaris,
};
