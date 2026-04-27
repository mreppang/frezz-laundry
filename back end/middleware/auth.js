const jwt = require("jsonwebtoken");
const env = require("../config/env");
const { isBlacklisted } = require("../utils/tokenBlacklist");

function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({
      success: false,
      message: "Token autentikasi tidak ditemukan.",
    });
  }

  if (isBlacklisted(token)) {
    return res.status(401).json({
      success: false,
      message: "Token sudah tidak berlaku (logout).",
    });
  }

  try {
    req.user = jwt.verify(token, env.jwtSecret);
    req.token = token;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Token tidak valid atau sudah kedaluwarsa.",
    });
  }
}

function logout(req, res, next) {
  const token = req.token;
  
  if (token) {
    const { addToBlacklist } = require("../utils/tokenBlacklist");
    addToBlacklist(token);
  }

  res.status(200).json({
    success: true,
    message: "Logout berhasil.",
  });
}

module.exports = {
  verifyToken,
  logout,
};
