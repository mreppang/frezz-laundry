const userModel = require("../models/userModel");
const { hashPassword } = require("../utils/password");
const { sendError, sendSuccess } = require("../utils/response");

const ALLOWED_ROLES = ["owner", "kasir"];

async function createUser(req, res, next) {
  try {
    const { username, password, role } = req.body;

    if (!username || !password || !role) {
      return sendError(res, 400, "Username, password, dan role wajib diisi.");
    }

    if (!ALLOWED_ROLES.includes(role)) {
      return sendError(res, 400, "Role harus owner atau kasir.");
    }

    const existingUser = await userModel.findByUsername(username);
    if (existingUser) {
      return sendError(res, 409, "Username sudah digunakan.");
    }

    const hashedPassword = await hashPassword(password);
    const createdUser = await userModel.createUser({
      username,
      password: hashedPassword,
      role,
    });

    return sendSuccess(res, 201, "Akun berhasil dibuat.", createdUser);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createUser,
};
