const mysql = require("mysql2/promise");
const env = require("./env");

const pool = mysql.createPool({
  host: env.dbHost,
  port: env.dbPort,
  user: env.dbUser,
  password: env.dbPassword,
  database: env.dbName,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function testConnection() {
  const connection = await pool.getConnection();
  try {
    await connection.ping();
    console.log("Database connection successful");
  } catch (error) {
    console.error("Database connection failed:", error.message);
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = {
  pool,
  testConnection,
};
