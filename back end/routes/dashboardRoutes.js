const express = require("express");
const dashboardController = require("../controllers/dashboardController");
const { verifyToken } = require("../middleware/auth");

const router = express.Router();

router.get("/stats", verifyToken, dashboardController.getStats);

module.exports = router;
