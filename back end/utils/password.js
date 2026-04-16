const crypto = require("crypto");
const { promisify } = require("util");

const scrypt = promisify(crypto.scrypt);

async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = await scrypt(password, salt, 64);
  return `${salt}:${derivedKey.toString("hex")}`;
}

async function comparePassword(plainPassword, storedPassword) {
  if (!storedPassword) {
    return false;
  }

  if (!storedPassword.includes(":")) {
    return plainPassword === storedPassword;
  }

  const [salt, hash] = storedPassword.split(":");
  const derivedKey = await scrypt(plainPassword, salt, 64);
  const storedBuffer = Buffer.from(hash, "hex");
  const derivedBuffer = Buffer.from(derivedKey.toString("hex"), "hex");

  if (storedBuffer.length !== derivedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(storedBuffer, derivedBuffer);
}

module.exports = {
  hashPassword,
  comparePassword,
};
