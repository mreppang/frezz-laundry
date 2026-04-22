const { pool } = require("../db");

async function findByPhone(noHp, connection = pool) {
  const [rows] = await connection.execute(
    "SELECT id, nama, no_hp, created_at FROM pelanggan WHERE no_hp = ? LIMIT 1",
    [noHp],
  );
  return rows[0] || null;
}

async function createPelanggan({ nama, noHp }, connection = pool) {
  const [result] = await connection.execute(
    "INSERT INTO pelanggan (nama, no_hp) VALUES (?, ?)",
    [nama, noHp],
  );

  const [rows] = await connection.execute(
    "SELECT id, nama, no_hp, created_at FROM pelanggan WHERE id = ? LIMIT 1",
    [result.insertId],
  );
  return rows[0] || null;
}

module.exports = {
  findByPhone,
  createPelanggan,
};
