const { pool } = require("../db");

const createTransaksi = async (payload, connection = pool) => {
  const [result] = await connection.execute(
    `INSERT INTO transaksi
       (kode_order, pelanggan_id, layanan, paket, berat_kg, total_harga, status, tanggal_masuk, tanggal_selesai)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
    ]
  );
  return result.insertId;
};

const updateKodeOrder = async (id, kodeOrder, connection = pool) => {
  await connection.execute(
    "UPDATE transaksi SET kode_order = ? WHERE id = ?",
    [kodeOrder, id]
  );
};

const updateTransaksi = async (id, payload, connection = pool) => {
  await connection.execute(
    `UPDATE transaksi
     SET berat_kg = ?, total_harga = ?, status = ?, tanggal_selesai = ?
     WHERE id = ?`,
    [payload.beratKg, payload.totalHarga, payload.status, payload.tanggalSelesai, id]
  );
};

const insertDetail = async (payload, connection = pool) => {
  const [result] = await connection.execute(
    `INSERT INTO transaksi_detail (transaksi_id, jenis_pakaian_id, jumlah, subtotal)
     VALUES (?, ?, ?, ?)`,
    [payload.transaksiId, payload.jenisId, payload.jumlah, payload.subtotal]
  );
  return result.insertId;
};

const findById = async (id, connection = pool) => {
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
       t.created_at,
       p.nama        AS nama_pelanggan,
       p.nomor_hp,
       p.alamat
     FROM transaksi t
     INNER JOIN pelanggan p ON p.id = t.pelanggan_id
     WHERE t.id = ?
     LIMIT 1`,
    [id]
  );
  return rows[0] || null;
};

const getDetailsByTransaksiId = async (transaksiId) => {
  const [rows] = await pool.execute(
    `SELECT
       td.id,
       td.transaksi_id,
       td.jenis_pakaian_id,
       td.jumlah,
       td.subtotal,
       jp.nama,
       jp.harga
     FROM transaksi_detail td
     INNER JOIN jenis_pakaian jp ON jp.id = td.jenis_pakaian_id
     WHERE td.transaksi_id = ?
     ORDER BY td.id ASC`,
    [transaksiId]
  );
  return rows;
};

const getAllActive = async () => {
  const [rows] = await pool.execute(
    `SELECT
       t.id,
       t.kode_order,
       t.layanan,
       t.paket,
       t.total_harga,
       t.status,
       t.tanggal_masuk,
       t.created_at,
       p.nama     AS nama_pelanggan,
       p.nomor_hp
     FROM transaksi t
     INNER JOIN pelanggan p ON p.id = t.pelanggan_id
     WHERE t.status <> 'selesai'
     ORDER BY t.created_at DESC, t.id DESC`
  );
  return rows;
};

const getLatest = async (limit = 5) => {
  const n = parseInt(limit, 10) || 5;
  const [rows] = await pool.execute(
    `SELECT
       t.id,
       t.kode_order,
       t.layanan,
       t.total_harga,
       t.status,
       t.created_at,
       p.nama     AS nama_pelanggan,
       p.nomor_hp
     FROM transaksi t
     INNER JOIN pelanggan p ON p.id = t.pelanggan_id
     ORDER BY t.created_at DESC, t.id DESC
     LIMIT ${n}`
  );
  return rows;
};

const updateStatus = async (id, status, tanggalSelesai = null, connection = pool) => {
  await connection.execute(
    "UPDATE transaksi SET status = ?, tanggal_selesai = ? WHERE id = ?",
    [status, tanggalSelesai, id]
  );
};

const upsertRiwayat = async (transaksiId, selesaiAt, connection = pool) => {
  const [rows] = await connection.execute(
    "SELECT id FROM riwayat WHERE transaksi_id = ? LIMIT 1",
    [transaksiId]
  );
  if (rows[0]) {
    await connection.execute(
      "UPDATE riwayat SET selesai_at = ? WHERE transaksi_id = ?",
      [selesaiAt, transaksiId]
    );
    return rows[0].id;
  }
  const [result] = await connection.execute(
    "INSERT INTO riwayat (transaksi_id, selesai_at) VALUES (?, ?)",
    [transaksiId, selesaiAt]
  );
  return result.insertId;
};

const getRiwayat = async (filters = {}) => {
  const conditions = [];
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

  const where = conditions.length
    ? "WHERE " + conditions.join(" AND ")
    : "";

  const [rows] = await pool.execute(
    `SELECT
       r.id,
       r.selesai_at,
       t.id          AS transaksi_id,
       t.kode_order,
       t.layanan,
       t.paket,
       t.total_harga,
       t.tanggal_masuk,
       t.tanggal_selesai,
       p.nama        AS nama_pelanggan,
       p.nomor_hp,
       p.alamat
     FROM riwayat r
     INNER JOIN transaksi t ON t.id = r.transaksi_id
     INNER JOIN pelanggan p ON p.id = t.pelanggan_id
     ${where}
     ORDER BY r.selesai_at DESC, r.id DESC`,
    values
  );
  return rows;
};

const getDashboardStats = async () => {
  const [rows] = await pool.execute(
    `SELECT
       COALESCE(SUM(CASE WHEN DATE(tanggal_masuk) = CURDATE() THEN total_harga ELSE 0 END), 0)                                                          AS pendapatan_hari_ini,
       COALESCE(SUM(CASE WHEN YEAR(tanggal_masuk) = YEAR(CURDATE()) AND MONTH(tanggal_masuk) = MONTH(CURDATE()) THEN total_harga ELSE 0 END), 0)         AS pendapatan_bulan_ini,
       COALESCE(SUM(total_harga), 0)                                                                                                                     AS total_pendapatan,
       SUM(CASE WHEN status = 'belum_selesai' THEN 1 ELSE 0 END)  AS cucian_aktif,
       SUM(CASE WHEN status = 'siap_diambil'  THEN 1 ELSE 0 END)  AS siap_diambil,
       SUM(CASE WHEN status = 'selesai'       THEN 1 ELSE 0 END)  AS selesai
     FROM transaksi`
  );
  return rows[0];
};

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
};
