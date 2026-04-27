const { pool } = require("../db");
const bcrypt = require("bcrypt");

const findByUsername = async (username) => {
  const [rows] = await pool.execute(
    "SELECT id, username, password, role, created_at FROM users WHERE username = ? LIMIT 1",
    [username]
  );
  return rows[0] || null;
};

const findById = async (id) => {
  const [rows] = await pool.execute(
    "SELECT id, username, role, created_at FROM users WHERE id = ? LIMIT 1",
    [id]
  );
  return rows[0] || null;
};

const getAll = async () => {
  const [rows] = await pool.execute(
    "SELECT id, username, role, created_at FROM users ORDER BY created_at DESC, id DESC"
  );
  return rows;
};

const create = async ({ username, password, role }) => {
  const hashed = await bcrypt.hash(password, 10);
  const [result] = await pool.execute(
    "INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
    [username, hashed, role]
  );
  return findById(result.insertId);
};

const update = async (id, { username, password, role }) => {
  if (password) {
    const hashed = await bcrypt.hash(password, 10);
    await pool.execute(
      "UPDATE users SET username = ?, password = ?, role = ? WHERE id = ?",
      [username, hashed, role, id]
    );
  } else {
    await pool.execute(
      "UPDATE users SET username = ?, role = ? WHERE id = ?",
      [username, role, id]
    );
  }
  return findById(id);
};

const remove = async (id) => {
  const [result] = await pool.execute(
    "DELETE FROM users WHERE id = ?",
    [id]
  );
  return result.affectedRows > 0;
};

module.exports = {
  findByUsername,
  findById,
  getAll,
  create,
  update,
  remove,
};
