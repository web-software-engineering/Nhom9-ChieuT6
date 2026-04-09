import "dotenv/config";
import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import passport from "passport";
import googleOAuth from "passport-google-oauth20";
import facebookOAuth from "passport-facebook";
import * as ghnService from "./services/ghnService.js";
import db from "./services/db.js";
<<<<<<< HEAD
import categoryRoutes from "./routes/categoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import statsRoutes from "./routes/statsRoutes.js";
import reviewsRoutes from "./routes/reviewRouters.js";
import userRoutes from "./routes/userRoutes.js";
=======

const { Strategy: GoogleStrategy } = googleOAuth;
const { Strategy: FacebookStrategy } = facebookOAuth;

>>>>>>> 53b5e2e (add login feature)
const requiredEnvVars = ["GHN_API_URL", "GHN_TOKEN", "GHN_SHOP_ID"];
const missingEnvVars = requiredEnvVars.filter((name) => !process.env[name]);

console.log("[ENV] GHN_API_URL:", process.env.GHN_API_URL || "(missing)");
console.log("[ENV] GHN_SHOP_ID:", process.env.GHN_SHOP_ID || "(missing)");
console.log("[ENV] GHN_TOKEN loaded:", Boolean(process.env.GHN_TOKEN));

if (missingEnvVars.length > 0) {
  console.warn(`[ENV] Missing variables: ${missingEnvVars.join(", ")}`);
}

const app = express();
<<<<<<< HEAD
import fs from "fs";
import path from "path";
=======
const PORT = Number(process.env.PORT || 5000);
const JWT_SECRET = process.env.JWT_SECRET || "dev-access-secret";
const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || "dev-refresh-secret";
const BACKEND_URL =
  (process.env.BACKEND_URL || process.env.RENDER_EXTERNAL_URL || "").replace(
    /\/$/,
    "",
  ) || "https://nhom9-chieut6-backend.onrender.com";
const FRONTEND_URL =
  process.env.FRONTEND_URL || "https://nhom9-chieu-t6.vercel.app";
const FRONTEND_LOGIN_URL = `${FRONTEND_URL}/login`;
const FACEBOOK_CLIENT_ID =
  process.env.FACEBOOK_CLIENT_ID || process.env.FACEBOOK_APP_ID;
const FACEBOOK_CLIENT_SECRET =
  process.env.FACEBOOK_CLIENT_SECRET || process.env.FACEBOOK_APP_SECRET;

const googleOAuthEnabled = Boolean(
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET,
);
const facebookOAuthEnabled = Boolean(
  FACEBOOK_CLIENT_ID && FACEBOOK_CLIENT_SECRET,
);
>>>>>>> 53b5e2e (add login feature)

// TỰ ĐỘNG TẠO FOLDER uploads
const uploadDir = path.join("public", "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("Đã tạo thư mục public/uploads");
}
app.use(cors());
app.use(express.json());
<<<<<<< HEAD
app.use("/uploads", express.static("public/uploads"));
=======
app.use(passport.initialize());

>>>>>>> 53b5e2e (add login feature)
app.get("/", (req, res) => {
  res.json({ message: "Backend GHN running" });
});
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/reviews", reviewsRoutes);
app.use("/api/users", userRoutes);
/* ================= USERS API ================= */

let users = [
  { id: 1, name: "An" },
  { id: 2, name: "Binh" },
  { id: 3, name: "Chau" },
];

