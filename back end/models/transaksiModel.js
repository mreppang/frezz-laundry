const { pool } = require("../db");

async function createTransaksi(payload, connection = pool) {
  const [result] = await connection.execute(
    `INSERT INTO transaksi
      (kode_order, pelanggan_id, layanan, paket, berat_kg, total_harga, status, tanggal_masuk, tanggal_selesai, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      payload.kodeOrder,
      payload.pelangganId,
      payload.layanan,
      payload.paket,
      payload.beratKg,
      payload.totalHarga,
      payload.status,
      payload.tanggalMasuk,
      payload.tanggalSelesai,
      payload.createdBy,
    ],
  );
  return result.insertId;
}

async function updateKodeOrder(id, kodeOrder, connection = pool) {
  await connection.execute("UPDATE transaksi SET kode_order = ? WHERE id = ?", [kodeOrder, id]);
}

async function updateTransaksi(id, payload, connection = pool) {
  await connection.execute(
    `UPDATE transaksi
     SET berat_kg = ?, total_harga = ?, status = ?, tanggal_selesai = ?
     WHERE id = ?`,
    [payload.beratKg, payload.totalHarga, payload.status, payload.tanggalSelesai, id],
  );
}

async function insertDetail(payload, connection = pool) {
  const [result] = await connection.execute(
    `INSERT INTO transaksi_detail (transaksi_id, jenis_id, qty, harga, subtotal)
     VALUES (?, ?, ?, ?, ?)`,
    [payload.transaksiId, payload.jenisId, payload.qty, payload.harga, payload.subtotal],
  );
  return result.insertId;
}

async function findById(id, connection = pool) {
  const [rows] = await connection.execute(
    `SELECT
        t.id,
        t.kode_order,
        t.pelanggan_id,
        t.layanan,
        t.paket,
        t.berat_kg,
        t.total_harga,
        t.status,
        t.tanggal_masuk,
        t.tanggal_selesai,
        t.created_by,
        t.created_at,
        p.nama AS nama_pelanggan,
        p.no_hp,
        u.username AS created_by_username
      FROM transaksi t
      INNER JOIN pelanggan p ON p.id = t.pelanggan_id
      LEFT JOIN users u ON u.id = t.created_by
      WHERE t.id = ?
      LIMIT 1`,
    [id],
  );
  return rows[0] || null;
}

async function getDetailsByTransaksiId(transaksiId) {
  const [rows] = await pool.execute(
    `SELECT
        td.id,
        td.transaksi_id,
        td.jenis_id,
        td.qty,
        td.harga,
        td.subtotal,
        jp.nama_jenis
      FROM transaksi_detail td
      INNER JOIN jenis_pakaian jp ON jp.id = td.jenis_id
      WHERE td.transaksi_id = ?
      ORDER BY td.id ASC`,
    [transaksiId],
  );
  return rows;
}

async function getAllActive() {
  const [rows] = await pool.execute(
    `SELECT
        t.id,
        t.kode_order,
        p.nama AS nama_pelanggan,
        p.no_hp,
        t.layanan,
        t.paket,
        t.total_harga,
        t.status,
        t.tanggal_masuk,
        t.created_at
      FROM transaksi t
      INNER JOIN pelanggan p ON p.id = t.pelanggan_id
      WHERE t.status <> 'selesai'
      ORDER BY t.created_at DESC, t.id DESC`,
  );
  return rows;
}

async function getLatest(limit = 5) {
  const [rows] = await pool.execute(
    `SELECT
        t.id,
        t.kode_order,
        p.nama AS nama_pelanggan,
        t.layanan,
        t.total_harga,
        t.status,
        t.created_at
      FROM transaksi t
      INNER JOIN pelanggan p ON p.id = t.pelanggan_id
      ORDER BY t.created_at DESC, t.id DESC
      LIMIT ?`,
    [Number(limit)],
  );
  return rows;
}

async function updateStatus(id, status, tanggalSelesai = null, connection = pool) {
  await connection.execute(
    "UPDATE transaksi SET status = ?, tanggal_selesai = ? WHERE id = ?",
    [status, tanggalSelesai, id],
  );
}

async function upsertRiwayat(transaksiId, selesaiAt, connection = pool) {
  const [rows] = await connection.execute(
    "SELECT id FROM riwayat WHERE transaksi_id = ? LIMIT 1",
    [transaksiId],
  );

  if (rows[0]) {
    await connection.execute("UPDATE riwayat SET selesai_at = ? WHERE transaksi_id = ?", [
      selesaiAt,
      transaksiId,
    ]);
    return rows[0].id;
  }

  const [result] = await connection.execute(
    "INSERT INTO riwayat (transaksi_id, selesai_at) VALUES (?, ?)",
    [transaksiId, selesaiAt],
  );
  return result.insertId;
}

async function getRiwayat(filters = {}) {
  const conditions = ["t.status = 'selesai'"];
  const values = [];

  if (filters.nama) {
    conditions.push("p.nama LIKE ?");
    values.push(`%${filters.nama}%`);
  }

  if (filters.kode) {
    conditions.push("t.kode_order LIKE ?");
    values.push(`%${filters.kode}%`);
  }

  if (filters.tanggal) {
    conditions.push("DATE(r.selesai_at) = ?");
    values.push(filters.tanggal);
  }

  const [rows] = await pool.execute(
    `SELECT
        r.id,
        r.selesai_at,
        t.id AS transaksi_id,
        t.kode_order,
        t.layanan,
        t.paket,
        t.total_harga,
        t.tanggal_masuk,
        t.tanggal_selesai,
        p.nama AS nama_pelanggan,
        p.no_hp
      FROM riwayat r
      INNER JOIN transaksi t ON t.id = r.transaksi_id
      INNER JOIN pelanggan p ON p.id = t.pelanggan_id
      WHERE ${conditions.join(" AND ")}
      ORDER BY r.selesai_at DESC, r.id DESC`,
    values,
  );
  return rows;
}

async function getDashboardStats() {
  const [rows] = await pool.execute(
    `SELECT
        COALESCE(SUM(CASE WHEN DATE(tanggal_masuk) = CURDATE() THEN total_harga ELSE 0 END), 0) AS pendapatan_hari_ini,
        COALESCE(SUM(CASE WHEN YEAR(tanggal_masuk) = YEAR(CURDATE()) AND MONTH(tanggal_masuk) = MONTH(CURDATE()) THEN total_harga ELSE 0 END), 0) AS pendapatan_bulan_ini,
        COALESCE(SUM(total_harga), 0) AS total_pendapatan,
        SUM(CASE WHEN status = 'belum_selesai' THEN 1 ELSE 0 END) AS cucian_aktif,
        SUM(CASE WHEN status = 'siap_diambil' THEN 1 ELSE 0 END) AS siap_diambil,
        SUM(CASE WHEN status = 'selesai' THEN 1 ELSE 0 END) AS selesai
      FROM transaksi`,
  );
  return rows[0];
}

async function getDashboardStatsForKasir(userId) {
  const [rows] = await pool.execute(
    `SELECT
        COALESCE(SUM(CASE WHEN DATE(tanggal_masuk) = CURDATE() AND created_by = ? THEN total_harga ELSE 0 END), 0) AS pendapatan_hari_ini,
        SUM(CASE WHEN status = 'belum_selesai' THEN 1 ELSE 0 END) AS cucian_aktif,
        SUM(CASE WHEN status = 'siap_diambil' THEN 1 ELSE 0 END) AS siap_diambil,
        SUM(CASE WHEN status = 'selesai' THEN 1 ELSE 0 END) AS selesai
      FROM transaksi`,
    [userId],
  );
  return rows[0];
}

module.exports = {
  createTransaksi,
  updateKodeOrder,
  updateTransaksi,
  insertDetail,
  findById,
  getDetailsByTransaksiId,
  getAllActive,
  getLatest,
  updateStatus,
  upsertRiwayat,
  getRiwayat,
  getDashboardStats,
  getDashboardStatsForKasir,
};
