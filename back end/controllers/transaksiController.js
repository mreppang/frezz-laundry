const { pool } = require("../db");
const jenisModel = require("../models/jenisPakaianModel");
const pelangganModel = require("../models/pelangganModel");
const transaksiModel = require("../models/transaksiModel");
const asyncHandler = require("../utils/asyncHandler");
const { createWhatsAppLink, generateOrderCode } = require("../utils/order");

const HARGA_KILOAN = 10000;
const TAMBAHAN_EXPRESS = 10000;

function validateTransaksi(body) {
  const noHp = body.nomor_hp || body.no_hp;
  const { nama, layanan, paket, berat_kg: beratKg, items } = body;

  if (!nama || !noHp || !layanan || !paket) {
    return "Nama, nomor HP, layanan, dan paket wajib diisi.";
  }

  if (!["kiloan", "satuan"].includes(layanan)) {
    return "Layanan harus kiloan atau satuan.";
  }

  if (!["normal", "express"].includes(paket)) {
    return "Paket harus normal atau express.";
  }

  if (layanan === "kiloan" && (!beratKg || Number(beratKg) <= 0)) {
    return "Berat KG wajib diisi untuk layanan kiloan.";
  }

  if (layanan === "satuan") {
    if (beratKg !== undefined && beratKg !== null && Number(beratKg) !== 0) {
      return "Berat KG harus kosong atau null untuk layanan satuan.";
    }

    if (!Array.isArray(items) || items.length === 0) {
      return "Item wajib diisi untuk layanan satuan.";
    }
  }

  return null;
}

const getAllTransaksi = asyncHandler(async (req, res) => {
  const rows = await transaksiModel.getAllActive();
  res.status(200).json({
    success: true,
    message: "Data transaksi aktif berhasil diambil.",
    data: rows,
  });
});

const getLatestTransaksi = asyncHandler(async (req, res) => {
  const rows = await transaksiModel.getLatest(5);
  res.status(200).json({
    success: true,
    message: "Transaksi terbaru berhasil diambil.",
    data: rows,
  });
});

const getTransaksiById = asyncHandler(async (req, res) => {
  const transaksi = await transaksiModel.findById(req.params.id);
  if (!transaksi) {
    return res.status(404).json({
      success: false,
      message: "Transaksi tidak ditemukan.",
    });
  }

  const details = await transaksiModel.getDetailsByTransaksiId(req.params.id);
  res.status(200).json({
    success: true,
    message: "Detail transaksi berhasil diambil.",
    data: {
      ...transaksi,
      details,
    },
  });
});

const createTransaksi = asyncHandler(async (req, res) => {
  const validationError = validateTransaksi(req.body);
  if (validationError) {
    return res.status(400).json({
      success: false,
      message: validationError,
    });
  }

  const {
    nama,
    nomor_hp,
    no_hp,
    alamat,
    layanan,
    paket,
    berat_kg: beratKg,
    items = [],
  } = req.body;
  const noHp = nomor_hp || no_hp;

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    let pelanggan = await pelangganModel.findByPhone(noHp, connection);
    if (!pelanggan) {
      pelanggan = await pelangganModel.createPelanggan({ nama, noHp, alamat }, connection);
    }

    const transaksiId = await transaksiModel.createTransaksi(
      {
        kodeOrder: "TEMP",
        pelangganId: pelanggan.id,
        layanan,
        paket,
        beratKg: layanan === "kiloan" ? Number(beratKg) : null,
        totalHarga: 0,
        status: "belum_selesai",
        tanggalMasuk: new Date(),
        tanggalSelesai: null,
      },
      connection,
    );

    const kodeOrder = generateOrderCode(transaksiId);
    await transaksiModel.updateKodeOrder(transaksiId, kodeOrder, connection);

    let totalHarga = 0;

    if (layanan === "kiloan") {
      totalHarga = Number(beratKg) * HARGA_KILOAN;
    } else {
      for (const item of items) {
        const jenisId = item.jenis_pakaian_id || item.jenis_id;
        const jumlah = Number(item.jumlah || item.qty || 0);
        const jenis = await jenisModel.findJenisById(jenisId, connection);
        if (!jenis) {
          const error = new Error(`Jenis pakaian ID ${jenisId} tidak ditemukan.`);
          error.statusCode = 404;
          throw error;
        }

        if (jumlah <= 0) {
          const error = new Error("Jumlah item harus lebih dari 0.");
          error.statusCode = 400;
          throw error;
        }

        const harga = Number(jenis.harga);
        const subtotal = jumlah * harga;
        totalHarga += subtotal;

        await transaksiModel.insertDetail(
          {
            transaksiId,
            jenisId: jenis.id,
            jumlah,
            subtotal,
          },
          connection,
        );
      }
    }

    if (paket === "express") {
      totalHarga += TAMBAHAN_EXPRESS;
    }

    await transaksiModel.updateTransaksi(
      transaksiId,
      {
        beratKg: layanan === "kiloan" ? Number(beratKg) : null,
        totalHarga,
        status: "belum_selesai",
        tanggalSelesai: null,
      },
      connection,
    );

    await connection.commit();

    res.status(201).json({
      success: true,
      message: "Transaksi berhasil dibuat.",
      data: {
        id: transaksiId,
        kode_order: kodeOrder,
        total_harga: totalHarga,
      },
    });
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
});

const updateStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!["belum_selesai", "siap_diambil", "selesai"].includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Status tidak valid.",
    });
  }

  const transaksi = await transaksiModel.findById(req.params.id);
  if (!transaksi) {
    return res.status(404).json({
      success: false,
      message: "Transaksi tidak ditemukan.",
    });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const tanggalSelesai = status === "selesai" ? new Date() : transaksi.tanggal_selesai;

    await transaksiModel.updateStatus(req.params.id, status, tanggalSelesai, connection);

    if (status === "selesai") {
      await transaksiModel.upsertRiwayat(req.params.id, new Date(), connection);
    }

    await connection.commit();

    const updated = await transaksiModel.findById(req.params.id);
    const responseData = { ...updated };

    if (status === "siap_diambil") {
      responseData.whatsapp_link = createWhatsAppLink(
        updated.nomor_hp || updated.no_hp,
        updated.nama_pelanggan,
        updated.kode_order,
        updated.total_harga,
      );
    }

    res.status(200).json({
      success: true,
      message: "Status transaksi berhasil diperbarui.",
      data: responseData,
    });
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
});

module.exports = {
  getAllTransaksi,
  getLatestTransaksi,
  getTransaksiById,
  createTransaksi,
  updateStatus,
};
