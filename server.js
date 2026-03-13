import "dotenv/config";
import express from "express";
import cors from "cors";
import * as ghnService from "./services/ghnService.js";

const app = express();

// Cho phép frontend (Vite dev hoặc production) gọi API
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

let users = [
  { id: 1, name: "An" },
  { id: 2, name: "Binh" },
  { id: 3, name: "Chau" },
];

let nextId = 4;

// GET all users
app.get("/users", (req, res) => {
  res.json(users);
});

// GET user by id
app.get("/users/:id", (req, res) => {
  const id = Number(req.params.id);
  const user = users.find((u) => u.id === id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json(user);
});

// CREATE user
app.post("/users", (req, res) => {
  const { name } = req.body;

  const newUser = {
    id: nextId++,
    name,
  };

  users.push(newUser);

  res.status(201).json(newUser);
});

// UPDATE user
app.put("/users/:id", (req, res) => {
  const id = Number(req.params.id);
  const { name } = req.body;

  const user = users.find((u) => u.id === id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  user.name = name;

  res.json(user);
});

// DELETE user
app.delete("/users/:id", (req, res) => {
  const id = Number(req.params.id);

  users = users.filter((u) => u.id !== id);

  res.json({ message: "User deleted" });
});

// ==================== SHIPPING API ====================

// GET /api/shipping/fee - Tính phí vận chuyển
app.get("/api/shipping/fee", async (req, res) => {
  try {
    const { fromDistrictId, toDistrictId, weightKg, lengthCm, widthCm, heightCm } = req.query;

    const result = await ghnService.getShippingFee(
      fromDistrictId,
      toDistrictId,
      weightKg,
      lengthCm,
      widthCm,
      heightCm
    );

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/shipping/order - Tạo đơn vận
app.post("/api/shipping/order", async (req, res) => {
  try {
    const orderData = req.body;

    const result = await ghnService.createShippingOrder(orderData);

    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/shipping/tracking - Theo dõi đơn hàng
app.get("/api/shipping/tracking", async (req, res) => {
  try {
    const { orderCode } = req.query;

    if (!orderCode) {
      return res.status(400).json({ message: "Thiếu mã đơn hàng" });
    }

    const result = await ghnService.getTrackingInfo(orderCode);

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/shipping/districts - Lấy danh sách quận/huyện
app.get("/api/shipping/districts", async (req, res) => {
  try {
    const result = await ghnService.getDistricts();
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/shipping/wards - Lấy danh sách phường/xã theo quận
app.get("/api/shipping/wards", async (req, res) => {
  try {
    const { districtId } = req.query;

    if (!districtId) {
      return res.status(400).json({ message: "Thiếu mã quận/huyện" });
    }

    const result = await ghnService.getWards(districtId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/shipping/services - Lấy danh sách dịch vụ có sẵn
app.get("/api/shipping/services", async (req, res) => {
  try {
    const { fromDistrictId, toDistrictId } = req.query;

    if (!toDistrictId) {
      return res.status(400).json({ message: "Thiếu mã quận/huyện đích" });
    }

    const result = await ghnService.getAvailableServices(fromDistrictId, toDistrictId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== END SHIPPING API ====================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});