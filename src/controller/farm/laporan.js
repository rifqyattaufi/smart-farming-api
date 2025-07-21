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
const DetailPanen = sequelize.DetailPanen;
const Hama = sequelize.Hama;

const PenggunaanInventaris = sequelize.PenggunaanInventaris;
const KategoriInventaris = sequelize.KategoriInventaris;

const Inventaris = sequelize.Inventaris;
const Komoditas = sequelize.Komoditas;
const Satuan = sequelize.Satuan;
const Grade = sequelize.Grade;

const Produk = sequelize.Produk;

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

    // Inisialisasi data harian dengan nilai dari request
    let finalHarianData = {
      LaporanId: data.id,
      // Tindakan massal tetap dipertahankan
      penyiraman: harianKebun.penyiraman || false,
      pruning: harianKebun.pruning || false,
      repotting: harianKebun.repotting || false,
      // Data individual
      tinggiTanaman:
        harianKebun.tinggiTanaman === undefined
          ? null
          : harianKebun.tinggiTanaman,
      kondisiDaun:
        harianKebun.kondisiDaun === undefined || harianKebun.kondisiDaun === ""
          ? null
          : harianKebun.kondisiDaun,
      statusTumbuh:
        harianKebun.statusTumbuh === undefined ||
        harianKebun.statusTumbuh === ""
          ? null
          : harianKebun.statusTumbuh,
    };

    // Jika ada field individual yang null, coba ambil dari laporan terakhir
    if (
      finalHarianData.tinggiTanaman === null ||
      finalHarianData.kondisiDaun === null ||
      finalHarianData.statusTumbuh === null
    ) {
      try {
        const lastReport = await Laporan.findOne({
          where: {
            objekBudidayaId: req.body.objekBudidayaId,
            isDeleted: false,
            tipe: "harian",
          },
          order: [["createdAt", "DESC"]],
          include: [
            {
              model: HarianKebun,
            },
          ],
          transaction: t,
        });

        if (lastReport && lastReport.HarianKebun) {
          const lastHarian = lastReport.HarianKebun;

          // Gunakan data terakhir jika data baru null
          if (
            finalHarianData.tinggiTanaman === null &&
            lastHarian.tinggiTanaman !== null
          ) {
            finalHarianData.tinggiTanaman = lastHarian.tinggiTanaman;
          }
          if (
            finalHarianData.kondisiDaun === null &&
            lastHarian.kondisiDaun !== null
          ) {
            finalHarianData.kondisiDaun = lastHarian.kondisiDaun;
          }
          if (
            finalHarianData.statusTumbuh === null &&
            lastHarian.statusTumbuh !== null
          ) {
            finalHarianData.statusTumbuh = lastHarian.statusTumbuh;
          }
        }
      } catch (lastReportError) {
        // Jika gagal mengambil laporan terakhir, lanjutkan dengan data yang ada
        console.log(
          "Gagal mengambil laporan terakhir:",
          lastReportError.message
        );
      }
    }

    // Jika masih ada field yang null setelah mencoba mengambil dari laporan terakhir,
    // berikan nilai default untuk tanaman baru
    if (finalHarianData.tinggiTanaman === null) {
      finalHarianData.tinggiTanaman = 0.0;
    }
    if (finalHarianData.kondisiDaun === null) {
      finalHarianData.kondisiDaun = "sehat";
    }
    if (finalHarianData.statusTumbuh === null) {
      finalHarianData.statusTumbuh = "bibit";
    }

    const harian = await HarianKebun.create(finalHarianData, {
      transaction: t,
    });

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
    const { panen, detailPanen } = req.body;

    const komoditas = await Komoditas.findOne({
      where: { id: panen.komoditasId },
    });

    const produk = await Produk.findOne({
      where: { id: komoditas.produkId, isDeleted: false },
    });

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

    // Handle grade data for livestock harvest (similar to plant harvest)
    if (panen.rincianGrade && panen.rincianGrade.length > 0) {
      const rincianGradeData = panen.rincianGrade.map((rincianGrade) => ({
        panenId: laporanPanen.id, // Use panenId for livestock instead of panenKebunId
        gradeId: rincianGrade.gradeId,
        jumlah: rincianGrade.jumlah,
      }));

      await PanenRincianGrade.bulkCreate(rincianGradeData, { transaction: t });
    }

    komoditas.jumlah += panen.jumlah;
    await komoditas.save({ transaction: t });

    if (produk) {
      await produk.update(
        {
          nama: komoditas.nama,
          stok: komoditas.jumlah,
        },
        { transaction: t }
      );
    }

    if (komoditas.tipeKomoditas == "individu") {
      if (komoditas.hapusObjek == true) {
        if (req.body.objekBudidayaId != null) {
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

          await UnitBudidaya.decrement("jumlah", {
            by: 1,
            transaction: t,
            where: {
              id: req.body.unitBudidayaId,
            },
          });
        } else {
          await UnitBudidaya.decrement("jumlah", {
            by: 1,
            transaction: t,
            where: {
              id: req.body.unitBudidayaId,
            },
          });
        }
      }
    } else {
      const unitBudidaya = await UnitBudidaya.findOne({
        where: { id: req.body.unitBudidayaId },
      });

      if (unitBudidaya.tipe == "individu") {
        for (const item of detailPanen) {
          await DetailPanen.create(
            {
              PanenId: laporanPanen.id,
              ObjekBudidayaId: item,
            },
            { transaction: t }
          );

          if (komoditas.hapusObjek == true) {
            await ObjekBudidaya.update(
              {
                isDeleted: true,
              },
              {
                transaction: t,
                where: {
                  id: item,
                },
              }
            );

            await UnitBudidaya.decrement("jumlah", {
              by: 1,
              transaction: t,
              where: {
                id: req.body.unitBudidayaId,
              },
            });
          }
        }
      } else {
        unitBudidaya.jumlah -= panen.jumlahHewan;

        await unitBudidaya.save({ transaction: t });
      }
    }

    await t.commit();

    return res.status(201).json({
      message: "Successfully created new laporan data",
    });
  } catch (error) {
    await t.rollback();
    return res.status(500).json({
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
      const rincianGradeData = panen.rincianGrade.map((rincianGrade) => ({
        panenKebunId: laporanPanen.id,
        gradeId: rincianGrade.gradeId,
        jumlah: rincianGrade.jumlah,
      }));

      await PanenRincianGrade.bulkCreate(rincianGradeData, { transaction: t });
    }

    const [komoditas, unitBudidaya] = await Promise.all([
      Komoditas.findOne({
        where: { id: panen.komoditasId },
        transaction: t,
      }),
      UnitBudidaya.findOne({
        where: { id: req.body.unitBudidayaId },
        transaction: t,
      }),
    ]);

    if (!komoditas) {
      throw new Error(
        `Komoditas dengan ID ${panen.komoditasId} tidak ditemukan`
      );
    }

    if (!unitBudidaya) {
      throw new Error(
        `Unit budidaya dengan ID ${req.body.unitBudidayaId} tidak ditemukan`
      );
    }

    const produk = await Produk.findOne({
      where: { id: komoditas.produkId, isDeleted: false },
    });

    komoditas.jumlah += panen.realisasiPanen;
    await komoditas.save({ transaction: t });

    if (produk) {
      await produk.update(
        {
          nama: komoditas.nama,
          stok: komoditas.jumlah,
        },
        { transaction: t }
      );
    }

    if (komoditas.hapusObjek === true) {
      const updateResult = await ObjekBudidaya.update(
        { isDeleted: true },
        {
          where: {
            unitBudidayaId: req.body.unitBudidayaId,
            isDeleted: false,
          },
          transaction: t,
        }
      );

      const deletedCount = updateResult[0];
      if (deletedCount > 0) {
        await UnitBudidaya.decrement("jumlah", {
          by: deletedCount,
          transaction: t,
          where: { id: req.body.unitBudidayaId },
        });
      }
    }

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

const getHasilPanenWithGrades = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      komoditasId,
      unitBudidayaId,
      startDate,
      endDate,
    } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Validate pagination parameters
    if (parseInt(page) < 1 || parseInt(limit) < 1) {
      return res.status(400).json({
        status: false,
        message: "Page and limit must be positive numbers",
      });
    }

    if (parseInt(limit) > 100) {
      return res.status(400).json({
        status: false,
        message: "Limit cannot exceed 100 items per page",
      });
    }

    // Build where clause for filtering
    const whereClause = {
      isDeleted: false,
      tipe: "panen",
    };

    // Validate and apply date filters
    if (startDate || endDate) {
      if (startDate && endDate) {
        try {
          const start = new Date(startDate);
          const end = new Date(endDate);

          if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return res.status(400).json({
              status: false,
              message: "Invalid date format. Please use YYYY-MM-DD format",
            });
          }

          if (start > end) {
            return res.status(400).json({
              status: false,
              message: "Start date must be before or equal to end date",
            });
          }

          whereClause.createdAt = {
            [Op.between]: [start, end],
          };
        } catch (error) {
          return res.status(400).json({
            status: false,
            message: "Error parsing dates. Please use YYYY-MM-DD format",
          });
        }
      } else {
        return res.status(400).json({
          status: false,
          message:
            "Both startDate and endDate are required when filtering by date range",
        });
      }
    }

    // Unit budidaya filter
    if (unitBudidayaId) {
      whereClause.UnitBudidayaId = unitBudidayaId;
    }

    // Komoditas filter (will be applied in PanenKebun include)
    const panenKebunWhere = {};
    if (komoditasId) {
      panenKebunWhere.komoditasId = komoditasId;
    }

    const { count, rows } = await Laporan.findAndCountAll({
      where: whereClause,
      attributes: [
        "id",
        "judul",
        "tipe",
        "gambar",
        "catatan",
        "isDeleted",
        "createdAt",
        "updatedAt",
        "UnitBudidayaId",
        "ObjekBudidayaId",
        "userId",
      ],
      include: [
        {
          model: PanenKebun,
          where: panenKebunWhere,
          required: true,
          include: [
            {
              model: Komoditas,
              as: "komoditas",
              attributes: ["id", "nama"],
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
                  attributes: ["id", "nama", "deskripsi"],
                },
              ],
              required: false, // Allow harvest records without grades
            },
          ],
        },
        {
          model: UnitBudidaya,
          attributes: ["id", "nama", "tipe"],
          include: [
            {
              model: JenisBudidaya,
              attributes: ["nama", "tipe"],
            },
          ],
        },
        {
          model: User,
          as: "user",
          attributes: ["id", "name"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: parseInt(limit),
      offset: offset,
    });

    // Transform data for better frontend consumption
    const transformedData = rows.map((laporan) => {
      const panenKebun = laporan.PanenKebun;
      const grades = panenKebun.PanenRincianGrades || [];

      // Calculate grade summary
      const gradeSummary = grades.map((grade) => ({
        gradeId: grade.Grade.id,
        gradeNama: grade.Grade.nama,
        gradeDeskripsi: grade.Grade.deskripsi,
        jumlah: grade.jumlah,
        persentase:
          panenKebun.realisasiPanen > 0
            ? ((grade.jumlah / panenKebun.realisasiPanen) * 100).toFixed(2)
            : 0,
      }));

      return {
        laporanId: laporan.id,
        judul: laporan.judul,
        tanggalLaporan: laporan.createdAt,
        tanggalPanen: panenKebun.tanggalPanen,
        gambar: laporan.gambar,
        catatan: laporan.catatan,
        pelapor: {
          id: laporan.user.id,
          nama: laporan.user.name,
        },
        unitBudidaya: {
          id: laporan.UnitBudidaya.id,
          nama: laporan.UnitBudidaya.nama,
          tipe: laporan.UnitBudidaya.tipe,
          jenisBudidaya: laporan.UnitBudidaya.JenisBudidaya.nama,
        },
        komoditas: {
          id: panenKebun.komoditas.id,
          nama: panenKebun.komoditas.nama,
          jenis: panenKebun.komoditas.jenis,
          satuan: panenKebun.komoditas.Satuan,
        },
        hasilPanen: {
          estimasiPanen: panenKebun.estimasiPanen,
          realisasiPanen: panenKebun.realisasiPanen,
          gagalPanen: panenKebun.gagalPanen,
          umurTanamanPanen: panenKebun.umurTanamanPanen,
          efisiensiPanen:
            panenKebun.estimasiPanen > 0
              ? (
                  (panenKebun.realisasiPanen / panenKebun.estimasiPanen) *
                  100
                ).toFixed(2)
              : 0,
        },
        rincianGrade: gradeSummary,
        totalGradeCount: grades.length,
      };
    });

    const totalPages = Math.ceil(count / parseInt(limit));

    return res.status(200).json({
      status: true,
      message: "Successfully retrieved hasil panen data with grades",
      data: transformedData,
      pagination: {
        currentPage: parseInt(page),
        totalPages: totalPages,
        totalItems: count,
        itemsPerPage: parseInt(limit),
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
      detail: error,
    });
  }
};

