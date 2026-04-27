const express = require("express");
const jenisController = require("../controllers/jenisController");
const { verifyToken } = require("../middleware/auth");
const { ownerOnly, kasirOrOwner } = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(verifyToken);
router.get("/",      kasirOrOwner, jenisController.getAllJenis);
router.post("/",     ownerOnly,    jenisController.createJenis);
router.put("/:id",   ownerOnly,    jenisController.updateJenis);
router.delete("/:id",ownerOnly,    jenisController.deleteJenis);

module.exports = router;
