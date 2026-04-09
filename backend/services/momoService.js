/**
 * MoMo Payment Service
 * Tự động tạo mã thanh toán MoMo QR
 * Hướng dẫn đăng ký: https://developers.momo.vn/
 */

import "dotenv/config";
import crypto from "crypto";
import QRCode from "qrcode";

const MOMOPAY_HOST =
  process.env.MOMO_ENV === "production"
    ? "https://api.momo.vn"
    : "https://test-payment.momo.vn";

const PARTNER_CODE = process.env.MOMO_PARTNER_CODE || "";
const PARTNER_KEY = process.env.MOMO_PARTNER_KEY || "";
const ACCESS_KEY = process.env.MOMO_ACCESS_KEY || "";
const API_VERSION = "/v2/gateway/api/create";
const API_VERSION_QR = "/v2/gateway/api/create";

// ============================================================
// CHẾ ĐỘ MOCK — không cần tài khoản MoMo
// Bật bằng cách đặt MOMO_MOCK=true trong .env
// ============================================================
const MOMO_MOCK = process.env.MOMO_MOCK === "true";

const MOCK_MOMO_PHONE = process.env.MOCK_MOMO_PHONE || "0856567890";

// ============================================================
// Helper function tạo response mock cho createMoMoPayment
// ============================================================
async function createMockResponse(orderId, amount, requestId) {
  const qrDataUrl = await generateMoMoQRDataUrl(orderId, amount);
  return {
    requestId,
    orderId,
    amount,
    payUrl: "",
    qrCodeUrl: qrDataUrl,
    deepLink: `momo://app?action=pay&orderId=${orderId}&amount=${amount}`,
    deeplinkWeb: "",
    deeplinkApp: `momo://app?action=pay&orderId=${orderId}&amount=${amount}`,
    instructions: "Đây là chế độ DEMO - không cần quét thật. Số tiền: " + amount.toLocaleString() + " VND",
    signature: "MOCK_SIGNATURE",
    isMock: true,
  };
}

// ============================================================
// Helper function tạo QR mock cho createMoMoQRCode
// ============================================================
async function createMockQRResponse(orderId, amount, requestId) {
  const qrDataUrl = await generateMoMoQRDataUrl(orderId, amount);
  return {
    requestId,
    orderId,
    amount,
    payUrl: "",
    qrCodeUrl: qrDataUrl,
    deepLink: `momo://app?action=pay&orderId=${orderId}&amount=${amount}`,
    deeplinkWeb: "",
    deeplinkApp: `momo://app?action=pay&orderId=${orderId}&amount=${amount}`,
    isMock: true,
  };
}

// ============================================================
// Tạo QR code VietQR chuẩn cho MoMo (tĩnh, dùng cho cả mock & thật)
// Format VietQR: https://vietqr.net/
// Bank ID MoMo: MOMO
// ============================================================
async function generateMoMoQRDataUrl(orderId, amount) {
  // Format VietQR - mã chuẩn VietNam QR
  // 00: Payload Format
  // 01: Point of Initiation Method (01 = dynamic, 02 = static)
  // 38: VietQR Identifier
  // 53: Service Code
  // 58: Bank ID (National Code)
  // 63: CRC
  const bankId = "MOMO"; // MoMo VietQR bank code
  const accountNumber = process.env.MOCK_MOMO_PHONE || "0856567890";

  // Format VietQR chuẩn (payload phiên bản 01)
  const amountStr = String(amount);
  const vietqrPayload = [
    `00${"01".length + 1}01`,                                    // 01: Payload Format Indicator
    `00${"2".length + 1}2`,                                       // 02: Point of Initiation Method (2 = static)
    `00${"01".length + 1}01`,                                     // 38: VietQR
    `00${"11".length + 1}11`,                                     // 53: Merchant Category Code (General)
    `00${bankId.length + 1}${bankId}`,                            // 58: Acquiring Bank
    `00${accountNumber.length + 1}${accountNumber}`,             // 59: Merchant Account Number (MoMo phone)
    `00${orderId.length + 1}${orderId}`,                          // 62: Additional Data - Order ID
    `00${"02".length + 1}02`,                                     // 63: CRC (placeholder, updated below)
  ];

  // Tính CRC-16 cho VietQR payload
  const crcPayload = vietqrPayload.join("").replace(/\+$/, "") + "6304";
  const crc = calculateCRC16(crcPayload);

  // Build full payload với CRC cuối cùng
  const fullPayload = vietqrPayload.map((field, i) => {
    if (i === vietqrPayload.length - 1) {
      // Field 63 (CRC) - tính CRC thực sự
      return `63${String(crc.length).padStart(2, "0")}${crc}`;
    }
    return field;
  }).join("");

  const qrRawData = fullPayload;

  // Tạo QR image với nền trắng, bo góc, border trắng
  return await QRCode.toDataURL(qrRawData, {
    errorCorrectionLevel: "M",
    type: "image/png",
    width: 400,
    margin: 2,
    color: {
      dark: "#000000",
      light: "#FFFFFF",
    },
  });
}

