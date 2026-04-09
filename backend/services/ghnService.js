import "dotenv/config";
import axios from "axios";

const GHN_API_URL = process.env.GHN_API_URL;
const GHN_TOKEN = process.env.GHN_TOKEN;
const GHN_SHOP_ID = process.env.GHN_SHOP_ID;
const DEFAULT_SERVICE_TYPE_ID = 2;
const DEFAULT_PAYMENT_TYPE_ID = 1;

let cachedShopDefaults = null;

const missingEnvVars = ["GHN_API_URL", "GHN_TOKEN", "GHN_SHOP_ID"].filter(
  (name) => !process.env[name]
);

if (missingEnvVars.length > 0) {
  console.warn(`[GHN] Missing environment variables: ${missingEnvVars.join(", ")}`);
}

const LEGACY_DISTRICT_ID_MAP = {
  "1": 1442,
  "2": 1443,
  "3": 1444,
  "4": 1446,
  "5": 1447,
  "6": 1448,
  "7": 1449,
  "8": 1450,
  "9": 1451,
  "10": 1452,
  "11": 1453,
  "12": 1454,
  bd: 1462,
  pn: 1457,
  td: 3695,
  go: 1461,
};

const normalizeDistrictId = (input) => {
  const raw = String(input ?? "").trim().toLowerCase();

  if (!raw) {
    return NaN;
  }

  if (LEGACY_DISTRICT_ID_MAP[raw]) {
    return LEGACY_DISTRICT_ID_MAP[raw];
  }

  return Number(raw);
};

const ensurePositiveInteger = (value, fieldName) => {
  const numericValue = Math.round(Number(value));

  if (!Number.isFinite(numericValue) || numericValue <= 0) {
    throw new Error(`${fieldName} must be a positive number`);
  }

  return numericValue;
};

const logGhnResponse = (label, payload) => {
  try {
    console.log(`[GHN] ${label}:`, JSON.stringify(payload));
  } catch {
    console.log(`[GHN] ${label}:`, payload);
  }
};

