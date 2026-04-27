const express = require("express");
const dashboardController = require("../controllers/dashboardController");
const { verifyToken } = require("../middleware/auth");
const { kasirOrOwner } = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(verifyToken);
router.get("/stats", kasirOrOwner, dashboardController.getStats);

module.exports = router;
