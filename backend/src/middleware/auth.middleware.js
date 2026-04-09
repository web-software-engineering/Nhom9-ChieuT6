const jwt = require("jsonwebtoken");

exports.verifyToken = (req, res, next) => {
  // lấy token từ header: Authorization: Bearer xxx
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ msg: "No token" });

  // giải mã token
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // lưu user vào request để dùng tiếp
  req.user = decoded;

  next(); // cho đi tiếp
};
