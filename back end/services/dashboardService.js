const transaksiModel = require("../models/transaksiModel");

class DashboardService {
  async getStats(role) {
    return await transaksiModel.getDashboardStats();
  }
}

module.exports = new DashboardService();
