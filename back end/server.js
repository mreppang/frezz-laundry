const express = require("express");
const cors = require("cors");
const env = require("./config/env");
const { testConnection } = require("./db");
const { errorHandler, notFound } = require("./middleware/errorHandler");
const authRoutes = require("./routes/authRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const jenisRoutes = require("./routes/jenisRoutes");
const riwayatRoutes = require("./routes/riwayatRoutes");
const transaksiRoutes = require("./routes/transaksiRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();

// Middleware
app.use(
  cors({
    origin: env.corsOrigin === "*" ? true : env.corsOrigin,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "FREZZ LAUNDRY WEB APP API berjalan.",
    version: "2.0.0",
    architecture: "MVC with Service Layer",
  });
});

// API Routes
app.use("/api", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/jenis", jenisRoutes);
app.use("/api/users", userRoutes);
app.use("/api/transaksi", transaksiRoutes);
app.use("/api/riwayat", riwayatRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server
async function startServer() {
  try {
    await testConnection();
    app.listen(env.appPort, () => {
      console.log(`🚀 Server berjalan di http://localhost:${env.appPort}`);
      console.log(`📊 Database: ${env.dbName}`);
      console.log(`🏗 Architecture: MVC with Service Layer`);
    });
  } catch (error) {
    console.error("❌ Gagal menjalankan server:", error.message);
    process.exit(1);
  }
}

startServer();
