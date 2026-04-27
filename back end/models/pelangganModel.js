const { pool } = require("../db");

const findByPhone = async (nomor_hp, connection = pool) => {
  const [rows] = await connection.execute(
    "SELECT id, nama, nomor_hp, alamat, created_at FROM pelanggan WHERE nomor_hp = ? LIMIT 1",
    [nomor_hp]
  );
  return rows[0] || null;
};

const createPelanggan = async ({ nama, noHp, alamat = "" }, connection = pool) => {
  const [result] = await connection.execute(
    "INSERT INTO pelanggan (nama, nomor_hp, alamat) VALUES (?, ?, ?)",
    [nama, noHp, alamat]
  );
  const [rows] = await connection.execute(
    "SELECT id, nama, nomor_hp, alamat, created_at FROM pelanggan WHERE id = ? LIMIT 1",
    [result.insertId]
  );
  return rows[0] || null;
};

module.exports = {
  findByPhone,
  createPelanggan,
};