let nextUserId = 4;
const seededPasswordHash = bcrypt.hashSync("123456", 10);
let nextAuthUserId = 4;
const authUsers = [
  {
    id: 1,
    username: "admin01",
    passwordHash: seededPasswordHash,
    name: "Nguyễn Văn Admin",
    contact_add: "0123456789",
    address: "Hà Nội",
    email: "admin01@example.com",
    role: "admin",
    otp: null,
    otp_expire: null,
    refreshToken: null,
    refresh_token: null,
    google_id: null,
    facebook_id: null,
  },
  {
    id: 2,
    username: "seller01",
    passwordHash: seededPasswordHash,
    name: "Trần Thị Seller",
    contact_add: "0987654321",
    address: "Hồ Chí Minh",
    email: "seller01@example.com",
    role: "seller",
    otp: null,
    otp_expire: null,
    refreshToken: null,
    refresh_token: null,
    google_id: null,
    facebook_id: null,
  },
  {
    id: 3,
    username: "user01",
    passwordHash: seededPasswordHash,
    name: "Lê Văn Customer",
    contact_add: "0911223344",
    address: "Đà Nẵng",
    email: "user01@example.com",
    role: "customer",
    otp: null,
    otp_expire: null,
    refreshToken: null,
    refresh_token: null,
    google_id: null,
    facebook_id: null,
  },
];

const normalizeText = (value) => String(value ?? "").trim();
const normalizeEmail = (value) => normalizeText(value).toLowerCase();
const normalizeUsername = (value) => normalizeText(value).toLowerCase();
const normalizeRole = (value) => {
  const role = normalizeText(value).toLowerCase();
  return ["customer", "seller", "admin"].includes(role) ? role : "customer";
};

const createUniqueUsername = (value) => {
  const baseName = normalizeUsername(value) || `user${nextAuthUserId}`;
  let candidate = baseName;
  let suffix = 1;

  while (authUsers.some((user) => user.username === candidate)) {
    candidate = `${baseName}_${suffix++}`;
  }

  return candidate;
};

const findAuthUserByEmail = (email) =>
  authUsers.find((user) => user.email === normalizeEmail(email));

const findAuthUserByUsername = (username) =>
  authUsers.find((user) => user.username === normalizeUsername(username));

const findAuthUserByProvider = (provider, providerId) =>
  authUsers.find(
    (user) => user.oauthProvider === provider && user.oauthId === providerId,
  );

const setRefreshToken = (user, token) => {
  user.refreshToken = token;
  user.refresh_token = token;
};

const serializeAuthUser = (user) => ({
  id: user.id,
  username: user.username || "",
  name: user.name || "",
  contact_add: user.contact_add || "",
  address: user.address || "",
  email: user.email || "",
  role: user.role || "customer",
  google_id: user.google_id || null,
  facebook_id: user.facebook_id || null,
});

const upsertOAuthUser = ({ provider, providerId, email, name }) => {
  const normalizedEmail = email ? normalizeEmail(email) : "";
  const existingUser =
    findAuthUserByProvider(provider, providerId) ||
    (normalizedEmail ? findAuthUserByEmail(normalizedEmail) : null);

  if (existingUser) {
    existingUser.oauthProvider = provider;
    existingUser.oauthId = providerId;
    existingUser.name = normalizeText(name) || existingUser.name || "";
    if (normalizedEmail && !existingUser.email) {
      existingUser.email = normalizedEmail;
    }
    if (provider === "google") {
      existingUser.google_id = providerId;
    }
    if (provider === "facebook") {
      existingUser.facebook_id = providerId;
    }
    return existingUser;
  }

  const newUser = {
    id: nextAuthUserId++,
    username: createUniqueUsername(
      normalizedEmail
        ? normalizedEmail.split("@")[0]
        : `${provider}_${providerId}`,
    ),
    email: normalizedEmail || `${provider}-${providerId}@oauth.local`,
    passwordHash: null,
    name: normalizeText(name) || `${provider} user`,
    contact_add: "",
    address: "",
    role: "customer",
    otp: null,
    otp_expire: null,
    refreshToken: null,
    refresh_token: null,
    oauthProvider: provider,
    oauthId: providerId,
    google_id: provider === "google" ? providerId : null,
    facebook_id: provider === "facebook" ? providerId : null,
  };

  authUsers.push(newUser);
  return newUser;
};

