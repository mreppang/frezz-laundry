const express = require("express");
const transaksiController = require("../controllers/transaksiController");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

router.use(authenticate);
router.post("/transaksi", transaksiController.createTransaksi);
router.get("/transaksi", transaksiController.getActiveTransaksi);
router.get("/riwayat", transaksiController.getRiwayat);
router.patch("/transaksi/:id/status", transaksiController.updateStatus);
router.patch("/transaksi/:id", transaksiController.updateStatus);
router.post("/transaksi/:id/detail", transaksiController.addTransaksiDetail);

module.exports = router;
