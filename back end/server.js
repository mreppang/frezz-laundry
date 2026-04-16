const express = require("express");
const cors = require("cors");
const env = require("./config/env");
const { testConnection } = require("./db");
const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");
const authRoutes = require("./routes/authRoutes");
const jenisRoutes = require("./routes/jenisRoutes");
const transaksiRoutes = require("./routes/transaksiRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();

app.use(
  cors({
    origin: env.corsOrigin === "*" ? true : env.corsOrigin,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Laundry Management API is running.",
  });
});

app.use(authRoutes);
app.use(userRoutes);
app.use(jenisRoutes);
app.use(transaksiRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

async function startServer() {
  try {
    await testConnection();
    app.listen(env.appPort, () => {
      console.log(`Server berjalan di http://localhost:${env.appPort}`);
    });
  } catch (error) {
    console.error("Gagal menjalankan server:", error.message);
    process.exit(1);
  }
}

startServer();
