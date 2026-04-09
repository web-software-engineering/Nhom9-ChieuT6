// ========== ĐĂNG KÝ ==========
exports.register = async (req, res) => {
  const { email, password } = req.body;

  // ❗ validate backend (bắt buộc)
  if (!email || !password) {
    return res.status(400).json({ msg: "Thiếu dữ liệu" });
  }

  if (password.length < 6) {
    return res.status(400).json({ msg: "Password phải >= 6 ký tự" });
  }

  const hash = await hashPassword(password);

  await db.query(
    "INSERT INTO users (email, password) VALUES (?, ?)",
    [email, hash]
  );

  res.json({ msg: "Registered" });
};
// ========== ĐĂNG NHẬP ==========
exports.login = async (req, res) => {
  const { email, password } = req.body;

  // tìm user
  const [rows] = await db.query("SELECT * FROM users WHERE email=?", [email]);
  const user = rows[0];

  if (!user) return res.status(404).json({ msg: "User not found" });

  // so sánh password
  const match = await comparePassword(password, user.password);

  if (!match) return res.status(400).json({ msg: "Wrong password" });

  // tạo token
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // lưu refresh token vào DB
  await db.query("UPDATE users SET refresh_token=? WHERE id=?", [
    refreshToken,
    user.id,
  ]);

  res.json({ accessToken, refreshToken });
};

// ========== REFRESH TOKEN ==========
exports.refresh = async (req, res) => {
  const { token } = req.body;

  // giải mã refresh token
  const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

  // tìm user
  const [rows] = await db.query("SELECT * FROM users WHERE id=?", [decoded.id]);
  const user = rows[0];

  // kiểm tra token có đúng không
  if (!user || user.refresh_token !== token)
    return res.status(403).json({ msg: "Invalid token" });

  // tạo access token mới
  const newAccessToken = generateAccessToken(user);

  res.json({ accessToken: newAccessToken });
};

// ========== FORGOT PASSWORD ==========
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  // tạo OTP
  const otp = generateOTP();

  // lưu OTP + thời gian hết hạn
  await db.query("UPDATE users SET otp=?, otp_expire=? WHERE email=?", [
    otp,
    new Date(Date.now() + 5 * 60 * 1000),
    email,
  ]);

  console.log("OTP:", otp); // demo (sau này gửi email)

  res.json({ msg: "OTP sent" });
};

// ========== RESET PASSWORD ==========
exports.resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  const [rows] = await db.query("SELECT * FROM users WHERE email=?", [email]);
  const user = rows[0];

  // kiểm tra OTP
  if (!user || user.otp != otp || new Date(user.otp_expire) < new Date())
    return res.status(400).json({ msg: "Invalid OTP" });

  // hash password mới
  const hash = await hashPassword(newPassword);

  // update
  await db.query("UPDATE users SET password=?, otp=NULL WHERE email=?", [
    hash,
    email,
  ]);

  res.json({ msg: "Password updated" });
};
