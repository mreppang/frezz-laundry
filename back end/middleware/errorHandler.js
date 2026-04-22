function notFound(req, res) {
  return res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} tidak ditemukan.`,
  });
}

function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  console.error(error);

  if (error.code === "ER_DUP_ENTRY") {
    return res.status(409).json({
      success: false,
      message: "Data duplikat terdeteksi.",
      error: error.sqlMessage,
    });
  }

  if (error.code === "ER_NO_REFERENCED_ROW_2") {
    return res.status(400).json({
      success: false,
      message: "Relasi data tidak valid.",
      error: error.sqlMessage,
    });
  }

  return res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Terjadi kesalahan pada server.",
  });
}

module.exports = {
  notFound,
  errorHandler,
};