const getGradeSummaryByKomoditas = async (req, res) => {
  try {
    const { komoditasId, startDate, endDate, unitBudidayaId } = req.query;

    // Validate required parameter
    if (!komoditasId || komoditasId.trim() === "") {
      return res.status(400).json({
        status: false,
        message: "Parameter 'komoditasId' is required and cannot be empty",
      });
    }

    // Validate that the commodity exists
    const komoditasExists = await Komoditas.findOne({
      where: {
        id: komoditasId.trim(),
        isDeleted: false,
      },
    });

    if (!komoditasExists) {
      return res.status(404).json({
        status: false,
        message: `Komoditas with ID '${komoditasId}' not found or has been deleted`,
      });
    }

    // Build where clause for date filtering
    const whereClause = {
      isDeleted: false,
      tipe: "panen",
    };

    // Validate and apply date filters
    if (startDate || endDate) {
      if (startDate && endDate) {
        try {
          const start = new Date(startDate);
          const end = new Date(endDate);

          // Check if dates are valid
          if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return res.status(400).json({
              status: false,
              message: "Invalid date format. Please use YYYY-MM-DD format",
            });
          }

          // Check if start date is before end date
          if (start > end) {
            return res.status(400).json({
              status: false,
              message: "Start date must be before or equal to end date",
            });
          }

          whereClause.createdAt = {
            [Op.between]: [start, end],
          };
        } catch (error) {
          return res.status(400).json({
            status: false,
            message: "Error parsing dates. Please use YYYY-MM-DD format",
          });
        }
      } else {
        return res.status(400).json({
          status: false,
          message:
            "Both startDate and endDate are required when filtering by date range",
        });
      }
    }

    if (unitBudidayaId) {
      whereClause.UnitBudidayaId = unitBudidayaId;
    }

    // Get all harvest records for the commodity
    const laporanPanen = await Laporan.findAll({
      where: whereClause,
      include: [
        {
          model: PanenKebun,
          where: { komoditasId: komoditasId },
          required: true,
          include: [
            {
              model: Komoditas,
              as: "komoditas",
              attributes: ["id", "nama"],
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
                  attributes: ["id", "nama", "deskripsi"],
                },
              ],
              required: false,
            },
          ],
        },
      ],
    });

    if (laporanPanen.length === 0) {
      return res.status(404).json({
        status: false,
        message: "No harvest data found for this commodity",
      });
    }

    // Aggregate grade data
    const gradeAggregation = {};
    let totalHarvestAmount = 0;
    let totalHarvestCount = 0;

    laporanPanen.forEach((laporan) => {
      const panenKebun = laporan.PanenKebun;
      totalHarvestAmount += panenKebun.realisasiPanen || 0;
      totalHarvestCount++;

      panenKebun.PanenRincianGrades.forEach((rincian) => {
        const gradeId = rincian.Grade.id;
        const gradeName = rincian.Grade.nama;
        const gradeDesc = rincian.Grade.deskripsi;
        const amount = rincian.jumlah;

        if (!gradeAggregation[gradeId]) {
          gradeAggregation[gradeId] = {
            gradeId: gradeId,
            gradeNama: gradeName,
            gradeDeskripsi: gradeDesc,
            totalJumlah: 0,
            harvestCount: 0,
            averagePerHarvest: 0,
          };
        }

        gradeAggregation[gradeId].totalJumlah += amount;
        gradeAggregation[gradeId].harvestCount++;
      });
    });

    // Calculate averages and percentages
    const gradeSummary = Object.values(gradeAggregation).map((grade) => ({
      ...grade,
      averagePerHarvest: (grade.totalJumlah / grade.harvestCount).toFixed(2),
      persentaseTotal:
        totalHarvestAmount > 0
          ? ((grade.totalJumlah / totalHarvestAmount) * 100).toFixed(2)
          : 0,
    }));

    // Sort by total amount descending
    gradeSummary.sort((a, b) => b.totalJumlah - a.totalJumlah);

    // Get commodity info
    const komoditasInfo = laporanPanen[0].PanenKebun.komoditas;

    return res.status(200).json({
      status: true,
      message: "Successfully retrieved grade summary",
      data: {
        komoditas: {
          id: komoditasInfo.id,
          nama: komoditasInfo.nama,
          jenis: komoditasInfo.jenis,
          satuan: komoditasInfo.Satuan,
        },
        periodeSummary: {
          totalHarvestCount: totalHarvestCount,
          totalHarvestAmount: totalHarvestAmount,
          averagePerHarvest:
            totalHarvestCount > 0
              ? (totalHarvestAmount / totalHarvestCount).toFixed(2)
              : 0,
          dateRange: {
            startDate: startDate || null,
            endDate: endDate || null,
          },
        },
        gradeSummary: gradeSummary,
        totalGradeTypes: gradeSummary.length,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: false,
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
            {
              model: PanenRincianGrade,
              include: [
                {
                  model: Grade,
                  attributes: ["id", "nama", "deskripsi"],
                },
              ],
              required: false, // Allow harvest records without grades
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

const getHasilPanenTernakWithGrades = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      komoditasId,
      unitBudidayaId,
      startDate,
      endDate,
    } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Validate pagination parameters
    if (parseInt(page) < 1 || parseInt(limit) < 1) {
      return res.status(400).json({
        status: false,
        message: "Page and limit must be positive numbers",
      });
    }

    if (parseInt(limit) > 100) {
      return res.status(400).json({
        status: false,
        message: "Limit cannot exceed 100 items per page",
      });
    }

    // Build where clause for filtering
    const whereClause = {
      isDeleted: false,
      tipe: "panen",
    };

    // Validate and apply date filters
    if (startDate || endDate) {
      if (startDate && endDate) {
        try {
          const start = new Date(startDate);
          const end = new Date(endDate);

          if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return res.status(400).json({
              status: false,
              message: "Invalid date format. Please use YYYY-MM-DD format",
            });
          }

          if (start > end) {
            return res.status(400).json({
              status: false,
              message: "Start date must be before or equal to end date",
            });
          }

          whereClause.createdAt = {
            [Op.between]: [start, end],
          };
        } catch (error) {
          return res.status(400).json({
            status: false,
            message: "Error parsing dates. Please use YYYY-MM-DD format",
          });
        }
      } else {
        return res.status(400).json({
          status: false,
          message:
            "Both startDate and endDate are required when filtering by date range",
        });
      }
    }

    // Unit budidaya filter
    if (unitBudidayaId) {
      whereClause.UnitBudidayaId = unitBudidayaId;
    }

    // Komoditas filter (will be applied in Panen include)
    const panenWhere = {};
    if (komoditasId) {
      panenWhere.komoditasId = komoditasId;
    }

    const { count, rows } = await Laporan.findAndCountAll({
      where: whereClause,
      attributes: [
        "id",
        "judul",
        "tipe",
        "gambar",
        "catatan",
        "isDeleted",
        "createdAt",
        "updatedAt",
        "UnitBudidayaId",
        "ObjekBudidayaId",
        "userId",
      ],
      include: [
        {
          model: Panen,
          where: panenWhere,
          required: true,
          include: [
            {
              model: Komoditas,
              as: "komoditas",
              attributes: ["id", "nama"],
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
                  attributes: ["id", "nama", "deskripsi"],
                },
              ],
              required: false, // Allow harvest records without grades
            },
            {
              model: DetailPanen,
              include: [
                {
                  model: ObjekBudidaya,
                  attributes: ["id", "namaId"],
                },
              ],
              required: false, // Allow harvest records without detail panen
            },
          ],
        },
        {
          model: UnitBudidaya,
          attributes: ["id", "nama", "tipe"],
          include: [
            {
              model: JenisBudidaya,
              attributes: ["nama", "tipe"],
            },
          ],
        },
        {
          model: User,
          as: "user",
          attributes: ["id", "name"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: parseInt(limit),
      offset: offset,
    });

    // Transform data for better frontend consumption
    const transformedData = rows.map((laporan) => {
      const panen = laporan.Panen;
      const grades = panen.PanenRincianGrades || [];
      const detailPanen = panen.DetailPanens || [];

      // Calculate grade summary
      const gradeSummary = grades.map((grade) => ({
        gradeId: grade.Grade.id,
        gradeNama: grade.Grade.nama,
        gradeDeskripsi: grade.Grade.deskripsi,
        jumlah: grade.jumlah,
        persentase:
          panen.jumlah > 0
            ? ((grade.jumlah / panen.jumlah) * 100).toFixed(2)
            : 0,
      }));

      // Get harvested animals info
      const harvestedAnimals = detailPanen.map((detail) => ({
        objekBudidayaId: detail.ObjekBudidaya.id,
        namaId: detail.ObjekBudidaya.namaId,
      }));

      return {
        laporanId: laporan.id,
        judul: laporan.judul,
        tanggalLaporan: laporan.createdAt,
        gambar: laporan.gambar,
        catatan: laporan.catatan,
        pelapor: {
          id: laporan.user.id,
          nama: laporan.user.name,
        },
        unitBudidaya: {
          id: laporan.UnitBudidaya.id,
          nama: laporan.UnitBudidaya.nama,
          tipe: laporan.UnitBudidaya.tipe,
          jenisBudidaya: laporan.UnitBudidaya.JenisBudidaya.nama,
        },
        komoditas: {
          id: panen.komoditas.id,
          nama: panen.komoditas.nama,
          satuan: panen.komoditas.Satuan,
        },
        hasilPanen: {
          jumlahPanen: panen.jumlah,
          jumlahHewanDipanen: harvestedAnimals.length,
        },
        rincianGrade: gradeSummary,
        hewanDipanen: harvestedAnimals,
        totalGradeCount: grades.length,
      };
    });

    const totalPages = Math.ceil(count / parseInt(limit));

    return res.status(200).json({
      status: true,
      message: "Successfully retrieved hasil panen ternak data with grades",
      data: transformedData,
      pagination: {
        currentPage: parseInt(page),
        totalPages: totalPages,
        totalItems: count,
        itemsPerPage: parseInt(limit),
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: false,
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
  getHasilPanenWithGrades,
  getHasilPanenTernakWithGrades,
  getGradeSummaryByKomoditas,
};