// ============================================================
// Tính CRC-16 (CCITT) cho VietQR
// ============================================================
function calculateCRC16(str) {
  let crc = 0xFFFF;
  const polynomial = 0x1021;

  for (let i = 0; i < str.length; i++) {
    crc ^= (str.charCodeAt(i) << 8);
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = ((crc << 1) ^ polynomial) & 0xFFFF;
      } else {
        crc = (crc << 1) & 0xFFFF;
      }
    }
  }

  return crc.toString(16).toUpperCase().padStart(4, "0");
}

/**
 * Tạo chữ ký HMAC SHA256 cho request
 */
function createSignature(rawData) {
  return crypto
    .createHmac("sha256", PARTNER_KEY)
    .update(rawData)
    .digest("hex");
}

/**
 * Tạo requestId độc nhất
 */
function generateRequestId() {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Tạo orderId độc nhất cho đơn hàng MoMo
 */
export function generateOrderId() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substr(2, 5).toUpperCase();
  return `MOMO${timestamp}${random}`;
}

/**
 * Tạo payment QR code từ MoMo
 * @param {Object} params
 * @param {number} params.amount - Số tiền thanh toán (VND)
 * @param {string} params.orderId - Mã đơn hàng nội bộ
 * @param {string} params.orderInfo - Thông tin đơn hàng
 * @param {string} params.redirectUrl - URL chuyển hướng sau thanh toán
 * @param {string} params.ipnUrl - URL nhận thông báo thanh toán
 * @param {string} params.customerName - Tên khách hàng
 * @param {string} params.customerPhone - SĐT khách hàng
 * @param {string} params.customerEmail - Email khách hàng
 */
export async function createMoMoPayment({
  amount,
  orderId,
  orderInfo,
  redirectUrl = "",
  ipnUrl = "",
  customerName = "",
  customerPhone = "",
  customerEmail = "",
} = {}) {
  // ── CHẾ ĐỘ MOCK ──────────────────────────────────────────
  if (MOMO_MOCK) {
    console.log(`[MoMo MOCK] Tạo thanh toán mock cho đơn hàng ${orderId}, số tiền ${amount} VND`);
    return await createMockResponse(orderId, amount, "MOCK_PAY_" + Date.now());
  }
  // ─────────────────────────────────────────────────────────

  if (!PARTNER_CODE || !PARTNER_KEY || !ACCESS_KEY) {
    throw new Error(
      "Thiếu cấu hình MoMo. Vui lòng kiểm tra MOMO_PARTNER_CODE, MOMO_PARTNER_KEY, MOMO_ACCESS_KEY trong .env"
    );
  }

  const requestId = generateRequestId();
  const requestType = "captureWallet";

  // Build raw data để tạo signature (thứ tự theo tài liệu MoMo)
  const rawSignatureData = [
    `accessKey=${ACCESS_KEY}`,
    `amount=${amount}`,
    `extraData=${Buffer.from(JSON.stringify({})).toString("base64")}`,
    `ipnUrl=${ipnUrl}`,
    `orderId=${orderId}`,
    `orderInfo=${orderInfo}`,
    `partnerCode=${PARTNER_CODE}`,
    `redirectUrl=${redirectUrl}`,
    `requestId=${requestId}`,
    `requestType=${requestType}`,
  ].join("&");

  const signature = createSignature(rawSignatureData);

  const payload = {
    partnerCode: PARTNER_CODE,
    partnerName: "Test",
    storeId: PARTNER_CODE,
    requestId,
    amount: Number(amount),
    orderId: String(orderId),
    orderInfo: String(orderInfo),
    redirectUrl: String(redirectUrl),
    ipnUrl: String(ipnUrl),
    lang: "vi",
    userAgent: "Mozilla/5.0",
    requestType,
    signature,
    extraData: Buffer.from(JSON.stringify({})).toString("base64"),
    customerName: String(customerName),
    customerPhone: String(customerPhone),
    customerEmail: String(customerEmail),
  };

  const url = `${MOMOPAY_HOST}${API_VERSION}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (data.resultCode !== 0) {
      throw new Error(
        `MoMo từ chối thanh toán (mã ${data.resultCode}): ${data.message}`
      );
    }

    return {
      requestId,
      orderId,
      amount,
      payUrl: data.payUrl,
      qrCodeUrl: data.qrCodeUrl,
      deepLink: data.deepLink,
      deeplinkWeb: data.deeplinkWeb,
      deeplinkApp: data.deeplinkApp,
      // Thông tin cho frontend hiển thị QR
      instructions: data.instructions,
      signature,
    };
  } catch (error) {
    if (error.message.includes("MoMo từ chối")) {
      throw error;
    }
    throw new Error(`Kết nối MoMo thất bại: ${error.message}`);
  }
}

/**
 * Tạo QR code URL cho MoMo (phương thức thanh toán QR tĩnh)
 * Dùng cho hiển thị QR trực tiếp trên trang
 */
export async function createMoMoQRCode({
  amount,
  orderId,
  orderInfo,
} = {}) {
  // ── CHẾ ĐỘ MOCK ──────────────────────────────────────────
  if (MOMO_MOCK) {
    console.log(`[MoMo MOCK] Tạo QR mock cho đơn hàng ${orderId}, số tiền ${amount} VND`);
    return await createMockQRResponse(orderId, amount, "MOCK_QR_" + Date.now());
  }
  // ─────────────────────────────────────────────────────────

  if (!PARTNER_CODE || !PARTNER_KEY || !ACCESS_KEY) {
    throw new Error(
      "Thiếu cấu hình MoMo. Vui lòng kiểm tra .env"
    );
  }

  const requestId = generateRequestId();
  const requestType = "captureWallet";

  const rawSignatureData = [
    `accessKey=${ACCESS_KEY}`,
    `amount=${amount}`,
    `extraData=`,
    `orderId=${orderId}`,
    `orderInfo=${orderInfo}`,
    `partnerCode=${PARTNER_CODE}`,
    `requestId=${requestId}`,
    `requestType=${requestType}`,
  ].join("&");

  const signature = createSignature(rawSignatureData);

  const payload = {
    partnerCode: PARTNER_CODE,
    partnerName: "Test",
    storeId: PARTNER_CODE,
    requestId,
    amount: Number(amount),
    orderId: String(orderId),
    orderInfo: String(orderInfo),
    redirectUrl: "",
    ipnUrl: "",
    lang: "vi",
    userAgent: "Mozilla/5.0",
    requestType,
    signature,
    extraData: "",
  };

  const url = `${MOMOPAY_HOST}${API_VERSION}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (data.resultCode !== 0) {
      throw new Error(
        `MoMo từ chối thanh toán (mã ${data.resultCode}): ${data.message}`
      );
    }

    return {
      requestId,
      orderId,
      amount,
      payUrl: data.payUrl,
      qrCodeUrl: data.qrCodeUrl,
      deepLink: data.deepLink,
      deeplinkWeb: data.deeplinkWeb,
      deeplinkApp: data.deeplinkApp,
    };
  } catch (error) {
    if (error.message.includes("MoMo từ chối")) {
      throw error;
    }
    throw new Error(`Kết nối MoMo thất bại: ${error.message}`);
  }
}

