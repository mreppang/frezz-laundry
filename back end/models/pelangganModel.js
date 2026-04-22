const { pool } = require("../db");

async function findByPhone(noHp, connection = pool) {
  const [rows] = await connection.execute(
    `SELECT
        id,
        nama,
        nomor_hp,
        nomor_hp AS no_hp,
        alamat,
        created_at
      FROM pelanggan
      WHERE nomor_hp = ?
      LIMIT 1`,
    [noHp],
  );
  return rows[0] || null;
}

async function createPelanggan({ nama, noHp, alamat = "" }, connection = pool) {
  const [result] = await connection.execute(
    "INSERT INTO pelanggan (nama, nomor_hp, alamat) VALUES (?, ?, ?)",
    [nama, noHp, alamat],
  );

  const [rows] = await connection.execute(
    `SELECT
        id,
        nama,
        nomor_hp,
        nomor_hp AS no_hp,
        alamat,
        created_at
      FROM pelanggan
      WHERE id = ?
      LIMIT 1`,
    [result.insertId],
  );
  return rows[0] || null;
}

module.exports = {
  findByPhone,
  createPelanggan,
};
