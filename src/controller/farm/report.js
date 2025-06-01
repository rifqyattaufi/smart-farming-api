const { QueryTypes, Op, fn, col } = require("sequelize");
const sequelize = require("../../model/index");
const { getPaginationOptions } = require("../../utils/paginationUtils");

const db = sequelize.sequelize;

const JenisBudidaya = sequelize.JenisBudidaya;
const UnitBudidaya = sequelize.UnitBudidaya;
const ObjekBudidaya = sequelize.ObjekBudidaya;

const Laporan = sequelize.Laporan;
const User = sequelize.User;

const HarianKebun = sequelize.HarianKebun;
const HarianTernak = sequelize.HarianTernak;

const Sakit = sequelize.Sakit;
const Kematian = sequelize.Kematian;
const Vitamin = sequelize.Vitamin;

const Grade = sequelize.Grade;
const PanenRincianGrade = sequelize.PanenRincianGrade;
const PanenKebun = sequelize.PanenKebun;
const Panen = sequelize.Panen;

const Satuan = sequelize.Satuan;

const JenisHama = sequelize.JenisHama;
const Hama = sequelize.Hama;

const KategoriInventaris = sequelize.KategoriInventaris;
const Inventaris = sequelize.Inventaris;
const PenggunaanInventaris = sequelize.PenggunaanInventaris;

const Komoditas = sequelize.Komoditas;

const MAX_PLANTS_TO_LIST_IN_SUMMARY = 3;

function getPlantListSummary(plantNameList) {
  const count = plantNameList.length;
  if (count === 0) return "";
  if (count > MAX_PLANTS_TO_LIST_IN_SUMMARY) {
    return `${plantNameList
      .slice(0, MAX_PLANTS_TO_LIST_IN_SUMMARY)
      .join(", ")}, dan ${count - MAX_PLANTS_TO_LIST_IN_SUMMARY} lainnya`;
  }
  return plantNameList.join(", ");
}

