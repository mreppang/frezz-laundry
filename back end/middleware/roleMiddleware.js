function ownerOnly(req, res, next) {
  if (req.user?.role !== "owner") {
    return res.status(403).json({
      success: false,
      message: "Akses hanya untuk owner.",
    });
  }

  next();
}

function kasirOrOwner(req, res, next) {
  if (req.user?.role !== "owner" && req.user?.role !== "kasir") {
    return res.status(403).json({
      success: false,
      message: "Akses hanya untuk owner atau kasir.",
    });
  }

  next();
}

module.exports = {
  ownerOnly,
  kasirOrOwner,
};
