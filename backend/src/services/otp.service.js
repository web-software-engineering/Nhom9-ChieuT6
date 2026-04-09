// tạo mã OTP 6 số
exports.generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000);
};
