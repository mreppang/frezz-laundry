const transaksiService = require("../services/transaksiService");
const asyncHandler = require("../utils/asyncHandler");

const getAllTransaksi = asyncHandler(async (req, res) => {
  try {
    const transaksi = await transaksiService.getAllTransaksi();
    
    res.status(200).json({
      success: true,
      message: "Data transaksi aktif berhasil diambil.",
      data: transaksi,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

const getLatestTransaksi = asyncHandler(async (req, res) => {
  try {
    const transaksi = await transaksiService.getLatestTransaksi(5);
    
    res.status(200).json({
      success: true,
      message: "Transaksi terbaru berhasil diambil.",
      data: transaksi,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

const getTransaksiById = asyncHandler(async (req, res) => {
  try {
    const transaksi = await transaksiService.getTransaksiById(req.params.id);
    
    res.status(200).json({
      success: true,
      message: "Detail transaksi berhasil diambil.",
      data: transaksi,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
});

const createTransaksi = asyncHandler(async (req, res) => {
  try {
    const result = await transaksiService.createTransaksi(req.body);
    
    res.status(201).json({
      success: true,
      message: "Transaksi berhasil dibuat.",
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

const updateStatus = asyncHandler(async (req, res) => {
  try {
    const result = await transaksiService.updateStatus(req.params.id, req.body.status);
    
    res.status(200).json({
      success: true,
      message: "Status transaksi berhasil diperbarui.",
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = {
  getAllTransaksi,
  getLatestTransaksi,
  getTransaksiById,
  createTransaksi,
  updateStatus,
};
