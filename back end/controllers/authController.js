const jwt = require("jsonwebtoken");
const env = require("../config/env");
const userModel = require("../models/userModel");
const { comparePassword } = require("../utils/password");
const { sendError, sendSuccess } = require("../utils/response");

async function login(req, res, next) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return sendError(res, 400, "Username dan password wajib diisi.");
    }

    const user = await userModel.findByUsername(username);
    if (!user) {
      return sendError(res, 401, "Username atau password salah.");
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return sendError(res, 401, "Username atau password salah.");
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
      },
      env.jwtSecret,
      { expiresIn: env.jwtExpiresIn },
    );

    return sendSuccess(res, 200, "Login berhasil.", {
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  login,
};
