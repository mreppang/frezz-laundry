const { pool } = require("../db");

const getAll = async () => {
  const [rows] = await pool.execute(
    "SELECT id, nama, harga FROM jenis_pakaian ORDER BY id DESC"
  );
  return rows;
};

const getById = async (id, connection = pool) => {
  const [rows] = await connection.execute(
    "SELECT id, nama, harga FROM jenis_pakaian WHERE id = ? LIMIT 1",
    [id]
  );
  return rows[0] || null;
};

const create = async ({ nama, harga }) => {
  const [result] = await pool.execute(
    "INSERT INTO jenis_pakaian (nama, harga) VALUES (?, ?)",
    [nama, Number(harga)]
  );
  return getById(result.insertId);
};

const update = async (id, { nama, harga }) => {
  await pool.execute(
    "UPDATE jenis_pakaian SET nama = ?, harga = ? WHERE id = ?",
    [nama, Number(harga), id]
  );
  return getById(id);
};

const remove = async (id) => {
  const [result] = await pool.execute(
    "DELETE FROM jenis_pakaian WHERE id = ?",
    [id]
  );
  return result.affectedRows > 0;
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
  // aliases used by transaksiService
  findJenisById: getById,
};
