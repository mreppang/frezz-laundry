const dashboardService = require("../services/dashboardService");
const asyncHandler = require("../utils/asyncHandler");

const getStats = asyncHandler(async (req, res) => {
  const stats = await dashboardService.getStats(req.user.role);
  res.status(200).json({
    success: true,
    message: "Statistik dashboard berhasil diambil.",
    data: stats,
  });
});

module.exports = { getStats };
