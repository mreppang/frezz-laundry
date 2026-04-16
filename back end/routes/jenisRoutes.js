const express = require("express");
const jenisController = require("../controllers/jenisController");
const { authenticate, authorizeRoles } = require("../middleware/auth");

const router = express.Router();

router.use(authenticate);
router.get("/jenis", jenisController.getAllJenis);
router.get("/jenis-pakaian", jenisController.getAllJenis);
router.get("/jenis_pakaian", jenisController.getAllJenis);
router.get("/clothing-types", jenisController.getAllJenis);
router.post("/jenis", authorizeRoles("owner"), jenisController.createJenis);
router.post("/jenis-pakaian", authorizeRoles("owner"), jenisController.createJenis);
router.post("/jenis_pakaian", authorizeRoles("owner"), jenisController.createJenis);
router.put("/jenis/:id", authorizeRoles("owner"), jenisController.updateJenis);
router.put("/jenis-pakaian/:id", authorizeRoles("owner"), jenisController.updateJenis);
router.patch("/jenis_pakaian/:id", authorizeRoles("owner"), jenisController.updateJenis);
router.delete("/jenis/:id", authorizeRoles("owner"), jenisController.deleteJenis);
router.delete("/jenis-pakaian/:id", authorizeRoles("owner"), jenisController.deleteJenis);
router.delete("/jenis_pakaian/:id", authorizeRoles("owner"), jenisController.deleteJenis);

module.exports = router;
