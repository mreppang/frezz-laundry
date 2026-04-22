const { pool } = require("../db");

async function getAllJenis() {
  const [rows] = await pool.execute(
    "SELECT id, nama_jenis, harga FROM jenis_pakaian ORDER BY nama_jenis ASC",
  );
  return rows;
}

async function findJenisById(id, connection = pool) {
  const [rows] = await connection.execute(
    "SELECT id, nama_jenis, harga FROM jenis_pakaian WHERE id = ? LIMIT 1",
    [id],
  );
  return rows[0] || null;
}

async function createJenis({ namaJenis, harga }) {
  const [result] = await pool.execute(
    "INSERT INTO jenis_pakaian (nama_jenis, harga) VALUES (?, ?)",
    [namaJenis, harga],
  );
  return findJenisById(result.insertId);
}

async function updateJenis(id, { namaJenis, harga }) {
  await pool.execute(
    "UPDATE jenis_pakaian SET nama_jenis = ?, harga = ? WHERE id = ?",
    [namaJenis, harga, id],
  );
  return findJenisById(id);
}

async function deleteJenis(id) {
  const [result] = await pool.execute("DELETE FROM jenis_pakaian WHERE id = ?", [id]);
  return result.affectedRows > 0;
}

module.exports = {
  getAllJenis,
  findJenisById,
  createJenis,
  updateJenis,
  deleteJenis,
};
