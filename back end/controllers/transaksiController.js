const { pool } = require("../db");
const jenisModel = require("../models/jenisPakaianModel");
const pelangganModel = require("../models/pelangganModel");
const transaksiModel = require("../models/transaksiModel");
const { createWhatsAppLink, generateOrderCode } = require("../utils/order");
const { sendError, sendSuccess } = require("../utils/response");

const KILOAN_RATE = 10000;
const EXPRESS_FEE = 10000;
const ALLOWED_LAYANAN = ["kiloan", "satuan"];
const ALLOWED_PAKET = ["normal", "express"];
const ALLOWED_STATUS = ["belum_selesai", "siap_diambil", "selesai"];

function getExpressFee(paket) {
  return paket === "express" ? EXPRESS_FEE : 0;
}

function validateTransaksiPayload(payload) {
  const { nama, nomor_hp: nomorHp, layanan, paket, berat_kg: beratKg, items } = payload;

  if (!nama || !nomorHp || !layanan || !paket) {
    return "Nama, nomor_hp, layanan, dan paket wajib diisi.";
  }

  if (!ALLOWED_LAYANAN.includes(layanan)) {
    return "Layanan harus kiloan atau satuan.";
  }

  if (!ALLOWED_PAKET.includes(paket)) {
    return "Paket harus normal atau express.";
  }

  if (layanan === "kiloan") {
    if (beratKg === undefined || beratKg === null || Number(beratKg) <= 0) {
      return "Transaksi kiloan wajib mengisi berat_kg lebih dari 0.";
    }
  }

  if (layanan === "satuan") {
    if (beratKg !== undefined && beratKg !== null && Number(beratKg) !== 0) {
      return "berat_kg harus null atau kosong untuk layanan satuan.";
    }

    if (!Array.isArray(items) || items.length < 1) {
      return "Transaksi satuan wajib memiliki minimal 1 detail item.";
    }
  }

  return null;
}

async function resolveDetailItems(items, connection) {
  const resolvedItems = [];
  let total = 0;

  for (const item of items) {
    const jenisPakaianId = item.jenis_pakaian_id || item.jenisPakaianId;
    const jumlah = Number(item.jumlah || 0);

    if (!jenisPakaianId || jumlah <= 0) {
      const error = new Error("Setiap item satuan wajib memiliki jenis_pakaian_id dan jumlah valid.");
      error.statusCode = 400;
      throw error;
    }

    const jenisPakaian = await jenisModel.findJenisById(jenisPakaianId, connection);
    if (!jenisPakaian) {
      const error = new Error(`Jenis pakaian dengan id ${jenisPakaianId} tidak ditemukan.`);
      error.statusCode = 404;
      throw error;
    }

    const subtotal = jumlah * Number(jenisPakaian.harga);
    total += subtotal;
    resolvedItems.push({
      jenisPakaianId: jenisPakaian.id,
      jumlah,
      subtotal,
      jenis_pakaian: jenisPakaian.nama,
      harga: Number(jenisPakaian.harga),
    });
  }

  return { resolvedItems, total };
}

