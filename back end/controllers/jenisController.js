const jenisService = require("../services/jenisService");
const asyncHandler = require("../utils/asyncHandler");

const getAllJenis = asyncHandler(async (req, res) => {
  try {
    const jenis = await jenisService.getAllJenis();
    
    res.status(200).json({
      success: true,
      message: "Data jenis pakaian berhasil diambil.",
      data: jenis,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

const createJenis = asyncHandler(async (req, res) => {
  try {
    const newJenis = await jenisService.createJenis(req.body);
    
    res.status(201).json({
      success: true,
      message: "Jenis pakaian berhasil ditambahkan.",
      data: newJenis,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

const updateJenis = asyncHandler(async (req, res) => {
  try {
    const updatedJenis = await jenisService.updateJenis(req.params.id, req.body);
    
    res.status(200).json({
      success: true,
      message: "Jenis pakaian berhasil diperbarui.",
      data: updatedJenis,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

const deleteJenis = asyncHandler(async (req, res) => {
  try {
    await jenisService.deleteJenis(req.params.id);
    
    res.status(200).json({
      success: true,
      message: "Jenis pakaian berhasil dihapus.",
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = {
  getAllJenis,
  createJenis,
  updateJenis,
  deleteJenis,
};