const authenticateAuthUser = (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7).trim()
    : "";

  if (!token) {
    return res.status(401).json({ message: "Thiếu access token" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = authUsers.find((item) => item.id === decoded.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    req.authUser = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: error.message });
  }
};

const shippingTrackingHistory = new Map();

const createInitialTrackingHistory = () => {
  const now = new Date().toLocaleString("vi-VN");

  return [
    {
      status: "Đơn hàng đã được tạo",
      description: "Đơn hàng đã được tạo thành công",
      time: now,
    },
    {
      status: "Đang chờ lấy hàng",
      description: "Đơn vị vận chuyển đang chờ lấy hàng",
      time: now,
    },
  ];
};

app.get("/users", (req, res) => {
  res.json(users);
});

app.get("/users/:id", (req, res) => {
  const id = Number(req.params.id);
  const user = users.find((u) => u.id === id);
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
});

app.post("/users", (req, res) => {
  const { name } = req.body;
  if (!name || !String(name).trim()) {
    return res.status(400).json({ message: "Name is required" });
  }
  const newUser = { id: nextUserId++, name: String(name).trim() };
  users.push(newUser);
  res.status(201).json(newUser);
});

app.put("/users/:id", (req, res) => {
  const id = Number(req.params.id);
  const { name } = req.body;
  if (!name || !String(name).trim()) {
    return res.status(400).json({ message: "Name is required" });
  }
  const user = users.find((u) => u.id === id);
  if (!user) return res.status(404).json({ message: "User not found" });
  user.name = String(name).trim();
  res.json(user);
});

app.delete("/users/:id", (req, res) => {
  const id = Number(req.params.id);
  users = users.filter((u) => u.id !== id);
  res.json({ message: "User deleted" });
});

const createAuthTokens = (user) => ({
  accessToken: jwt.sign(
    {
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    {
      expiresIn: "15m",
    },
  ),
  refreshToken: jwt.sign(
    {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
    JWT_REFRESH_SECRET,
    { expiresIn: "7d" },
  ),
});

const buildAccessToken = (user) =>
  jwt.sign(
    {
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: "15m" },
  );

const sendOAuthSuccess = (res, user) => {
  const tokens = createAuthTokens(user);
  setRefreshToken(user, tokens.refreshToken);

  const url = new URL(FRONTEND_LOGIN_URL);
  url.searchParams.set("accessToken", tokens.accessToken);
  url.searchParams.set("refreshToken", tokens.refreshToken);

  return res.redirect(url.toString());
};

if (googleOAuthEnabled) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL:
          process.env.GOOGLE_CALLBACK_URL ||
          `${BACKEND_URL}/api/auth/google/callback`,
      },
      (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value || "";
          const user = upsertOAuthUser({
            provider: "google",
            providerId: profile.id,
            email,
            name: profile.displayName || "Google User",
          });

          done(null, user);
        } catch (error) {
          done(error);
        }
      },
    ),
  );
}

if (facebookOAuthEnabled) {
  passport.use(
    new FacebookStrategy(
      {
        clientID: FACEBOOK_CLIENT_ID,
        clientSecret: FACEBOOK_CLIENT_SECRET,
        callbackURL:
          process.env.FACEBOOK_CALLBACK_URL ||
          `${BACKEND_URL}/api/auth/facebook/callback`,
        profileFields: ["id", "displayName", "emails"],
      },
      (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value || "";
          const user = upsertOAuthUser({
            provider: "facebook",
            providerId: profile.id,
            email,
            name: profile.displayName || "Facebook User",
          });

          done(null, user);
        } catch (error) {
          done(error);
        }
      },
    ),
  );
}

