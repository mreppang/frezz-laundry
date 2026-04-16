const jenisModel = require("../models/jenisPakaianModel");
const { sendError, sendSuccess } = require("../utils/response");

async function getAllJenis(req, res, next) {
  try {
    const items = await jenisModel.getAllJenis();
    return sendSuccess(res, 200, "Daftar jenis pakaian berhasil diambil.", items);
  } catch (error) {
    return next(error);
  }
}

async function createJenis(req, res, next) {
  try {
    const { nama, harga } = req.body;

    if (!nama || harga === undefined) {
      return sendError(res, 400, "Nama dan harga wajib diisi.");
    }

    const parsedHarga = Number(harga);
    if (Number.isNaN(parsedHarga) || parsedHarga < 0) {
      return sendError(res, 400, "Harga harus berupa angka positif.");
    }

    const createdItem = await jenisModel.createJenis({
      nama,
      harga: parsedHarga,
    });

    return sendSuccess(res, 201, "Jenis pakaian berhasil ditambahkan.", createdItem);
  } catch (error) {
    return next(error);
  }
}

async function updateJenis(req, res, next) {
  try {
    const { id } = req.params;
    const { nama, harga } = req.body;

    if (!nama || harga === undefined) {
      return sendError(res, 400, "Nama dan harga wajib diisi.");
    }

    const existingItem = await jenisModel.findJenisById(id);
    if (!existingItem) {
      return sendError(res, 404, "Jenis pakaian tidak ditemukan.");
    }

    const parsedHarga = Number(harga);
    if (Number.isNaN(parsedHarga) || parsedHarga < 0) {
      return sendError(res, 400, "Harga harus berupa angka positif.");
    }

    const updatedItem = await jenisModel.updateJenis(id, {
      nama,
      harga: parsedHarga,
    });

    return sendSuccess(res, 200, "Jenis pakaian berhasil diperbarui.", updatedItem);
  } catch (error) {
    return next(error);
  }
}

async function deleteJenis(req, res, next) {
  try {
    const { id } = req.params;

    const existingItem = await jenisModel.findJenisById(id);
    if (!existingItem) {
      return sendError(res, 404, "Jenis pakaian tidak ditemukan.");
    }

    await jenisModel.deleteJenis(id);
    return sendSuccess(res, 200, "Jenis pakaian berhasil dihapus.");
  } catch (error) {
    if (error.code === "ER_ROW_IS_REFERENCED_2") {
      return sendError(res, 409, "Jenis pakaian tidak bisa dihapus karena masih dipakai transaksi.");
    }

    return next(error);
  }
}

module.exports = {
  getAllJenis,
  createJenis,
  updateJenis,
  deleteJenis,
};
