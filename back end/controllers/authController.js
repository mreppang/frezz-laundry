const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const env = require("../config/env");
const userModel = require("../models/userModel");
const asyncHandler = require("../utils/asyncHandler");

const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: "Username dan password wajib diisi.",
    });
  }

  const user = await userModel.findByUsername(username);
  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Username atau password salah.",
    });
  }

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    return res.status(401).json({
      success: false,
      message: "Username atau password salah.",
    });
  }

  const token = jwt.sign(
    {
      id: user.id,
      username: user.username,
      role: user.role,
    },
    env.jwtSecret,
    {
      expiresIn: env.jwtExpiresIn,
    },
  );

  return res.status(200).json({
    success: true,
    message: "Login berhasil.",
    data: {
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    },
  });
});

module.exports = {
  login,
};
