const jwt = require("jsonwebtoken");
const env = require("../config/env");

function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({
      success: false,
      message: "Token autentikasi tidak ditemukan.",
    });
  }

  try {
    req.user = jwt.verify(token, env.jwtSecret);
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Token tidak valid atau sudah kedaluwarsa.",
    });
  }
}

function roleOwner(req, res, next) {
  if (req.user?.role !== "owner") {
    return res.status(403).json({
      success: false,
      message: "Akses hanya untuk owner.",
    });
  }

  next();
}

module.exports = {
  verifyToken,
  roleOwner,
};
