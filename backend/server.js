import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import * as ghnService from "./services/ghnService.js";
import * as momoService from "./services/momoService.js";
import * as vnpayService from "./services/vnpayService.js";
import db from "./services/db.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import statsRoutes from "./routes/statsRoutes.js";
import reviewRoutes from "./routes/reviewRouters.js";

const requiredEnvVars = ["GHN_API_URL", "GHN_TOKEN", "GHN_SHOP_ID"];
const missingEnvVars = requiredEnvVars.filter((name) => !process.env[name]);

console.log("[ENV] GHN_API_URL:", process.env.GHN_API_URL || "(missing)");
console.log("[ENV] GHN_SHOP_ID:", process.env.GHN_SHOP_ID || "(missing)");
console.log("[ENV] GHN_TOKEN loaded:", Boolean(process.env.GHN_TOKEN));
console.log("[ENV] MOMO_ENV:", process.env.MOMO_ENV || "(missing)");
console.log(
  "[ENV] MOMO_PARTNER_CODE:",
  process.env.MOMO_PARTNER_CODE || "(missing)",
);
console.log(
  "[ENV] MOMO_ACCESS_KEY loaded:",
  Boolean(process.env.MOMO_ACCESS_KEY),
);
console.log(
  "[ENV] MOMO_PARTNER_KEY loaded:",
  Boolean(process.env.MOMO_PARTNER_KEY),
);

if (missingEnvVars.length > 0) {
  console.warn(`[ENV] Missing variables: ${missingEnvVars.join(", ")}`);
}

const app = express();

// Render / Nginx 等反向代理后 req.protocol 需为 https，否则 VNPay ReturnUrl 会错成 http
app.set("trust proxy", 1);

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("public/uploads"));
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/reviews", reviewRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Backend GHN running" });
});

/* ================= USERS API ================= */

let users = [
  { id: 1, name: "An" },
  { id: 2, name: "Binh" },
  { id: 3, name: "Chau" },
];

let nextUserId = 4;

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

/* ================= VNPAY PAYMENT API ================= */

