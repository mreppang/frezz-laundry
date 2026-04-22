const express = require("express");
const jenisController = require("../controllers/jenisController");
const { roleOwner, verifyToken } = require("../middleware/auth");

const router = express.Router();

router.use(verifyToken);
router.get("/", jenisController.getAllJenis);
router.post("/", roleOwner, jenisController.createJenis);
router.put("/:id", roleOwner, jenisController.updateJenis);
router.delete("/:id", roleOwner, jenisController.deleteJenis);

module.exports = router;
