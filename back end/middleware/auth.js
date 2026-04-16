const jwt = require("jsonwebtoken");
const env = require("../config/env");
const { sendError } = require("../utils/response");

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const [type, token] = authHeader.split(" ");

  if (type !== "Bearer" || !token) {
    return sendError(res, 401, "Token autentikasi tidak ditemukan.");
  }

  try {
    const decoded = jwt.verify(token, env.jwtSecret);
    req.user = decoded;
    return next();
  } catch (error) {
    return sendError(res, 401, "Token tidak valid atau sudah kedaluwarsa.");
  }
}

function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return sendError(res, 403, "Anda tidak memiliki akses ke resource ini.");
    }

    return next();
  };
}

module.exports = {
  authenticate,
  authorizeRoles,
};