app.post("/api/auth/register", async (req, res) => {
  try {
    const {
      username,
      password,
      name,
      contact_add,
      address,
      email,
      role,
      google_id,
      facebook_id,
    } = req.body;

    if (!username || !password || !name || !email) {
      return res.status(400).json({
        message: "Thiếu username, name, email hoặc password",
      });
    }

    const normalizedUsername = normalizeUsername(username);
    const normalizedEmail = normalizeEmail(email);
    const existingUser = authUsers.find(
      (user) =>
        user.email === normalizedEmail || user.username === normalizedUsername,
    );

    if (existingUser) {
      return res
        .status(409)
        .json({ message: "Username hoặc email đã tồn tại" });
    }

    const passwordHash = await bcrypt.hash(String(password), 10);
    const newUser = {
      id: nextAuthUserId++,
      username: normalizedUsername,
      email: normalizedEmail,
      name: normalizeText(name),
      contact_add: normalizeText(contact_add),
      address: normalizeText(address),
      role: normalizeRole(role),
      passwordHash,
      otp: null,
      otp_expire: null,
      refreshToken: null,
      refresh_token: null,
      google_id: normalizeText(google_id) || null,
      facebook_id: normalizeText(facebook_id) || null,
    };

    authUsers.push(newUser);

    return res.status(201).json({
      message: "Đăng ký thành công",
      user: serializeAuthUser(newUser),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { identifier, email, username, password } = req.body;

    if (!password || !(identifier || email || username)) {
      return res
        .status(400)
        .json({ message: "Thiếu username/email hoặc password" });
    }

    const loginValue = normalizeText(
      identifier || email || username,
    ).toLowerCase();
    const user =
      findAuthUserByEmail(loginValue) || findAuthUserByUsername(loginValue);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.passwordHash) {
      return res.status(400).json({
        message:
          "Tài khoản này dùng đăng nhập OAuth, hãy đăng nhập bằng Google/Facebook",
      });
    }

    const isPasswordValid = await bcrypt.compare(
      String(password),
      user.passwordHash,
    );

    if (!isPasswordValid) {
      return res.status(400).json({ message: "Wrong password" });
    }

    const tokens = createAuthTokens(user);
    setRefreshToken(user, tokens.refreshToken);

    return res.json({
      ...tokens,
      user: serializeAuthUser(user),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

app.get("/api/auth/me", authenticateAuthUser, (req, res) => {
  return res.json({ user: serializeAuthUser(req.authUser) });
});

app.put("/api/auth/me", authenticateAuthUser, (req, res) => {
  const { username, name, contact_add, address, email } = req.body;

  const user = req.authUser;

  if (username !== undefined) {
    const normalizedUsername = normalizeUsername(username);

    if (!normalizedUsername) {
      return res.status(400).json({ message: "Username is required" });
    }

    const duplicateUsername = authUsers.find(
      (item) => item.username === normalizedUsername && item.id !== user.id,
    );

    if (duplicateUsername) {
      return res.status(409).json({ message: "Username đã tồn tại" });
    }

    user.username = normalizedUsername;
  }

  if (name !== undefined) {
    const nextName = normalizeText(name);
    if (!nextName) {
      return res.status(400).json({ message: "Name is required" });
    }
    user.name = nextName;
  }

  if (contact_add !== undefined) {
    user.contact_add = normalizeText(contact_add);
  }

  if (address !== undefined) {
    user.address = normalizeText(address);
  }

  if (email !== undefined) {
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail) {
      return res.status(400).json({ message: "Email is required" });
    }

    const duplicateEmail = authUsers.find(
      (item) => item.email === normalizedEmail && item.id !== user.id,
    );

    if (duplicateEmail) {
      return res.status(409).json({ message: "Email đã tồn tại" });
    }

    user.email = normalizedEmail;
  }

  return res.json({
    message: "Profile updated",
    user: serializeAuthUser(user),
  });
});

app.post("/api/auth/refresh", async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Thiếu refresh token" });
    }

    const decoded = jwt.verify(token, JWT_REFRESH_SECRET);
    const user = authUsers.find((item) => item.id === decoded.id);

    if (
      !user ||
      (user.refreshToken !== token && user.refresh_token !== token)
    ) {
      return res.status(403).json({ message: "Invalid token" });
    }

    const accessToken = buildAccessToken(user);

    return res.json({ accessToken });
  } catch (error) {
    return res.status(401).json({ message: error.message });
  }
});

app.post("/api/auth/forgot", (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Thiếu email" });
  }

  const user = authUsers.find(
    (item) => item.email === String(email).trim().toLowerCase(),
  );

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  return res.json({ message: "OTP sent" });
});

app.post("/api/auth/reset", (req, res) => {
  const { email, newPassword } = req.body;

  if (!email || !newPassword) {
    return res.status(400).json({ message: "Thiếu dữ liệu" });
  }

  const user = authUsers.find(
    (item) => item.email === String(email).trim().toLowerCase(),
  );

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  user.passwordHash = bcrypt.hashSync(String(newPassword), 10);
  user.refreshToken = null;
  user.refresh_token = null;

  return res.json({ message: "Password updated" });
});

app.get("/api/auth/google", (req, res, next) => {
  if (!googleOAuthEnabled) {
    return res.status(503).json({
      message:
        "Google OAuth is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.",
    });
  }

  return passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })(req, res, next);
});

