const { pool } = require("../db");

async function getAllJenis() {
  const [rows] = await pool.execute(
    "SELECT id, nama, harga FROM jenis_pakaian ORDER BY nama ASC",
  );
  return rows;
}

async function findJenisById(id, connection = pool) {
  const [rows] = await connection.execute(
    "SELECT id, nama, harga FROM jenis_pakaian WHERE id = ? LIMIT 1",
    [id],
  );
  return rows[0] || null;
}

async function createJenis({ nama, harga }) {
  const [result] = await pool.execute(
    "INSERT INTO jenis_pakaian (nama, harga) VALUES (?, ?)",
    [nama, harga],
  );
  return findJenisById(result.insertId);
}

async function updateJenis(id, { nama, harga }) {
  await pool.execute(
    "UPDATE jenis_pakaian SET nama = ?, harga = ? WHERE id = ?",
    [nama, harga, id],
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
