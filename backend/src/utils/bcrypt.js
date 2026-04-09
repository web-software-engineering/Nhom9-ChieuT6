const bcrypt = require("bcrypt");

// hash password trước khi lưu DB
exports.hashPassword = (password) => {
  return bcrypt.hash(password, 10); 
  // 10 = salt rounds (độ mạnh mã hóa)
};

// so sánh password user nhập với password đã mã hóa
exports.comparePassword = (password, hash) => {
  return bcrypt.compare(password, hash);
};