// Tạo URL thanh toán VNPay
app.post("/api/vnpay/create-url", async (req, res) => {
  try {
    const { amount, orderId, orderInfo } = req.body;

    if (!amount || !orderId) {
      return res.status(400).json({
        success: false,
        message: "amount và orderId là bắt buộc",
      });
    }

    // ReturnUrl: ưu tiên biến môi trường (bắt buộc khớp URL đã khai báo với VNPay)
    const protocol = req.protocol;
    const host =
      req.get("host") || process.env.BASE_URL?.replace(/^https?:\/\//, "");
    const returnUrl =
      process.env.VNPAY_RETURN_URL?.trim() ||
      `${protocol}://${host}/api/vnpay/return`;

    const result = await vnpayService.createVNPayUrl({
      orderId,
      amount: Number(amount),
      orderInfo: orderInfo || `Thanh toan don hang ${orderId}`,
      returnUrl,
      ipAddr: vnpayService.getClientIp(req) || "127.0.0.1",
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Return URL — VNPay chuyển hướng về sau thanh toán
app.get("/api/vnpay/return", (req, res) => {
  const { vnp_ResponseCode, vnp_TransactionStatus, vnp_TxnRef, vnp_Amount } =
    req.query;

  if (vnp_ResponseCode === "00" || vnp_TransactionStatus === "00") {
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Thanh toán thành công</title>
          <style>
            body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #f0fdf4; }
            .card { background: white; padding: 40px; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.1); text-align: center; max-width: 400px; }
            .icon { font-size: 64px; color: #10b981; }
            h2 { color: #065f46; margin: 16px 0 8px; }
            p { color: #6b7280; margin: 8px 0; }
            .btn { display: inline-block; margin-top: 20px; padding: 12px 24px; background: #10b981; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="icon">✅</div>
            <h2>Thanh toán VNPay thành công!</h2>
            <p>Mã đơn hàng: <strong>${vnp_TxnRef || ""}</strong></p>
            <p>Cảm ơn bạn đã sử dụng dịch vụ VNPay.</p>
            <a href="/" class="btn">Quay về trang chủ</a>
          </div>
        </body>
      </html>
    `);
  } else {
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Thanh toán thất bại</title>
          <style>
            body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #fef2f2; }
            .card { background: white; padding: 40px; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.1); text-align: center; max-width: 400px; }
            .icon { font-size: 64px; color: #ef4444; }
            h2 { color: #991b1b; margin: 16px 0 8px; }
            p { color: #6b7280; margin: 8px 0; }
            .btn { display: inline-block; margin-top: 20px; padding: 12px 24px; background: #ef4444; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="icon">❌</div>
            <h2>Thanh toán VNPay thất bại</h2>
            <p>Mã đơn hàng: <strong>${vnp_TxnRef || ""}</strong></p>
            <p>Mã lỗi: <strong>${vnp_ResponseCode || "?"}</strong></p>
            <p>Vui lòng thử lại hoặc chọn phương thức khác.</p>
            <a href="/" class="btn">Quay về trang chủ</a>
          </div>
        </body>
      </html>
    `);
  }
});

// IPN URL — VNPay gọi server để cập nhật kết quả (server-to-server)
app.get("/api/vnpay/ipn", async (req, res) => {
  try {
    const query = req.query;

    // Verify signature
    const isValidSignature = vnpayService.verifyVNPaySignature(
      query,
      process.env.VNPAY_HASH_SECRET || "",
    );

    if (!isValidSignature) {
      console.error("[VNPay IPN] Chữ ký không hợp lệ:", query);
      return res
        .status(200)
        .json({ RspCode: "97", Message: "Invalid signature" });
    }

    const { vnp_ResponseCode, vnp_TransactionStatus, vnp_TxnRef, vnp_Amount } =
      query;

    console.log("[VNPay IPN] Kết quả:", {
      orderId: vnp_TxnRef,
      responseCode: vnp_ResponseCode,
      status: vnp_TransactionStatus,
    });

    if (vnp_ResponseCode === "00" && vnp_TransactionStatus === "00") {
      // Thanh toán thành công — lưu vào DB
      try {
        const [existing] = await db.query(
          "SELECT payment_ID FROM Payment WHERE vnpay_txn_ref = ?",
          [vnp_TxnRef],
        );

        if (Array.isArray(existing) && existing.length === 0) {
          await db.query(
            `INSERT INTO Payment (order_ID, date, payment_method, payment_status, vnpay_txn_ref, vnpay_amount, vnpay_response_code)
             VALUES (?, CURDATE(), 'vnpay', 'success', ?, ?, ?, ?)`,
            [
              vnp_TxnRef || null,
              vnp_TxnRef,
              vnp_Amount ? Number(vnp_Amount) / 100 : 0,
              vnp_ResponseCode,
            ],
          );
          console.log("[VNPay IPN] Đã lưu thanh toán:", vnp_TxnRef);
        }
      } catch (dbError) {
        console.error("[VNPay IPN] Lỗi lưu DB:", dbError.message);
      }

      return res
        .status(200)
        .json({ RspCode: "00", Message: "Confirm Success" });
    } else {
      return res
        .status(200)
        .json({ RspCode: "00", Message: "Confirm Success" });
    }
  } catch (error) {
    console.error("[VNPay IPN] Lỗi xử lý:", error.message);
    res.status(200).json({ RspCode: "99", Message: "Unknown error" });
  }
});

/* ================= MOMO PAYMENT API ================= */

// Tạo mã thanh toán MoMo QR
app.post("/api/momo/create", async (req, res) => {
  try {
    const {
      amount,
      orderId,
      orderInfo,
      redirectUrl,
      ipnUrl,
      customerName,
      customerPhone,
      customerEmail,
    } = req.body;

    if (!amount || !orderId) {
      return res.status(400).json({
        success: false,
        message: "amount và orderId là bắt buộc",
      });
    }

    const result = await momoService.createMoMoPayment({
      amount: Number(amount),
      orderId,
      orderInfo: orderInfo || `Thanh toan don hang ${orderId}`,
      redirectUrl: redirectUrl || "",
      ipnUrl: ipnUrl || "",
      customerName: customerName || "",
      customerPhone: customerPhone || "",
      customerEmail: customerEmail || "",
    });

    res.status(200).json({
      success: true,
      data: {
        requestId: result.requestId,
        orderId,
        amount: Number(amount),
        payUrl: result.payUrl,
        qrCodeUrl: result.qrCodeUrl,
        deepLink: result.deepLink,
        deeplinkWeb: result.deeplinkWeb,
        deeplinkApp: result.deeplinkApp,
        isMock: Boolean(result.isMock),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Tạo mã QR cố định (cho test/demo)
app.post("/api/momo/create-qr", async (req, res) => {
  try {
    const { amount, orderId, orderInfo } = req.body;

    if (!amount || !orderId) {
      return res.status(400).json({
        success: false,
        message: "amount và orderId là bắt buộc",
      });
    }

    const result = await momoService.createMoMoQRCode({
      amount: Number(amount),
      orderId,
      orderInfo: orderInfo || `Thanh toan don hang ${orderId}`,
    });

    res.status(200).json({
      success: true,
      data: {
        requestId: result.requestId,
        orderId, // echo lại orderId nội bộ
        amount: Number(amount),
        payUrl: result.payUrl,
        qrCodeUrl: result.qrCodeUrl,
        deepLink: result.deepLink,
        deeplinkWeb: result.deeplinkWeb,
        deeplinkApp: result.deeplinkApp,
        isMock: Boolean(result.isMock),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Webhook / IPN từ MoMo (server gọi về khi thanh toán thành công)
app.post("/api/momo/ipn", async (req, res) => {
  try {
    const body = req.body;

    // Xác minh chữ ký MoMo
    const rawSignatureData = momoService.buildRawSignatureFromWebhook(body);
    const isValidSignature = momoService.verifyMoMoSignature(
      rawSignatureData,
      body.signature || "",
    );

    if (!isValidSignature) {
      console.error("[MoMo IPN] Chữ ký không hợp lệ:", body);
      return res
        .status(400)
        .json({ success: false, message: "Invalid signature" });
    }

    console.log("[MoMo IPN] Thanh toán thành công:", {
      orderId: body.orderId,
      amount: body.amount,
      transId: body.transId,
      resultCode: body.resultCode,
    });

    // Lưu payment vào database
    if (body.resultCode === 0) {
      try {
        const [existingPayment] = await db.query(
          "SELECT payment_ID FROM Payment WHERE momo_order_id = ?",
          [body.orderId],
        );

        if (Array.isArray(existingPayment) && existingPayment.length === 0) {
          await db.query(
            `INSERT INTO Payment (order_ID, date, payment_method, payment_status, momo_order_id, momo_transaction_id, momo_amount, momo_result_code)
             VALUES (?, CURDATE(), 'momo', 'success', ?, ?, ?, ?)`,
            [
              body.orderId || null,
              body.orderId,
              body.transId,
              body.amount,
              body.resultCode,
            ],
          );
          console.log("[MoMo IPN] Đã lưu thanh toán vào DB:", body.orderId);
        }
      } catch (dbError) {
        console.error("[MoMo IPN] Lỗi lưu DB:", dbError.message);
      }
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("[MoMo IPN] Lỗi xử lý:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Callback từ MoMo (trình duyệt chuyển hướng về sau khi thanh toán)
app.get("/api/momo/callback", (req, res) => {
  const { resultCode, orderId } = req.query;

  if (resultCode === "0") {
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Thanh toán thành công</title>
          <style>
            body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #f0fdf4; }
            .card { background: white; padding: 40px; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.1); text-align: center; max-width: 400px; }
            .icon { font-size: 64px; color: #10b981; }
            h2 { color: #065f46; margin: 16px 0 8px; }
            p { color: #6b7280; margin: 8px 0; }
            .btn { display: inline-block; margin-top: 20px; padding: 12px 24px; background: #10b981; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="icon">✅</div>
            <h2>Thanh toán thành công!</h2>
            <p>Mã đơn hàng: <strong>${orderId || ""}</strong></p>
            <p>Cảm ơn bạn đã sử dụng dịch vụ MoMo.</p>
            <a href="/" class="btn">Quay về trang chủ</a>
          </div>
        </body>
      </html>
    `);
  } else {
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Thanh toán thất bại</title>
          <style>
            body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #fef2f2; }
            .card { background: white; padding: 40px; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.1); text-align: center; max-width: 400px; }
            .icon { font-size: 64px; color: #ef4444; }
            h2 { color: #991b1b; margin: 16px 0 8px; }
            p { color: #6b7280; margin: 8px 0; }
            .btn { display: inline-block; margin-top: 20px; padding: 12px 24px; background: #ef4444; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="icon">❌</div>
            <h2>Thanh toán thất bại</h2>
            <p>Mã đơn hàng: <strong>${orderId || ""}</strong></p>
            <p>Vui lòng thử lại hoặc chọn phương thức khác.</p>
            <a href="/" class="btn">Quay về trang chủ</a>
          </div>
        </body>
      </html>
    `);
  }
});

// Kiểm tra trạng thái thanh toán MoMo
app.get("/api/momo/status", async (req, res) => {
  try {
    const { orderId } = req.query;

    if (!orderId) {
      return res
        .status(400)
        .json({ success: false, message: "orderId là bắt buộc" });
    }

    const result = await momoService.getMoMoTransactionStatus(orderId);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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

export const startServer = (port = process.env.PORT || 3000) => {
  return app.listen(port, () => {
    console.log("Server running on port", port);
  });
};

const currentFile = fileURLToPath(import.meta.url);
const entryFile = process.argv[1] ? path.resolve(process.argv[1]) : "";

if (entryFile && path.resolve(currentFile) === entryFile) {
  startServer();
}
