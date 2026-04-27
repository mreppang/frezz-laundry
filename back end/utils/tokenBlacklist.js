const tokenBlacklist = new Set();

function addToBlacklist(token) {
  tokenBlacklist.add(token);
}

function isBlacklisted(token) {
  return tokenBlacklist.has(token);
}

function removeFromBlacklist(token) {
  tokenBlacklist.delete(token);
}

module.exports = {
  addToBlacklist,
  isBlacklisted,
  removeFromBlacklist,
};
