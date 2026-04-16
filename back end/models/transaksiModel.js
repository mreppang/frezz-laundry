const { pool } = require("../db");

async function createTransaksi(data, connection = pool) {
  const [result] = await connection.execute(
    `INSERT INTO transaksi
      (pelanggan_id, kode_order, layanan, paket, tanggal_masuk, tanggal_selesai, berat_kg, total_harga, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.pelangganId,
      data.kodeOrder,
      data.layanan,
      data.paket,
      data.tanggalMasuk,
      data.tanggalSelesai,
      data.beratKg,
      data.totalHarga,
      data.status,
    ],
  );

  return result.insertId;
}

async function updateKodeOrder(id, kodeOrder, connection = pool) {
  await connection.execute("UPDATE transaksi SET kode_order = ? WHERE id = ?", [kodeOrder, id]);
}

async function updateTransaksiTotals(id, values, connection = pool) {
  await connection.execute(
    "UPDATE transaksi SET total_harga = ?, berat_kg = ?, tanggal_selesai = ?, status = ? WHERE id = ?",
    [values.totalHarga, values.beratKg, values.tanggalSelesai, values.status, id],
  );
}

async function createDetail({ transaksiId, jenisPakaianId, jumlah, subtotal }, connection = pool) {
  const [result] = await connection.execute(
    `INSERT INTO transaksi_detail (transaksi_id, jenis_pakaian_id, jumlah, subtotal)
     VALUES (?, ?, ?, ?)`,
    [transaksiId, jenisPakaianId, jumlah, subtotal],
  );
  return result.insertId;
}

async function getDetailSummary(transaksiId, connection = pool) {
  const [rows] = await connection.execute(
    "SELECT COALESCE(SUM(subtotal), 0) AS total_detail FROM transaksi_detail WHERE transaksi_id = ?",
    [transaksiId],
  );
  return Number(rows[0]?.total_detail || 0);
}

async function findTransaksiById(id, connection = pool) {
  const [rows] = await connection.execute(
    `SELECT
        t.id,
        t.kode_order,
        t.pelanggan_id,
        t.layanan,
        t.paket,
        t.tanggal_masuk,
        t.tanggal_selesai,
        t.berat_kg,
        t.total_harga,
        t.status,
        t.created_at,
        p.nama AS nama_pelanggan,
        p.nomor_hp,
        p.alamat
      FROM transaksi t
      INNER JOIN pelanggan p ON p.id = t.pelanggan_id
      WHERE t.id = ?
      LIMIT 1`,
    [id],
  );
  return rows[0] || null;
}

async function getActiveTransactions() {
  const [rows] = await pool.execute(
    `SELECT
        t.id,
        t.kode_order,
        t.layanan,
        t.paket,
        t.tanggal_masuk,
        t.tanggal_selesai,
        t.berat_kg,
        t.total_harga,
        t.status,
        t.created_at,
        p.id AS pelanggan_id,
        p.nama AS nama_pelanggan,
        p.nomor_hp,
        p.alamat
      FROM transaksi t
      INNER JOIN pelanggan p ON p.id = t.pelanggan_id
      WHERE t.status <> 'selesai'
      ORDER BY t.created_at DESC`,
  );
  return rows;
}

async function getRiwayatTransactions() {
  const [rows] = await pool.execute(
    `SELECT
        t.id,
        t.kode_order,
        t.layanan,
        t.paket,
        t.tanggal_masuk,
        t.tanggal_selesai,
        t.berat_kg,
        t.total_harga,
        t.status,
        t.created_at,
        p.id AS pelanggan_id,
        p.nama AS nama_pelanggan,
        p.nomor_hp,
        p.alamat
      FROM transaksi t
      INNER JOIN pelanggan p ON p.id = t.pelanggan_id
      WHERE t.status = 'selesai'
      ORDER BY COALESCE(t.tanggal_selesai, t.created_at) DESC`,
  );
  return rows;
}

async function updateStatus(id, status, tanggalSelesai = null, connection = pool) {
  await connection.execute(
    "UPDATE transaksi SET status = ?, tanggal_selesai = ? WHERE id = ?",
    [status, tanggalSelesai, id],
  );
}

module.exports = {
  createTransaksi,
  updateKodeOrder,
  updateTransaksiTotals,
  createDetail,
  getDetailSummary,
  findTransaksiById,
  getActiveTransactions,
  getRiwayatTransactions,
  updateStatus,
};
