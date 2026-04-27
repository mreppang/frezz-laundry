const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const env = require("../config/env");
const userModel = require("../models/userModel");

class AuthService {
  async login(username, password) {
    if (!username || !password) {
      throw new Error("Username dan password wajib diisi.");
    }

    const user = await userModel.findByUsername(username);
    if (!user) {
      throw new Error("Username atau password salah.");
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw new Error("Username atau password salah.");
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

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    };
  }
}

module.exports = new AuthService();
