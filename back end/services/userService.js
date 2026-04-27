const userModel = require("../models/userModel");

class UserService {
  async getAllUsers() {
    return await userModel.getAll();
  }

  async getUserById(id) {
    const user = await userModel.findById(id);
    if (!user) throw new Error("User tidak ditemukan.");
    return user;
  }

  async createUser({ username, password, role }) {
    if (!username || !password || !role) {
      throw new Error("Username, password, dan role wajib diisi.");
    }
    if (!["owner", "kasir"].includes(role)) {
      throw new Error("Role harus owner atau kasir.");
    }
    const existing = await userModel.findByUsername(username);
    if (existing) throw new Error("Username sudah digunakan.");
    // hashing done inside userModel.create
    return await userModel.create({ username, password, role });
  }

  async updateUser(id, data) {
    const existing = await userModel.findById(id);
    if (!existing) throw new Error("User tidak ditemukan.");

    const username = data.username || existing.username;
    const role     = data.role     || existing.role;
    const password = data.password || null;

    if (data.username && data.username !== existing.username) {
      const taken = await userModel.findByUsername(data.username);
      if (taken) throw new Error("Username sudah digunakan.");
    }
    if (!["owner", "kasir"].includes(role)) {
      throw new Error("Role harus owner atau kasir.");
    }
    // hashing done inside userModel.update
    return await userModel.update(id, { username, password, role });
  }

  async deleteUser(id) {
    const existing = await userModel.findById(id);
    if (!existing) throw new Error("User tidak ditemukan.");
    return await userModel.remove(id);
  }
}

module.exports = new UserService();
