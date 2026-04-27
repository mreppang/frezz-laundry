const jenisModel = require("../models/jenisPakaianModel");

class JenisService {
  async getAllJenis() {
    return await jenisModel.getAll();
  }

  async getJenisById(id) {
    const jenis = await jenisModel.getById(id);
    if (!jenis) throw new Error("Jenis pakaian tidak ditemukan.");
    return jenis;
  }

  async createJenis(data) {
    // frontend sends nama_jenis; real column is nama
    const nama  = data.nama || data.nama_jenis;
    const harga = data.harga;

    if (!nama)                                    throw new Error("Nama jenis wajib diisi.");
    if (harga === undefined || harga === null || harga === "") throw new Error("Harga wajib diisi.");
    if (isNaN(harga) || Number(harga) < 0)        throw new Error("Harga harus berupa angka positif.");

    return await jenisModel.create({ nama, harga: Number(harga) });
  }

  async updateJenis(id, data) {
    const existing = await jenisModel.getById(id);
    if (!existing) throw new Error("Jenis pakaian tidak ditemukan.");

    const nama  = data.nama || data.nama_jenis || existing.nama;
    const harga = data.harga !== undefined ? Number(data.harga) : existing.harga;

    if (isNaN(harga) || harga < 0) throw new Error("Harga harus berupa angka positif.");

    return await jenisModel.update(id, { nama, harga });
  }

  async deleteJenis(id) {
    const existing = await jenisModel.getById(id);
    if (!existing) throw new Error("Jenis pakaian tidak ditemukan.");
    return await jenisModel.remove(id);
  }
}

module.exports = new JenisService();
