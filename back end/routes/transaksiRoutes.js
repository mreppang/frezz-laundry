const express = require("express");
const transaksiController = require("../controllers/transaksiController");
const { verifyToken } = require("../middleware/auth");

const router = express.Router();

router.use(verifyToken);
router.get("/", transaksiController.getAllTransaksi);
router.get("/latest", transaksiController.getLatestTransaksi);
router.get("/:id", transaksiController.getTransaksiById);
router.post("/", transaksiController.createTransaksi);
router.patch("/:id/status", transaksiController.updateStatus);

module.exports = router;
