const { sendError } = require("../utils/response");

function notFoundHandler(req, res) {
  return sendError(res, 404, `Route ${req.method} ${req.originalUrl} tidak ditemukan.`);
}

function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  console.error(error);

  if (error.code === "ER_DUP_ENTRY") {
    return sendError(res, 409, "Data duplikat terdeteksi.", error.sqlMessage);
  }

  if (error.code === "ER_NO_REFERENCED_ROW_2") {
    return sendError(res, 400, "Data relasi tidak valid.", error.sqlMessage);
  }

  return sendError(res, error.statusCode || 500, error.message || "Terjadi kesalahan pada server.");
}

module.exports = {
  notFoundHandler,
  errorHandler,
};
