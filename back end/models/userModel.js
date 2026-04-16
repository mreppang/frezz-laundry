const { pool } = require("../db");

async function findByUsername(username) {
  const [rows] = await pool.execute(
    "SELECT id, username, password, role FROM users WHERE username = ? LIMIT 1",
    [username],
  );
  return rows[0] || null;
}

async function findById(id) {
  const [rows] = await pool.execute(
    "SELECT id, username, role FROM users WHERE id = ? LIMIT 1",
    [id],
  );
  return rows[0] || null;
}

async function createUser({ username, password, role }) {
  const [result] = await pool.execute(
    "INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
    [username, password, role],
  );

  return findById(result.insertId);
}

module.exports = {
  findByUsername,
  findById,
  createUser,
};
