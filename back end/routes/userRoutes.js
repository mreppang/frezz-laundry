const express = require("express");
const userController = require("../controllers/userController");
const { verifyToken } = require("../middleware/auth");
const { ownerOnly } = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(verifyToken);
router.get("/", ownerOnly, userController.getAllUsers);
router.get("/:id", ownerOnly, userController.getUserById);
router.post("/", ownerOnly, userController.createUser);
router.put("/:id", ownerOnly, userController.updateUser);
router.delete("/:id", ownerOnly, userController.deleteUser);

module.exports = router;
