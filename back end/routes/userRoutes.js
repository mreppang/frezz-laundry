const express = require("express");
const userController = require("../controllers/userController");
const { authenticate, authorizeRoles } = require("../middleware/auth");

const router = express.Router();

router.post("/users", authenticate, authorizeRoles("owner"), userController.createUser);
router.post("/akun", authenticate, authorizeRoles("owner"), userController.createUser);
router.post("/register", authenticate, authorizeRoles("owner"), userController.createUser);

module.exports = router;