app.get("/api/auth/google/callback", (req, res, next) => {
  if (!googleOAuthEnabled) {
    return res.status(503).json({
      message:
        "Google OAuth is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.",
    });
  }

  return passport.authenticate("google", { session: false }, (error, user) => {
    if (error || !user) {
      return res.redirect(`${FRONTEND_LOGIN_URL}?oauthError=google`);
    }

    return sendOAuthSuccess(res, user);
  })(req, res, next);
});

app.get("/api/auth/facebook", (req, res, next) => {
  if (!facebookOAuthEnabled) {
    return res.status(503).json({
      message:
        "Facebook OAuth is not configured. Set FACEBOOK_CLIENT_ID/FACEBOOK_APP_ID and FACEBOOK_CLIENT_SECRET/FACEBOOK_APP_SECRET.",
    });
  }

  return passport.authenticate("facebook", {
    scope: ["public_profile"],
    session: false,
  })(req, res, next);
});

app.get("/api/auth/facebook/callback", (req, res, next) => {
  if (!facebookOAuthEnabled) {
    return res.status(503).json({
      message:
        "Facebook OAuth is not configured. Set FACEBOOK_CLIENT_ID/FACEBOOK_APP_ID and FACEBOOK_CLIENT_SECRET/FACEBOOK_APP_SECRET.",
    });
  }

  return passport.authenticate(
    "facebook",
    { session: false },
    (error, user) => {
      if (error || !user) {
        return res.redirect(`${FRONTEND_LOGIN_URL}?oauthError=facebook`);
      }

      return sendOAuthSuccess(res, user);
    },
  )(req, res, next);
});

const buildCreateOrderInput = (body = {}) => {
  const weightInGram =
    body.weight !== undefined && body.weight !== null && body.weight !== ""
      ? body.weight
      : body.weightKg !== undefined &&
          body.weightKg !== null &&
          body.weightKg !== ""
        ? Math.round(Number(body.weightKg) * 1000)
        : undefined;

  return {
    fromDistrictId: body.fromDistrictId ?? body.from_district_id,
    fromWardCode: body.fromWardCode ?? body.from_ward_code,
    toName: body.toName ?? body.to_name ?? body.receiverName,
    toPhone: body.toPhone ?? body.to_phone ?? body.phone,
    toAddress: body.toAddress ?? body.to_address ?? body.address,
    toWardCode: body.toWardCode ?? body.to_ward_code ?? body.wardId,
    toDistrictId: body.toDistrictId ?? body.to_district_id ?? body.districtId,
    weight: weightInGram,
    length: body.length ?? body.lengthCm,
    width: body.width ?? body.widthCm,
    height: body.height ?? body.heightCm,
    serviceTypeId: body.serviceTypeId ?? body.service_type_id,
    paymentTypeId: body.paymentTypeId ?? body.payment_type_id,
    content: body.content ?? body.productDescription,
    codAmount: body.codAmount ?? body.cod_amount,
  };
};