async function createTransaksi(req, res, next) {
  let connection;

  try {
    const validationError = validateTransaksiPayload(req.body);
    if (validationError) {
      return sendError(res, 400, validationError);
    }

    const {
      nama,
      nomor_hp: nomorHp,
      alamat = null,
      layanan,
      paket,
      berat_kg: beratKg,
      items = [],
    } = req.body;

    connection = await pool.getConnection();
    await connection.beginTransaction();

    let pelanggan = await pelangganModel.findByPhone(nomorHp, connection);
    if (!pelanggan) {
      pelanggan = await pelangganModel.createPelanggan(
        {
          nama,
          nomorHp,
          alamat,
        },
        connection,
      );
    }

    let totalHarga = 0;
    let resolvedItems = [];
    let normalizedBeratKg = null;

    if (layanan === "kiloan") {
      normalizedBeratKg = Number(beratKg);
      totalHarga = normalizedBeratKg * KILOAN_RATE;
    } else {
      const detailData = await resolveDetailItems(items, connection);
      resolvedItems = detailData.resolvedItems;
      totalHarga = detailData.total;
    }

    totalHarga += getExpressFee(paket);

    const transaksiId = await transaksiModel.createTransaksi(
      {
        pelangganId: pelanggan.id,
        kodeOrder: "TEMP",
        layanan,
        paket,
        tanggalMasuk: new Date(),
        tanggalSelesai: null,
        beratKg: layanan === "kiloan" ? normalizedBeratKg : null,
        totalHarga,
        status: "belum_selesai",
      },
      connection,
    );

    const kodeOrder = generateOrderCode(transaksiId);
    await transaksiModel.updateKodeOrder(transaksiId, kodeOrder, connection);

    for (const item of resolvedItems) {
      await transaksiModel.createDetail(
        {
          transaksiId,
          jenisPakaianId: item.jenisPakaianId,
          jumlah: item.jumlah,
          subtotal: item.subtotal,
        },
        connection,
      );
    }

    await connection.commit();

    const transaksi = await transaksiModel.findTransaksiById(transaksiId);
    return sendSuccess(res, 201, "Transaksi berhasil dibuat.", {
      ...transaksi,
      items: resolvedItems,
    });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    return next(error);
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

async function getActiveTransaksi(req, res, next) {
  try {
    const transaksi = await transaksiModel.getActiveTransactions();
    return sendSuccess(res, 200, "Daftar transaksi aktif berhasil diambil.", transaksi);
  } catch (error) {
    return next(error);
  }
}

async function getRiwayat(req, res, next) {
  try {
    const transaksi = await transaksiModel.getRiwayatTransactions();
    return sendSuccess(res, 200, "Riwayat transaksi berhasil diambil.", transaksi);
  } catch (error) {
    return next(error);
  }
}

async function updateStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!ALLOWED_STATUS.includes(status)) {
      return sendError(res, 400, "Status tidak valid.");
    }

    const transaksi = await transaksiModel.findTransaksiById(id);
    if (!transaksi) {
      return sendError(res, 404, "Transaksi tidak ditemukan.");
    }

    const tanggalSelesai = status === "selesai" ? new Date() : null;
    await transaksiModel.updateStatus(id, status, tanggalSelesai);

    const updatedTransaksi = await transaksiModel.findTransaksiById(id);
    const responseData = { ...updatedTransaksi };

    if (status === "siap_diambil") {
      responseData.whatsapp_link = createWhatsAppLink(
        updatedTransaksi.nomor_hp,
        updatedTransaksi.nama_pelanggan,
        updatedTransaksi.kode_order,
      );
    }

    return sendSuccess(res, 200, "Status transaksi berhasil diperbarui.", responseData);
  } catch (error) {
    return next(error);
  }
}

async function addTransaksiDetail(req, res, next) {
  let connection;

  try {
    const { id } = req.params;
    const { jenis_pakaian_id: jenisPakaianId, jumlah } = req.body;

    if (!jenisPakaianId || Number(jumlah) <= 0) {
      return sendError(res, 400, "jenis_pakaian_id dan jumlah wajib valid.");
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    const transaksi = await transaksiModel.findTransaksiById(id, connection);
    if (!transaksi) {
      await connection.rollback();
      return sendError(res, 404, "Transaksi tidak ditemukan.");
    }

    if (transaksi.layanan !== "satuan") {
      await connection.rollback();
      return sendError(res, 400, "Detail item hanya dapat ditambahkan ke transaksi satuan.");
    }

    const jenisPakaian = await jenisModel.findJenisById(jenisPakaianId, connection);
    if (!jenisPakaian) {
      await connection.rollback();
      return sendError(res, 404, "Jenis pakaian tidak ditemukan.");
    }

    const subtotal = Number(jumlah) * Number(jenisPakaian.harga);
    await transaksiModel.createDetail(
      {
        transaksiId: id,
        jenisPakaianId,
        jumlah: Number(jumlah),
        subtotal,
      },
      connection,
    );

    const detailTotal = await transaksiModel.getDetailSummary(id, connection);
    const totalHarga = detailTotal + getExpressFee(transaksi.paket);
    await transaksiModel.updateTransaksiTotals(
      id,
      {
        totalHarga,
        beratKg: null,
        tanggalSelesai: transaksi.tanggal_selesai,
        status: transaksi.status,
      },
      connection,
    );

    await connection.commit();

    const updatedTransaksi = await transaksiModel.findTransaksiById(id);
    return sendSuccess(res, 201, "Detail transaksi berhasil ditambahkan.", {
      transaksi: updatedTransaksi,
      detail: {
        jenis_pakaian_id: jenisPakaian.id,
        jenis_pakaian: jenisPakaian.nama,
        jumlah: Number(jumlah),
        subtotal,
      },
    });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    return next(error);
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

module.exports = {
  createTransaksi,
  getActiveTransaksi,
  getRiwayat,
  updateStatus,
  addTransaksiDetail,
};
