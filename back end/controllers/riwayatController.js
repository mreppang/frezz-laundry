const transaksiModel = require("../models/transaksiModel");
const asyncHandler = require("../utils/asyncHandler");

const getRiwayat = asyncHandler(async (req, res) => {
  const rows = await transaksiModel.getRiwayat({
    nama:    req.query.nama    || "",
    kode:    req.query.kode    || "",
    tanggal: req.query.tanggal || "",
  });
  res.status(200).json({
    success: true,
    message: "Data riwayat berhasil diambil.",
    data: rows,
  });
});

module.exports = { getRiwayat };