/**
 * Xác minh chữ ký webhook từ MoMo
 */
export function verifyMoMoSignature(rawData, signature) {
  const expectedSignature = createSignature(rawData);
  return expectedSignature === signature;
}

/**
 * Tạo đối tượng raw data từ webhook callback
 */
export function buildRawSignatureFromWebhook(body) {
  const {
    partnerCode,
    orderId,
    requestId,
    amount,
    transId,
    resultCode,
  } = body;

  return [
    `partnerCode=${partnerCode}`,
    `orderId=${orderId}`,
    `requestId=${requestId}`,
    `amount=${amount}`,
    `transId=${transId}`,
    `resultCode=${resultCode}`,
  ].join("&");
}

/**
 * Lấy trạng thái thanh toán từ MoMo
 */
export async function getMoMoTransactionStatus(orderId) {
  // ── CHẾ ĐỘ MOCK ──────────────────────────────────────────
  if (MOMO_MOCK) {
    console.log(`[MoMo MOCK] Truy vấn trạng thái cho đơn hàng ${orderId}`);
    return {
      resultCode: 0,
      message: "Giao dịch thành công (MOCK)",
      orderId,
      transId: "MOCK_TRANS_" + Date.now(),
    };
  }
  // ─────────────────────────────────────────────────────────

  if (!PARTNER_CODE || !PARTNER_KEY || !ACCESS_KEY) {
    throw new Error("Thiếu cấu hình MoMo");
  }

  const requestId = generateRequestId();

  const rawSignatureData = [
    `accessKey=${ACCESS_KEY}`,
    `orderId=${orderId}`,
    `partnerCode=${PARTNER_CODE}`,
    `requestId=${requestId}`,
  ].join("&");

  const signature = createSignature(rawSignatureData);

  const payload = {
    partnerCode: PARTNER_CODE,
    partnerName: "Test",
    storeId: PARTNER_CODE,
    requestId,
    orderId: String(orderId),
    lang: "vi",
    signature,
  };

  const url = `${MOMOPAY_HOST}/v2/gateway/api/query`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    return await response.json();
  } catch (error) {
    throw new Error(`Truy vấn MoMo thất bại: ${error.message}`);
  }
}
