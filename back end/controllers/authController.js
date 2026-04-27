const authService = require("../services/authService");
const { addToBlacklist } = require("../utils/tokenBlacklist");
const asyncHandler = require("../utils/asyncHandler");

const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  
  try {
    const result = await authService.login(username, password);
    
    res.status(200).json({
      success: true,
      message: "Login berhasil.",
      data: result,
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message,
    });
  }
});

const logout = asyncHandler(async (req, res) => {
  try {
    const token = req.token;
    
    if (token) {
      addToBlacklist(token);
    }
    
    res.status(200).json({
      success: true,
      message: "Logout berhasil.",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = {
  login,
  logout,
};