const getStatistikHarianJenisBudidaya = async (req, res) => {
  try {
    const jenisBudidayaId = req.params.id;

    const jenisBudidaya = await JenisBudidaya.findOne({
      where: { id: jenisBudidayaId, isDeleted: false },
    });

    if (!jenisBudidaya) {
      return res
        .status(404)
        .json({ message: "Jenis Budidaya tidak ditemukan." });
    }

    const unitBudidayaList = await UnitBudidaya.findAll({
      where: { jenisBudidayaId: jenisBudidayaId, isDeleted: false },
      include: [
        { model: ObjekBudidaya, where: { isDeleted: false }, required: false },
      ],
    });

    if (!unitBudidayaList || unitBudidayaList.length === 0) {
      return res.status(404).json({
        message:
          "Tidak ada Unit Budidaya yang ditemukan untuk Jenis Budidaya ini.",
        data: {
          /* ... data default ... */
        },
      });
    }

    const semuaObjekBudidayaInstances = [];
    unitBudidayaList.forEach((unit) => {
      if (unit.ObjekBudidayas && unit.ObjekBudidayas.length > 0) {
        semuaObjekBudidayaInstances.push(...unit.ObjekBudidayas);
      }
    });

    const semuaObjekBudidayaIds = semuaObjekBudidayaInstances.map(
      (obj) => obj.id
    );
    const totalTanaman = semuaObjekBudidayaInstances.length;

    if (totalTanaman === 0) {
      return res.status(200).json({
        message:
          "Tidak ada tanaman (objek budidaya) yang terdaftar untuk dianalisis.",
        data: {
          /* ... data default jika tidak ada objek budidaya ... */
        },
      });
    }

    const laporanDenganDetailHarian = await Laporan.findAll({
      where: {
        objekBudidayaId: { [Op.in]: semuaObjekBudidayaIds },
        isDeleted: false,
        tipe: "harian",
      },
      include: [
        {
          model: HarianKebun,
          required: true,
        },
      ],
      order: [
        ["objekBudidayaId", "ASC"],
        ["createdAt", "DESC"],
      ],
    });

    // console.log(`Total ObjekBudidaya IDs: ${semuaObjekBudidayaIds.length}`, semuaObjekBudidayaIds);
    // console.log(`Total Laporan Harian ditemukan: ${laporanDenganDetailHarian.length}`);
    // if (laporanDenganDetailHarian.length > 0) {
    //   console.log("Contoh Laporan pertama (termasuk HarianKebun):", JSON.stringify(laporanDenganDetailHarian[0], null, 2));
    // }

    const latestStatusDataMap = new Map(); // Untuk menyimpan data HarianKebun TERBARU per objekBudidayaId
    const reportCountMap = new Map();

    for (const laporan of laporanDenganDetailHarian) {
      const objekId = laporan.ObjekBudidayaId;
      reportCountMap.set(objekId, (reportCountMap.get(objekId) || 0) + 1);
      if (!latestStatusDataMap.has(objekId)) {
        let detailHarian = null;
        if (laporan.HarianKebuns && laporan.HarianKebuns.length > 0) {
          // Jika relasi hasMany dan HarianKebuns adalah array
          detailHarian = laporan.HarianKebuns[0];
        } else if (laporan.HarianKebun) {
          // Jika relasi hasOne dan HarianKebun adalah objek
          detailHarian = laporan.HarianKebun;
        }
        if (detailHarian) {
          latestStatusDataMap.set(objekId, detailHarian);
        }
      }
    }

    let tanamanSehat = 0;
    let perluPerhatian = 0;
    let kritis = 0;
    const detailTanamanList = [];
    const tanamanKritisList = [];
    const tanamanPerluPerhatianDenganDataList = [];
    const tanamanPerluPerhatianTanpaDataList = [];

    for (const objekInstance of semuaObjekBudidayaInstances) {
      const objekId = objekInstance.id;
      const namaTanaman = objekInstance.namaId || "Nama Tidak Diketahui";
      const harianKebunUntukStatus = latestStatusDataMap.get(objekId); //
      const jumlahLaporan = reportCountMap.get(objekId) || 0;

      let skorMasalah = jumlahLaporan;
      let kondisiDaunDisplay = "Tidak Ada Data";
      let statusKlasifikasi = "Tidak Ada Data";
      let alasanStatusKlasifikasi = "";

      // Untuk DEBUGGING: Cek isi harianKebunUntukStatus untuk tanaman tertentu
      // if (namaTanaman === "Melon #11" && harianKebunUntukStatus) { // Ganti "Melon #11" dengan nama tanaman yang bermasalah
      //    console.log(`[DEBUG] Data HarianKebun untuk ${namaTanaman}:`, JSON.stringify(harianKebunUntukStatus, null, 2));
      // }

      if (harianKebunUntukStatus) {
        const {
          kondisiDaun,
          tinggiTanaman,
          statusTumbuh,
          penyiraman,
          pruning,
          repotting,
        } = harianKebunUntukStatus;

        // Untuk DEBUGGING nilai yang diekstrak:
        // if (namaTanaman === "Melon #11") { // Ganti dengan nama tanaman yang bermasalah
        //     console.log(`[DEBUG VALUES for ${namaTanaman}] Penyiraman: ${penyiraman} (Tipe: ${typeof penyiraman}), Pruning: ${pruning} (Tipe: ${typeof pruning}), Repotting: ${repotting} (Tipe: ${typeof repotting})`);
        // }

        kondisiDaunDisplay = kondisiDaun;
        let alasanDetailParts = [];
        let tempSkorKondisi;

        if (kondisiDaun === "sehat") {
          tempSkorKondisi = 0;
          alasanDetailParts.push(`\nKondisi daun: '${kondisiDaun}'`);
        } else if (
          ["kering", "layu", "keriting", "rusak"].includes(kondisiDaun)
        ) {
          tempSkorKondisi = 3; // Kritis
          alasanDetailParts.push(`\nKondisi daun: '${kondisiDaun}'`);

          // Cek apakah 'pruning' bernilai truthy (1, "1", atau true)
          if (
            (String(pruning) === "1" || pruning === true) &&
            kondisiDaun === "rusak"
          ) {
            alasanDetailParts.push("(kemungkinan akibat aktivitas pruning)");
          }
        } else if (["kuning", "bercak"].includes(kondisiDaun)) {
          tempSkorKondisi = 2; // Perlu Perhatian
          alasanDetailParts.push(`\nKondisi daun: '${kondisiDaun}'`);
        } else {
          tempSkorKondisi = 1; // Perlu Perhatian
          alasanDetailParts.push(
            `\nKondisi daun: '${kondisiDaun}' (tidak terdefinisi secara spesifik)`
          );
        }

        if (typeof tinggiTanaman !== "undefined" && tinggiTanaman !== null) {
          alasanDetailParts.push(`\nTinggi tanaman: ${tinggiTanaman} cm`);
        }
        if (
          statusTumbuh &&
          typeof statusTumbuh === "string" &&
          statusTumbuh.trim() !== ""
        ) {
          alasanDetailParts.push(`\nStatus tumbuh: '${statusTumbuh}'`);
        }

        let kegiatanList = [];

        // Pengecekan kegiatan yang lebih robust (mencakup angka 1, string "1", atau boolean true)
        if (String(penyiraman) === "1" || penyiraman === true) {
          kegiatanList.push("penyiraman");
        }
        if (String(pruning) === "1" || pruning === true) {
          kegiatanList.push("pruning");
        }
        if (String(repotting) === "1" || repotting === true) {
          kegiatanList.push("repotting");
        }

        if (kegiatanList.length > 0) {
          alasanDetailParts.push(
            `\n\nKegiatan tercatat pada laporan ini: ${kegiatanList.join(", ")}`
          );
        } else {
          alasanDetailParts.push(
            "\n\nTidak ada kegiatan spesifik (penyiraman/pruning/repotting) tercatat pada laporan ini."
          );
        }

        alasanStatusKlasifikasi = alasanDetailParts
          .filter((part) => part && part.length > 0)
          .join(". ")
          .trim();
        if (alasanStatusKlasifikasi && !alasanStatusKlasifikasi.endsWith(".")) {
          alasanStatusKlasifikasi += ".";
        }
        alasanStatusKlasifikasi = alasanStatusKlasifikasi.replace(
          /\.\.+/g,
          "."
        );

        if (tempSkorKondisi === 0) {
          statusKlasifikasi = "Sehat";
          tanamanSehat++;
        } else if (tempSkorKondisi >= 1 && tempSkorKondisi <= 2) {
          statusKlasifikasi = "Perlu Perhatian";
          perluPerhatian++;
          tanamanPerluPerhatianDenganDataList.push(namaTanaman);
        } else {
          statusKlasifikasi = "Kritis";
          kritis++;
          tanamanKritisList.push(namaTanaman);
        }
      } else {
        kondisiDaunDisplay = "Tidak Ada Data";
        statusKlasifikasi = "Perlu Perhatian";
        perluPerhatian++;
        alasanStatusKlasifikasi =
          "Tidak ada data laporan harian terbaru untuk evaluasi.";
        tanamanPerluPerhatianTanpaDataList.push(namaTanaman);
        if (jumlahLaporan === 0) {
          skorMasalah = 1;
        }
      }

      detailTanamanList.push({
        id: objekId,
        namaId: namaTanaman,
        skorMasalah: skorMasalah,
        kondisiDaun: kondisiDaunDisplay,
        statusKlasifikasi: statusKlasifikasi,
        alasanStatusKlasifikasi: alasanStatusKlasifikasi,
      });
    }

    const persentaseSehat =
      totalTanaman > 0 ? (tanamanSehat / totalTanaman) * 100 : 0;
    const persentasePerluPerhatian =
      totalTanaman > 0 ? (perluPerhatian / totalTanaman) * 100 : 0;
    const persentaseKritis =
      totalTanaman > 0 ? (kritis / totalTanaman) * 100 : 0;

    let rekomendasi = "Semua tanaman dalam kondisi baik.";
    let criticalMessage = "";
    let attentionMessage = "";

    // Bagian Tanaman Kritis
    if (kritis > 0) {
      const namaKritisStr = tanamanKritisList.join(", ");
      criticalMessage = `Ada ${kritis} tanaman dalam kondisi kritis: ${namaKritisStr}. Segera periksa dan tangani.`;
    }

    // Bagian Tanaman Perlu Perhatian
    if (perluPerhatian > 0) {
      let perluPerhatianDetailsCombined = [];
      if (tanamanPerluPerhatianDenganDataList.length > 0) {
        const summary = getPlantListSummary(
          tanamanPerluPerhatianDenganDataList
        );
        perluPerhatianDetailsCombined.push(
          `${tanamanPerluPerhatianDenganDataList.length} tanaman berdasarkan laporan terakhir (${summary})`
        );
      }
      if (tanamanPerluPerhatianTanpaDataList.length > 0) {
        const summary = getPlantListSummary(tanamanPerluPerhatianTanpaDataList);
        perluPerhatianDetailsCombined.push(
          `${tanamanPerluPerhatianTanpaDataList.length} tanaman karena tidak ada data laporan terbaru (${summary})`
        );
      }

      if (perluPerhatianDetailsCombined.length > 0) {
        const detailText = perluPerhatianDetailsCombined.join("; dan ");
        if (criticalMessage) {
          // Jika ada pesan kritis sebelumnya
          attentionMessage = `\n\nSelain itu, ${perluPerhatian} tanaman juga memerlukan perhatian lebih lanjut, yaitu: ${detailText}.`;
        } else if (tanamanSehat < totalTanaman) {
          // Hanya jika tidak semua sehat (dan tidak ada kritis)
          attentionMessage = `\nTerdapat ${perluPerhatian} tanaman yang memerlukan perhatian lebih lanjut, yaitu: ${detailText}.`;
        }
      }
    }

    // Gabungkan pesan-pesan rekomendasi
    if (criticalMessage && attentionMessage) {
      rekomendasi = `${criticalMessage} ${attentionMessage}`;
    } else if (criticalMessage) {
      rekomendasi = criticalMessage;
    } else if (attentionMessage) {
      rekomendasi = attentionMessage;
    }

    return res.status(200).json({
      message: "Statistik harian berhasil diambil.",
      data: {
        totalTanaman,
        tanamanSehat,
        perluPerhatian,
        kritis,
        persentaseSehat: parseFloat(persentaseSehat.toFixed(2)),
        persentasePerluPerhatian: parseFloat(
          persentasePerluPerhatian.toFixed(2)
        ),
        persentaseKritis: parseFloat(persentaseKritis.toFixed(2)),
        rekomendasi,
        detailTanaman: detailTanamanList,
        grafikTinggiTanaman: {
          labels: [],
          datasets: [{ label: "Tinggi Tanaman", data: [] }],
        },
        grafikKesehatan: {
          labels: ["Sehat", "Perlu Perhatian", "Kritis"],
          datasets: [{ data: [tanamanSehat, perluPerhatian, kritis] }],
        },
      },
    });
  } catch (error) {
    console.error("Error fetching statistik harian:", error);
    res.status(500).json({
      message: "Gagal mengambil statistik harian.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const getStatistikLaporanHarian = async (req, res) => {
  try {
    const jenisBudidayaId = req.params.id;
    const { startDate, endDate, groupBy } = req.query;

    if (!jenisBudidayaId) {
      return res
        .status(400)
        .json({
          message: "Path parameter 'id' (jenisBudidayaId) is required.",
        });
    }
    if (!startDate || !endDate || !groupBy) {
      return res
        .status(400)
        .json({
          message:
            "startDate, endDate, and groupBy query parameters are required.",
        });
    }

    let dateColumnFormat;
    switch (groupBy) {
      case "day":
        dateColumnFormat = fn("DATE", col("Laporan.createdAt"));
        break;
      case "month":
        dateColumnFormat = fn(
          "DATE_FORMAT",
          col("Laporan.createdAt"),
          "%Y-%m-01"
        );
        break;
      case "year":
        dateColumnFormat = fn(
          "DATE_FORMAT",
          col("Laporan.createdAt"),
          "%Y-01-01"
        );
        break;
      default:
        return res.status(400).json({ message: "Invalid groupBy value." });
    }

    const statistik = await Laporan.findAll({
      attributes: [
        [dateColumnFormat, "period"],
        [fn("COUNT", col("Laporan.id")), "jumlahLaporan"],
      ],
      include: [
        {
          model: ObjekBudidaya,
          attributes: [],
          required: true,
          include: [
            {
              model: UnitBudidaya,
              attributes: [],
              required: true,
              where: {
                jenisBudidayaId: jenisBudidayaId,
                isDeleted: false,
              },
            },
          ],
          where: {
            isDeleted: false,
          },
        },
      ],
      where: {
        isDeleted: false,
        tipe: "harian",
        createdAt: {
          [Op.between]: [
            new Date(startDate),
            new Date(endDate + "T23:59:59.999Z"),
          ],
        },
      },
      group: ["period"],
      order: [["period", "ASC"]],
    });

    console.log(
      "Statistik instances from findAll (before map):",
      statistik.map((s) => s.toJSON())
    );

    const formattedStatistik = statistik.map((sequelizeInstance) => {
      const plainObject = sequelizeInstance.toJSON();

      plainObject.jumlahLaporan =
        plainObject.jumlahLaporan !== null && !isNaN(plainObject.jumlahLaporan)
          ? parseInt(plainObject.jumlahLaporan, 10)
          : 0;

      return plainObject;
    });

    console.log(
      "Formatted Statistik (to be sent in response):",
      JSON.stringify(formattedStatistik, null, 2)
    );

    return res.status(200).json({
      message: `Successfully retrieved daily report statistics for JenisBudidaya ID: ${jenisBudidayaId}`,
      data: formattedStatistik,
    });
  } catch (error) {
    console.error(
      `Error getStatistikLaporanHarian for JenisBudidaya ID ${req.params.id}:`,
      error
    );
    res.status(500).json({ message: error.message, detail: error });
  }
};

const getStatistikPenyiraman = async (req, res) => {
  try {
    const jenisBudidayaId = req.params.id;
    const { startDate, endDate, groupBy } = req.query;

    if (!jenisBudidayaId) {
      return res
        .status(400)
        .json({
          message: "Path parameter 'id' (jenisBudidayaId) is required.",
        });
    }
    if (!startDate || !endDate || !groupBy) {
      return res
        .status(400)
        .json({
          message:
            "startDate, endDate, and groupBy query parameters are required.",
        });
    }

    let dateColumnFormat;
    switch (groupBy) {
      case "day":
        dateColumnFormat = fn("DATE", col("Laporan.createdAt"));
        break;
      case "month":
        dateColumnFormat = fn(
          "DATE_FORMAT",
          col("Laporan.createdAt"),
          "%Y-%m-01"
        );
        break;
      case "year":
        dateColumnFormat = fn(
          "DATE_FORMAT",
          col("Laporan.createdAt"),
          "%Y-01-01"
        );
        break;
      default:
        return res.status(400).json({ message: "Invalid groupBy value." });
    }

    const statistik = await Laporan.findAll({
      attributes: [
        [dateColumnFormat, "period"],
        [fn("COUNT", col("HarianKebun.id")), "jumlahPenyiraman"],
      ],
      include: [
        {
          model: HarianKebun,
          attributes: [],
          where: {
            penyiraman: 1,
            isDeleted: false,
          },
          required: true,
        },
        {
          model: ObjekBudidaya,
          attributes: [],
          required: true,
          include: [
            {
              model: UnitBudidaya,
              attributes: [],
              required: true,
              where: {
                jenisBudidayaId: jenisBudidayaId,
                isDeleted: false,
              },
            },
          ],
          where: {
            isDeleted: false,
          },
        },
      ],
      where: {
        isDeleted: false,
        tipe: "harian",
        createdAt: {
          [Op.between]: [
            new Date(startDate),
            new Date(endDate + "T23:59:59.999Z"),
          ],
        },
      },
      group: ["period"],
      order: [["period", "ASC"]],
    });

    console.log(
      "Statistik instances from findAll (before map):",
      statistik.map((s) => s.toJSON())
    );

    const formattedStatistik = statistik.map((sequelizeInstance) => {
      const plainObject = sequelizeInstance.toJSON();

      plainObject.jumlahPenyiraman =
        plainObject.jumlahPenyiraman !== null &&
        !isNaN(plainObject.jumlahPenyiraman)
          ? parseInt(plainObject.jumlahPenyiraman, 10)
          : 0;

      return plainObject;
    });

    console.log(
      "Formatted Statistik (to be sent in response):",
      JSON.stringify(formattedStatistik, null, 2)
    );

    return res.status(200).json({
      message: `Successfully retrieved plant watering statistics for JenisBudidaya ID: ${jenisBudidayaId}`,
      data: formattedStatistik,
    });
  } catch (error) {
    console.error(
      `Error getStatistikPenyiraman for JenisBudidaya ID ${req.params.id}:`,
      error
    );
    res.status(500).json({ message: error.message, detail: error });
  }
};

const getStatistikPemberianNutrisi = async (req, res) => {
  try {
    const jenisBudidayaId = req.params.id;
    const { startDate, endDate, groupBy } = req.query;

    if (!jenisBudidayaId) {
      return res
        .status(400)
        .json({
          message: "Path parameter 'id' (jenisBudidayaId) is required.",
        });
    }
    if (!startDate || !endDate || !groupBy) {
      return res
        .status(400)
        .json({
          message:
            "startDate, endDate, and groupBy query parameters are required.",
        });
    }

    let dateColumnFormat;
    switch (groupBy) {
      case "day":
        dateColumnFormat = fn("DATE", col("Laporan.createdAt"));
        break;
      case "month":
        dateColumnFormat = fn(
          "DATE_FORMAT",
          col("Laporan.createdAt"),
          "%Y-%m-01"
        );
        break;
      case "year":
        dateColumnFormat = fn(
          "DATE_FORMAT",
          col("Laporan.createdAt"),
          "%Y-01-01"
        );
        break;
      default:
        return res.status(400).json({ message: "Invalid groupBy value." });
    }

    const statistikFrekuensi = await Laporan.findAll({
      attributes: [
        [dateColumnFormat, "period"],
        [fn("COUNT", col("Vitamin.id")), "jumlahKejadianPemberianPupuk"],
      ],
      include: [
        {
          model: Vitamin,
          attributes: [],
          where: {
            tipe: "pupuk",
            isDeleted: false,
          },
          required: true,
        },
        {
          model: ObjekBudidaya,
          attributes: [],
          required: true,
          include: [
            {
              model: UnitBudidaya,
              attributes: [],
              required: true,
              where: {
                jenisBudidayaId: jenisBudidayaId,
                isDeleted: false,
              },
            },
          ],
          where: {
            isDeleted: false,
          },
        },
      ],
      where: {
        isDeleted: false,
        tipe: "vitamin",
        createdAt: {
          [Op.between]: [
            new Date(startDate),
            new Date(endDate + "T23:59:59.999Z"),
          ],
        },
      },
      group: ["period"],
      order: [["period", "ASC"]],
    });

    console.log(
      "Statistik instances from findAll (before map):",
      statistikFrekuensi.map((s) => s.toJSON())
    );

    const formattedStatistik = statistikFrekuensi.map((sequelizeInstance) => {
      const plainObject = sequelizeInstance.toJSON();

      plainObject.jumlahKejadianPemberianPupuk =
        plainObject.jumlahKejadianPemberianPupuk !== null &&
        !isNaN(plainObject.jumlahKejadianPemberianPupuk)
          ? parseInt(plainObject.jumlahKejadianPemberianPupuk, 10)
          : 0;

      return plainObject;
    });

    console.log(
      "Formatted Statistik (to be sent in response):",
      JSON.stringify(formattedStatistik, null, 2)
    );

    return res.status(200).json({
      message: `Successfully retrieved nutrient (fertilizer) application statistics for JenisBudidaya ID: ${jenisBudidayaId}`,
      data: formattedStatistik,
    });
  } catch (error) {
    console.error(
      `Error getStatistikPemberianNutrisi for JenisBudidaya ID ${req.params.id}:`,
      error
    );
    res.status(500).json({ message: error.message, detail: error });
  }
};

const getRiwayatLaporanUmumPerJenisBudidaya = async (req, res) => {
  const { jenisBudidayaId } = req.params;
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 5;
  const offset = (page - 1) * limit;

  try {
    const { count, rows } = await Laporan.findAndCountAll({
      include: [
        {
          model: ObjekBudidaya,
          attributes: ["id", "namaId"],
          required: true,
          where: { isDeleted: false },
          include: [
            {
              model: UnitBudidaya,
              attributes: [],
              required: true,
              where: {
                jenisBudidayaId: jenisBudidayaId,
                isDeleted: false,
              },
            },
          ],
        },
        {
          model: User,
          as: "user",
          attributes: ["name"],
          required: false,
        },
      ],
      where: {
        isDeleted: false,
      },
      order: [["createdAt", "DESC"]],
      limit: limit,
      offset: offset,
      distinct: true,
    });

    const formattedRows = rows.map((laporan) => {
      let descriptiveText =
        laporan.judul || `Laporan ${laporan.tipe || "Umum"}`;
      if (laporan.ObjekBudidaya && laporan.ObjekBudidaya.namaId) {
        descriptiveText += ` (${laporan.ObjekBudidaya.namaId})`;
      }

      return {
        id: laporan.id,
        laporanId: laporan.id,
        text: descriptiveText,
        gambar: laporan.gambar,
        tipe: laporan.tipe ? laporan.tipe.toLowerCase() : "umum",
        time: laporan.createdAt,
        petugasNama: laporan.user
          ? laporan.user.name
          : "Petugas Tidak Diketahui",
        judul: laporan.judul || "Tidak Ada Judul",
      };
    });

    return res.status(200).json({
      status: true,
      message: "Riwayat pelaporan umum berhasil diambil.",
      data: formattedRows,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      totalItems: count,
    });
  } catch (error) {
    console.error("Error getRiwayatLaporanUmumPerJenisBudidaya:", error);
    res.status(500).json({
      status: false,
      message: "Gagal mengambil riwayat pelaporan umum.",
      error: error.message,
    });
  }
};

const getRiwayatPemberianNutrisiPerJenisBudidaya = async (req, res) => {
  const { jenisBudidayaId } = req.params;
  const tipeNutrisiFilter = req.query.tipeNutrisi;
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 3;
  const offset = (page - 1) * limit;

  const whereDetailPemberian = { isDeleted: false };
  if (tipeNutrisiFilter) {
    whereDetailPemberian.tipe = { [Op.in]: tipeNutrisiFilter.split(",") };
  } else {
  }

  try {
    const { count, rows } = await Vitamin.findAndCountAll({
      where: whereDetailPemberian,
      include: [
        {
          model: Laporan,
          attributes: ["id", "createdAt", "objekBudidayaId"],
          required: true,
          where: { isDeleted: false },
          include: [
            {
              model: ObjekBudidaya,
              attributes: [],
              required: true,
              where: { isDeleted: false },
              include: [
                {
                  model: UnitBudidaya,
                  attributes: [],
                  required: true,
                  where: {
                    jenisBudidayaId: jenisBudidayaId,
                    isDeleted: false,
                  },
                },
              ],
            },
            {
              model: User,
              as: "user",
              attributes: ["name"],
              required: false,
            },
          ],
        },
        {
          model: Inventaris,
          as: "inventaris",
          attributes: ["nama", "gambar"],
          required: true,
          where: { isDeleted: false },
          include: [
            {
              model: Satuan,
              attributes: ["lambang", "nama"],
              required: false,
            },
          ],
        },
      ],
      order: [[{ model: Laporan, as: "Laporan" }, "createdAt", "DESC"]],
      limit: limit,
      offset: offset,
      distinct: true,
    });

    const formattedRows = rows.map((dp) => {
      return {
        laporanId: dp.Laporan ? dp.Laporan.id : null,
        name: `${dp.inventaris ? dp.inventaris.nama : "Item Tidak Dikenal"} - ${
          dp.jumlah || ""
        } ${
          dp.inventaris && dp.inventaris.Satuan
            ? dp.inventaris.Satuan.lambang
            : ""
        }`.trim(),
        category: dp.tipe
          ? dp.tipe.charAt(0).toUpperCase() + dp.tipe.slice(1)
          : "Nutrisi", // Misal "Pupuk"
        image: dp.Laporan ? dp.Laporan.gambar : null,
        person:
          dp.Laporan && dp.Laporan.user
            ? dp.Laporan.user.name
            : "Petugas Tidak Diketahui",
        date: dp.Laporan ? dp.Laporan.createdAt : dp.createdAt,
        time: dp.Laporan ? dp.Laporan.createdAt : dp.createdAt,
      };
    });

    return res.status(200).json({
      status: true,
      message: "Riwayat pemberian nutrisi berhasil diambil.",
      data: formattedRows,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      totalItems: count,
    });
  } catch (error) {
    console.error("Error getRiwayatPemberianNutrisiPerJenisBudidaya:", error);
    res.status(500).json({
      status: false,
      message: "Gagal mengambil riwayat pemberian nutrisi.",
      error: error.message,
    });
  }
};

module.exports = {
  getStatistikHarianJenisBudidaya,
  getStatistikLaporanHarian,
  getStatistikPenyiraman,
  getStatistikPemberianNutrisi,
  getRiwayatLaporanUmumPerJenisBudidaya,
  getRiwayatPemberianNutrisiPerJenisBudidaya,
};
