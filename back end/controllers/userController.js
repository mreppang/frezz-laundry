const userService = require("../services/userService");
const asyncHandler = require("../utils/asyncHandler");

const getAllUsers = asyncHandler(async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    
    res.status(200).json({
      success: true,
      message: "Data user berhasil diambil.",
      data: users,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

const getUserById = asyncHandler(async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.id);
    
    res.status(200).json({
      success: true,
      message: "Data user berhasil diambil.",
      data: user,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
});

const createUser = asyncHandler(async (req, res) => {
  try {
    const newUser = await userService.createUser(req.body);
    
    res.status(201).json({
      success: true,
      message: "User berhasil dibuat.",
      data: newUser,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

const updateUser = asyncHandler(async (req, res) => {
  try {
    const updatedUser = await userService.updateUser(req.params.id, req.body);
    
    res.status(200).json({
      success: true,
      message: "User berhasil diperbarui.",
      data: updatedUser,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

const deleteUser = asyncHandler(async (req, res) => {
  try {
    await userService.deleteUser(req.params.id);
    
    res.status(200).json({
      success: true,
      message: "User berhasil dihapus.",
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
