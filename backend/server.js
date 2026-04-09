import "dotenv/config";
import express from "express";
import cors from "cors";
import * as ghnService from "./services/ghnService.js";
import db from "./services/db.js";

const requiredEnvVars = ["GHN_API_URL", "GHN_TOKEN", "GHN_SHOP_ID"];
const missingEnvVars = requiredEnvVars.filter((name) => !process.env[name]);

console.log("[ENV] GHN_API_URL:", process.env.GHN_API_URL || "(missing)");
console.log("[ENV] GHN_SHOP_ID:", process.env.GHN_SHOP_ID || "(missing)");
console.log("[ENV] GHN_TOKEN loaded:", Boolean(process.env.GHN_TOKEN));

if (missingEnvVars.length > 0) {
  console.warn(`[ENV] Missing variables: ${missingEnvVars.join(", ")}`);
}

const app = express();

app.use(cors());
app.use(express.json());
import cartRoutes from "./services/cartService.js";

// ...

app.use("/api", cartRoutes);


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

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
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
