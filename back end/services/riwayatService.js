const transaksiModel = require("../models/transaksiModel");

class RiwayatService {
  async getAllRiwayat(search = "", page = 1, limit = 10) {
    // Delegate to transaksiModel which has the correct JOIN query
    const filters = {};

    if (search) {
      // Try to detect if it looks like a kode_order (starts with letters) or a name
      filters.nama = search;
      filters.kode = search;
    }

    const rows = await transaksiModel.getRiwayat(filters);

    // Apply pagination in-memory (simple approach, data set is small)
    const total      = rows.length;
    const totalPages = Math.ceil(total / limit);
    const offset     = (page - 1) * limit;
    const data       = rows.slice(offset, offset + limit);

    return {
      data,
      pagination: { page, limit, total, totalPages },
    };
  }

  async getRiwayatById(id) {
    const transaksi = await transaksiModel.findById(id);
    if (!transaksi || transaksi.status !== "selesai") {
      throw new Error("Riwayat transaksi tidak ditemukan.");
    }

    const details = await transaksiModel.getDetailsByTransaksiId(id);
    return { ...transaksi, details };
  }
}

module.exports = new RiwayatService();