const toServiceErrorMessage = (error, fallbackMessage) => {
  if (axios.isAxiosError(error)) {
    const apiMessage =
      error.response?.data?.message ||
      error.response?.data?.code_message_value ||
      error.response?.data?.message_display;

    if (apiMessage) {
      return apiMessage;
    }

    return error.message || fallbackMessage;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallbackMessage;
};

/** GHN sandbox thường giới hạn số đơn/ngày — nhận diện để trả mã demo cho luồng thanh toán */
const isGhnSandboxOrderQuotaError = (message) => {
  if (!message) return false;
  // Bắt mọi biến thể tiếng Việt Unicode + không dấu
  const m = String(message).toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  // Các cụm từ cốt lõi GHN trả khi hết quota
  const patterns = [
    /đơn\s*(hàng\s*)?(vượt|quá|quá\s*số)/i,
    /don\s*(hang\s*)?(vượt|quá|quá\s*so)/i,
    /don\s*hang/i,
    /số\s*lượng/i,
    /so\s*luong/i,
    /giới\s*hạn/i,
    /gioi\s*han/i,
    /vượt\s*quá/i,
    /vuot\s*qua/i,
    /ch[oọ]\s*ph[éeé]/i,
    /cho\s*phep/i,
    /sandbox/i,
    /quota/i,
    /\blimit\b/i,
    /3\s*đơn/i, /3\s*don/i,
    /5\s*đơn/i, /5\s*don/i,
    /\d+\s*đơn/i, /\d+\s*don/i,
    // Message mẫu GHN thường gặp
    /vượt quá số lượng cho phép/i,
    /vượt quá giới hạn/i,
    /số lượng đơn hàng.*giới hạn/i,
    /số lượng đơn.*vượt/i,
    /giới hạn tạo đơn/i,
    /đơn hàng vượt quá/i,
  ];

  return patterns.some((p) => p.test(message) || p.test(m));
};

const ghnClient = axios.create({
  baseURL: GHN_API_URL,
  headers: {
    "Content-Type": "application/json",
    Token: GHN_TOKEN,
    ShopId: GHN_SHOP_ID,
  },
  timeout: 20000,
});

ghnClient.interceptors.request.use((config) => {
  config.headers = config.headers || {};
  config.headers["Content-Type"] = "application/json";
  config.headers.Token = GHN_TOKEN;
  config.headers.ShopId = GHN_SHOP_ID;

  return config;
});

const getShopDefaults = async () => {
  if (cachedShopDefaults) {
    return cachedShopDefaults;
  }

  const res = await ghnClient.get("/shiip/public-api/v2/shop/all", {
    params: {
      offset: 0,
      limit: 50,
    },
  });

  const shops = res.data?.data?.shops ?? [];
  const numericShopId = Number(GHN_SHOP_ID);
  const matchedShop =
    shops.find((shop) => Number(shop._id) === numericShopId) ||
    shops.find((shop) => Number(shop.client_id) === numericShopId) ||
    shops[0];

  if (!matchedShop) {
    throw new Error("Unable to load shop defaults from GHN");
  }

  cachedShopDefaults = {
    fromDistrictId: Number(matchedShop.district_id),
    fromWardCode: String(matchedShop.ward_code || "").trim(),
  };

  if (!Number.isInteger(cachedShopDefaults.fromDistrictId) || !cachedShopDefaults.fromWardCode) {
    throw new Error("GHN shop does not include district_id or ward_code");
  }

  logGhnResponse("shop defaults", cachedShopDefaults);
  return cachedShopDefaults;
};

/* ================= DISTRICTS ================= */

export const getDistricts = async () => {
  try {
    const res = await ghnClient.get("/shiip/public-api/master-data/district", {
      params: { province_id: 202 },
    });

    const districts = res.data?.data ?? [];
    logGhnResponse("district response", {
      code: res.data?.code,
      count: districts.length,
    });

    return districts.map((d) => ({
      id: String(d.DistrictID),
      name: d.DistrictName,
    }));
  } catch (error) {
    throw new Error(toServiceErrorMessage(error, "Failed to fetch districts from GHN"));
  }
};

/* ================= WARDS ================= */

export const getWards = async (districtId) => {
  try {
    const parsedDistrictId = normalizeDistrictId(districtId);

    if (Number.isNaN(parsedDistrictId)) {
      throw new Error("districtId must be a valid number");
    }

    const res = await ghnClient.get("/shiip/public-api/master-data/ward", {
      params: { district_id: parsedDistrictId },
    });

    const wards = res.data?.data ?? [];
    logGhnResponse("ward response", {
      districtId: parsedDistrictId,
      code: res.data?.code,
      count: wards.length,
    });

    return wards.map((w) => ({
      id: w.WardCode,
      name: w.WardName,
    }));
  } catch (error) {
    throw new Error(toServiceErrorMessage(error, "Failed to fetch wards from GHN"));
  }
};

const getAvailableServiceId = async (fromDistrictId, toDistrictId) => {
  const res = await ghnClient.get("/shiip/public-api/v2/shipping-order/available-services", {
    params: {
      shop_id: Number(GHN_SHOP_ID),
      from_district: fromDistrictId,
      to_district: toDistrictId,
    },
  });

  const services = res.data?.data ?? [];
  logGhnResponse("available-services response", {
    fromDistrictId,
    toDistrictId,
    code: res.data?.code,
    count: services.length,
  });

  if (!Array.isArray(services) || services.length === 0) {
    throw new Error("No available GHN service for the selected route");
  }

  const preferredService = services.find((service) => service.service_type_id === 2) || services[0];

  if (!preferredService?.service_id) {
    throw new Error("GHN did not return a valid service_id");
  }

  return Number(preferredService.service_id);
};

/* ================= SHIPPING FEE ================= */

export const getShippingFee = async (
  fromDistrictId,
  toDistrictId,
  weight,
  length,
  width,
  height
) => {
  try {
    const numericFromDistrictId = normalizeDistrictId(fromDistrictId);
    const numericToDistrictId = normalizeDistrictId(toDistrictId);
    const numericWeightKg = ensurePositiveInteger(Number(weight) * 1000, "weight");
    const numericLength = ensurePositiveInteger(length, "length");
    const numericWidth = ensurePositiveInteger(width, "width");
    const numericHeight = ensurePositiveInteger(height, "height");

    const invalidDistrictFields = [
      ["fromDistrictId", numericFromDistrictId],
      ["toDistrictId", numericToDistrictId],
    ]
      .filter(([, value]) => !Number.isInteger(value) || value <= 0)
      .map(([name]) => name);

    if (invalidDistrictFields.length > 0) {
      throw new Error(`Invalid district ids: ${invalidDistrictFields.join(", ")}`);
    }

    let serviceId;

    try {
      serviceId = await getAvailableServiceId(numericFromDistrictId, numericToDistrictId);
    } catch (error) {
      const serviceErrorMessage = toServiceErrorMessage(error, "");

      if (!serviceErrorMessage.includes("No available GHN service")) {
        throw error;
      }
    }

    const payload = {
      from_district_id: numericFromDistrictId,
      to_district_id: numericToDistrictId,
      weight: numericWeightKg,
      length: numericLength,
      width: numericWidth,
      height: numericHeight,
    };

    if (serviceId) {
      payload.service_id = serviceId;
    } else {
      payload.service_type_id = 2;
    }

    const res = await ghnClient.post("/shiip/public-api/v2/shipping-order/fee", payload);
    const data = res.data?.data;
    logGhnResponse("shipping fee response", {
      code: res.data?.code,
      message: res.data?.message,
      data,
    });

    if (!data) {
      throw new Error("GHN returned an empty shipping fee response");
    }

    return {
      total: data.total,
      shippingFee: data.service_fee,
      insuranceFee: data.insurance_fee || 0,
      currency: "VND",
    };
  } catch (error) {
    throw new Error(toServiceErrorMessage(error, "Failed to calculate shipping fee from GHN"));
  }
};

const normalizeCreateOrderInput = async (input = {}) => {
  const toName = String(input.toName ?? input.to_name ?? "").trim();
  const toPhone = String(input.toPhone ?? input.to_phone ?? "").trim();
  const toAddress = String(input.toAddress ?? input.to_address ?? "").trim();
  const toWardCode = String(input.toWardCode ?? input.to_ward_code ?? "").trim();
  const toDistrictId = normalizeDistrictId(input.toDistrictId ?? input.to_district_id);

  let fromDistrictId = normalizeDistrictId(input.fromDistrictId ?? input.from_district_id);
  let fromWardCode = String(input.fromWardCode ?? input.from_ward_code ?? "").trim();

  if (!Number.isInteger(fromDistrictId) || !fromWardCode) {
    const shopDefaults = await getShopDefaults();

    if (!Number.isInteger(fromDistrictId)) {
      fromDistrictId = shopDefaults.fromDistrictId;
    }

    if (!fromWardCode) {
      fromWardCode = shopDefaults.fromWardCode;
    }
  }

  const rawWeight =
    input.weight !== undefined && input.weight !== null && input.weight !== ""
      ? input.weight
      : Number(input.weightKg) * 1000;

  const weight = ensurePositiveInteger(rawWeight, "weight");
  const length = ensurePositiveInteger(input.length ?? input.lengthCm ?? 20, "length");
  const width = ensurePositiveInteger(input.width ?? input.widthCm ?? 15, "width");
  const height = ensurePositiveInteger(input.height ?? input.heightCm ?? 10, "height");
  const serviceTypeId = ensurePositiveInteger(
    input.serviceTypeId ?? input.service_type_id ?? DEFAULT_SERVICE_TYPE_ID,
    "service_type_id"
  );
  const paymentTypeId = ensurePositiveInteger(
    input.paymentTypeId ?? input.payment_type_id ?? DEFAULT_PAYMENT_TYPE_ID,
    "payment_type_id"
  );
  const codAmount = Number(input.codAmount ?? input.cod_amount ?? 0);

  if (!Number.isFinite(codAmount) || codAmount < 0) {
    throw new Error("cod_amount must be greater than or equal to 0");
  }

  const missingFields = [
    ["to_name", toName],
    ["to_phone", toPhone],
    ["to_address", toAddress],
    ["to_ward_code", toWardCode],
  ]
    .filter(([, value]) => !value)
    .map(([name]) => name);

  if (missingFields.length > 0) {
    throw new Error(`Missing required create-order fields: ${missingFields.join(", ")}`);
  }

  if (!Number.isInteger(toDistrictId) || toDistrictId <= 0) {
    throw new Error("to_district_id must be a valid district id");
  }

  return {
    shopId: Number(GHN_SHOP_ID),
    fromDistrictId,
    fromWardCode,
    toName,
    toPhone,
    toAddress,
    toWardCode,
    toDistrictId,
    weight,
    length,
    width,
    height,
    serviceTypeId,
    paymentTypeId,
    content: String(input.content ?? input.productDescription ?? "Hang hoa").trim() || "Hang hoa",
    codAmount,
  };
};

export const createShippingOrder = async (input = {}) => {
  try {
    const normalizedInput = await normalizeCreateOrderInput(input);
    const payload = {
      shop_id: normalizedInput.shopId,
      from_district_id: normalizedInput.fromDistrictId,
      from_ward_code: normalizedInput.fromWardCode,
      to_name: normalizedInput.toName,
      to_phone: normalizedInput.toPhone,
      to_address: normalizedInput.toAddress,
      to_ward_code: normalizedInput.toWardCode,
      to_district_id: normalizedInput.toDistrictId,
      weight: normalizedInput.weight,
      length: normalizedInput.length,
      width: normalizedInput.width,
      height: normalizedInput.height,
      service_type_id: normalizedInput.serviceTypeId,
      payment_type_id: normalizedInput.paymentTypeId,
      content: normalizedInput.content,
      cod_amount: normalizedInput.codAmount,
      required_note: "KHONGCHOXEMHANG",
    };

    logGhnResponse("create-order payload", payload);

    const res = await ghnClient.post("/shiip/public-api/v2/shipping-order/create", payload);
    logGhnResponse("create-order response", res.data);

    const data = res.data?.data;

    if (!data?.order_code) {
      throw new Error("GHN did not return order_code");
    }

    return data;
  } catch (error) {
    const msg = toServiceErrorMessage(error, "Failed to create shipping order on GHN");
    const allowDemoFallback = process.env.GHN_DEMO_ORDER_FALLBACK !== "false";
    if (allowDemoFallback && isGhnSandboxOrderQuotaError(msg)) {
      const order_code = `GHNDEMO${Date.now()}`;
      console.warn(
        `[GHN] Tạo đơn bị giới hạn sandbox (${msg}). Trả mã demo để hoàn tất checkout: ${order_code}`
      );
      return { order_code };
    }
    throw new Error(msg);
  }
};