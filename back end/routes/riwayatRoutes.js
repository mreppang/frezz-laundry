const express = require("express");
const riwayatController = require("../controllers/riwayatController");
const { verifyToken } = require("../middleware/auth");

const router = express.Router();

router.get("/", verifyToken, riwayatController.getRiwayat);

module.exports = router;
