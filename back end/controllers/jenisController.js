const jenisModel = require("../models/jenisPakaianModel");
const asyncHandler = require("../utils/asyncHandler");

const getAllJenis = asyncHandler(async (req, res) => {
  const items = await jenisModel.getAllJenis();
  res.status(200).json({
    success: true,
    message: "Data jenis pakaian berhasil diambil.",
    data: items,
  });
});

const createJenis = asyncHandler(async (req, res) => {
  const { nama_jenis: namaJenis, harga } = req.body;

  if (!namaJenis || harga === undefined) {
    return res.status(400).json({
      success: false,
      message: "Nama jenis dan harga wajib diisi.",
    });
  }

  const item = await jenisModel.createJenis({
    namaJenis,
    harga: Number(harga),
  });

  res.status(201).json({
    success: true,
    message: "Jenis pakaian berhasil ditambahkan.",
    data: item,
  });
});

const updateJenis = asyncHandler(async (req, res) => {
  const existing = await jenisModel.findJenisById(req.params.id);
  if (!existing) {
    return res.status(404).json({
      success: false,
      message: "Jenis pakaian tidak ditemukan.",
    });
  }

  const { nama_jenis: namaJenis, harga } = req.body;
  const item = await jenisModel.updateJenis(req.params.id, {
    namaJenis,
    harga: Number(harga),
  });

  res.status(200).json({
    success: true,
    message: "Jenis pakaian berhasil diperbarui.",
    data: item,
  });
});

const deleteJenis = asyncHandler(async (req, res) => {
  const existing = await jenisModel.findJenisById(req.params.id);
  if (!existing) {
    return res.status(404).json({
      success: false,
      message: "Jenis pakaian tidak ditemukan.",
    });
  }

  await jenisModel.deleteJenis(req.params.id);
  res.status(200).json({
    success: true,
    message: "Jenis pakaian berhasil dihapus.",
  });
});

module.exports = {
  getAllJenis,
  createJenis,
  updateJenis,
  deleteJenis,
};
