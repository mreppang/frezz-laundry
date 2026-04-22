const { pool } = require("../db");

async function findByUsername(username) {
  const [rows] = await pool.execute(
    "SELECT id, username, password, role, created_at FROM users WHERE username = ? LIMIT 1",
    [username],
  );
  return rows[0] || null;
}

async function findById(id) {
  const [rows] = await pool.execute(
    "SELECT id, username, role, created_at FROM users WHERE id = ? LIMIT 1",
    [id],
  );
  return rows[0] || null;
}

async function getAllUsers() {
  const [rows] = await pool.execute(
    "SELECT id, username, role, created_at FROM users ORDER BY created_at DESC, id DESC",
  );
  return rows;
}

async function createUser({ username, password, role }) {
  const [result] = await pool.execute(
    "INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
    [username, password, role],
  );
  return findById(result.insertId);
}

async function updateUser(id, { username, password, role }) {
  if (password) {
    await pool.execute(
      "UPDATE users SET username = ?, password = ?, role = ? WHERE id = ?",
      [username, password, role, id],
    );
  } else {
    await pool.execute("UPDATE users SET username = ?, role = ? WHERE id = ?", [username, role, id]);
  }

  return findById(id);
}

async function deleteUser(id) {
  const [result] = await pool.execute("DELETE FROM users WHERE id = ?", [id]);
  return result.affectedRows > 0;
}

module.exports = {
  findByUsername,
  findById,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
};
