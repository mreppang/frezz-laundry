const bcrypt = require("bcrypt");
const userModel = require("../models/userModel");
const asyncHandler = require("../utils/asyncHandler");

const getUsers = asyncHandler(async (req, res) => {
  const users = await userModel.getAllUsers();
  res.status(200).json({
    success: true,
    message: "Data users berhasil diambil.",
    data: users,
  });
});

const createUser = asyncHandler(async (req, res) => {
  const { username, password, role = "kasir" } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: "Username dan password wajib diisi.",
    });
  }

  if (!["owner", "kasir"].includes(role)) {
    return res.status(400).json({
      success: false,
      message: "Role harus owner atau kasir.",
    });
  }

  const existing = await userModel.findByUsername(username);
  if (existing) {
    return res.status(409).json({
      success: false,
      message: "Username sudah digunakan.",
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await userModel.createUser({
    username,
    password: hashedPassword,
    role,
  });

  res.status(201).json({
    success: true,
    message: "User berhasil ditambahkan.",
    data: user,
  });
});

const updateUser = asyncHandler(async (req, res) => {
  const existing = await userModel.findById(req.params.id);
  if (!existing) {
    return res.status(404).json({
      success: false,
      message: "User tidak ditemukan.",
    });
  }

  const { username, password, role } = req.body;

  let hashedPassword = "";
  if (password) {
    hashedPassword = await bcrypt.hash(password, 10);
  }

  const user = await userModel.updateUser(req.params.id, {
    username: username || existing.username,
    password: hashedPassword,
    role: role || existing.role,
  });

  res.status(200).json({
    success: true,
    message: "User berhasil diperbarui.",
    data: user,
  });
});

const deleteUser = asyncHandler(async (req, res) => {
  const existing = await userModel.findById(req.params.id);
  if (!existing) {
    return res.status(404).json({
      success: false,
      message: "User tidak ditemukan.",
    });
  }

  if (Number(req.params.id) === Number(req.user.id)) {
    return res.status(400).json({
      success: false,
      message: "User yang sedang login tidak bisa dihapus.",
    });
  }

  await userModel.deleteUser(req.params.id);
  res.status(200).json({
    success: true,
    message: "User berhasil dihapus.",
  });
});

module.exports = {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
};
