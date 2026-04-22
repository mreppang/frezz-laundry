const transaksiModel = require("../models/transaksiModel");
const asyncHandler = require("../utils/asyncHandler");

const getStats = asyncHandler(async (req, res) => {
  const stats =
    req.user.role === "owner"
      ? await transaksiModel.getDashboardStats()
      : await transaksiModel.getDashboardStatsForKasir(req.user.id);

  return res.status(200).json({
    success: true,
    message: "Statistik dashboard berhasil diambil.",
    data: stats,
  });
});

module.exports = {
  getStats,
};
