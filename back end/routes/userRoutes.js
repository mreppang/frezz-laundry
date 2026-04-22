const express = require("express");
const userController = require("../controllers/userController");
const { roleOwner, verifyToken } = require("../middleware/auth");

const router = express.Router();

router.use(verifyToken, roleOwner);
router.get("/", userController.getUsers);
router.post("/", userController.createUser);
router.put("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);

module.exports = router;
