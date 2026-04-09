const jwt = require("jsonwebtoken");

// tạo access token (ngắn hạn)
exports.generateAccessToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role }, // payload (thông tin user)
    process.env.JWT_SECRET, // key bí mật
    { expiresIn: "15m" }, // hết hạn 15 phút
  );
};

// tạo refresh token (dài hạn)
exports.generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }, // sống 7 ngày
  );
};
