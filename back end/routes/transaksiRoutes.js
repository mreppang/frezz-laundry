const express = require("express");
const transaksiController = require("../controllers/transaksiController");
const { verifyToken } = require("../middleware/auth");
const { kasirOrOwner } = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(verifyToken);
router.get("/", kasirOrOwner, transaksiController.getAllTransaksi);
router.get("/latest", kasirOrOwner, transaksiController.getLatestTransaksi);
router.get("/:id", kasirOrOwner, transaksiController.getTransaksiById);
router.post("/", kasirOrOwner, transaksiController.createTransaksi);
router.patch("/:id/status", kasirOrOwner, transaksiController.updateStatus);

module.exports = router;