const buildLegacyOrderResponse = (createdOrder, input, body) => ({
  orderCode: createdOrder.order_code,
  receiverName: input.toName,
  phone: input.toPhone,
  address: input.toAddress,
  district: String(body.districtName || input.toDistrictId || ""),
  ward: String(body.wardName || input.toWardCode || ""),
  weight: Number(input.weight) || 0,
  product: String(input.content || "Hang hoa"),
  status: "Da tao don tren GHN",
  createdAt: new Date().toISOString(),
});

/* ================= SHIPPING API ================= */

// danh sách quận
app.get("/api/shipping/districts", async (req, res) => {
  try {
    const data = await ghnService.getDistricts();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// danh sách phường
app.get("/api/shipping/wards", async (req, res) => {
  try {
    const { districtId } = req.query;

    if (!districtId) {
      return res.status(400).json({ message: "districtId is required" });
    }

    const data = await ghnService.getWards(districtId);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// tính phí
app.get("/api/shipping/fee", async (req, res) => {
  try {
    const {
      fromDistrictId,
      toDistrictId,
      weightKg,
      lengthCm,
      widthCm,
      heightCm,
    } = req.query;

    const missingQueryParams = [
      ["fromDistrictId", fromDistrictId],
      ["toDistrictId", toDistrictId],
      ["weightKg", weightKg],
      ["lengthCm", lengthCm],
      ["widthCm", widthCm],
      ["heightCm", heightCm],
    ]
      .filter(([, value]) => !value)
      .map(([name]) => name);

    if (missingQueryParams.length > 0) {
      return res.status(400).json({
        message: `Missing query parameters: ${missingQueryParams.join(", ")}`,
      });
    }

    const data = await ghnService.getShippingFee(
      fromDistrictId,
      toDistrictId,
      weightKg,
      lengthCm,
      widthCm,
      heightCm,
    );

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// tạo đơn vận chuyển (route chuẩn)
app.post("/api/shipping/create-order", async (req, res) => {
  try {
    const input = buildCreateOrderInput(req.body);
    const createdOrder = await ghnService.createShippingOrder(input);

    shippingTrackingHistory.set(
      createdOrder.order_code,
      createInitialTrackingHistory(),
    );

    res.status(201).json({
      orderCode: createdOrder.order_code,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// route tương thích cũ cho frontend hiện có
app.post("/api/shipping/order", async (req, res) => {
  try {
    const input = buildCreateOrderInput(req.body);
    const createdOrder = await ghnService.createShippingOrder(input);

    shippingTrackingHistory.set(
      createdOrder.order_code,
      createInitialTrackingHistory(),
    );

    res
      .status(201)
      .json(buildLegacyOrderResponse(createdOrder, input, req.body || {}));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// tra cứu vận đơn
app.get("/api/shipping/tracking", async (req, res) => {
  try {
    const { orderCode } = req.query;

    if (!orderCode) {
      return res.status(400).json({ message: "orderCode is required" });
    }

    const normalizedOrderCode = String(orderCode).trim().toUpperCase();
    const tracking = shippingTrackingHistory.get(normalizedOrderCode);

    if (!tracking) {
      return res.status(404).json({ message: "Không tìm thấy mã vận đơn" });
    }

    res.json(tracking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/api/test-db", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT 1 AS ok");

    res.json({
      message: "DB connected OK",
      data: rows,
    });
  } catch (err) {
    res.status(500).json({
      message: "DB connection failed",
      error: err.message,
    });
  }
});
// chạy server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
