/**
 * VNPay Payment Service
 * Tự động tạo URL thanh toán VNPay QR
 * Tài liệu: https://sandbox.vnpayment.vn/apis/docs/thanh-toan-pay/pay.html
 */

import "dotenv/config";
import crypto from "crypto";
import querystring from "querystring";
import QRCode from "qrcode";

// ============================================================
// Cấu hình
// ============================================================
const VNPAY_URL = process.env.VNPAY_URL || "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
const VNPAY_API_URL = process.env.VNPAY_API_URL || "https://sandbox.vnpayment.vn/merchant_webapi/api/transaction";
const VNPAY_TMN_CODE = process.env.VNPAY_TMN_CODE || "";
const VNPAY_HASH_SECRET = process.env.VNPAY_HASH_SECRET || "";

// ============================================================
// CHẾ ĐỘ MOCK — không cần tài khoản VNPay
// Bật bằng cách đặt VNPAY_MOCK=true trong .env
// ============================================================
const VNPAY_MOCK = process.env.VNPAY_MOCK === "true";

// ============================================================
// Sắp xếp object theo key tăng dần (bắt buộc cho VNPay checksum)
// ============================================================
function sortObject(obj) {
  const sorted = {};
  const keys = Object.keys(obj).sort();
  for (const key of keys) {
    if (obj[key] !== null && obj[key] !== undefined && obj[key] !== "") {
      sorted[key] = obj[key];
    }
  }
  return sorted;
}

/**
 * Tạo secure hash HMAC SHA512 cho VNPay
 */
function createSecureHash(hashData, secret) {
  return crypto
    .createHmac("sha512", Buffer.from(secret, "utf-8"))
    .update(Buffer.from(hashData, "utf-8"))
    .digest("hex");
}

/**
 * Sinh order ID nội bộ
 */
export function generateOrderId() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substr(2, 5).toUpperCase();
  return `VNPAY${timestamp}${random}`;
}

/**
 * Lấy client IP từ request
 */
export function getClientIp(req) {
  return (
    req.headers["x-forwarded-for"] ||
    req.headers["x-real-ip"] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    req.ip ||
    "127.0.0.1"
  );
}

async function paymentUrlToQrDataUrl(paymentUrl) {
  return QRCode.toDataURL(paymentUrl, {
    errorCorrectionLevel: "M",
    type: "image/png",
    width: 400,
    margin: 2,
    color: {
      dark: "#0f766e",
      light: "#ffffff",
    },
  });
}

// ============================================================
// Tạo URL thanh toán VNPay (+ QR mã hóa URL thanh toán)
// ============================================================
export async function createVNPayUrl({ orderId, amount, orderInfo, returnUrl, ipAddr }) {
  let result;

  // ── CHẾ ĐỘ MOCK ──────────────────────────────────────────
  if (VNPAY_MOCK) {
    console.log(`[VNPay MOCK] Tạo URL mock cho đơn hàng ${orderId}, số tiền ${amount} VND`);
    const mockTxnRef = `MOCK_${Date.now()}`;
    const paymentUrl = `${VNPAY_URL}?vnp_TxnRef=${mockTxnRef}&vnp_Amount=${amount * 100}&vnp_Command=pay&vnp_CreateDate=${formatDate(new Date())}&vnp_CurrCode=VND&vnp_IpAddr=${encodeURIComponent(String(ipAddr))}&vnp_Locale=vn&vnp_OrderInfo=${encodeURIComponent(orderInfo || "Thanh toan mock")}&vnp_OrderType=other&vnp_ReturnUrl=${encodeURIComponent(returnUrl)}&vnp_TmnCode=DEMOV210&vnp_Version=2.1.0&vnp_SecureHash=MOCK_HASH`;
    result = {
      paymentUrl,
      orderId: mockTxnRef,
      amount,
      isMock: true,
    };
  } else {
    // ─────────────────────────────────────────────────────────
    if (!VNPAY_TMN_CODE || !VNPAY_HASH_SECRET) {
      throw new Error(
        "Thiếu cấu hình VNPay. Vui lòng kiểm tra VNPAY_TMN_CODE, VNPAY_HASH_SECRET trong .env"
      );
    }

    const date = new Date();
    const createDate = formatDate(date);

    const expireDate = new Date(date.getTime() + 15 * 60 * 1000);
    const expireDateStr = formatDate(expireDate);

    const vnp_Params = {
      vnp_Version: "2.1.0",
      vnp_Command: "pay",
      vnp_TmnCode: VNPAY_TMN_CODE,
      vnp_Locale: "vn",
      vnp_CurrCode: "VND",
      vnp_TxnRef: orderId,
      vnp_OrderInfo: orderInfo || `Thanh toan don hang ${orderId}`,
      vnp_OrderType: "other",
      vnp_Amount: amount * 100,
      vnp_ReturnUrl: returnUrl,
      vnp_IpAddr: ipAddr,
      vnp_CreateDate: createDate,
      vnp_ExpireDate: expireDateStr,
    };

    const sorted = sortObject(vnp_Params);
    const hashData = querystring.stringify(sorted, { encode: false });
    const secureHash = createSecureHash(hashData, VNPAY_HASH_SECRET);
    const paymentUrl = `${VNPAY_URL}?${querystring.stringify(sorted, { encode: true })}&vnp_SecureHash=${secureHash}`;

    result = {
      paymentUrl,
      orderId,
      amount,
      isMock: false,
    };
  }

  result.qrCodeUrl = await paymentUrlToQrDataUrl(result.paymentUrl);
  return result;
}

/**
 * Xác minh checksum từ VNPay return/IPN
 */
export function verifyVNPaySignature(queryParams, secret) {
  const { vnp_SecureHash, vnp_SecureHashType, ...inputData } = queryParams;
  if (!vnp_SecureHash) return false;

  const sorted = sortObject(inputData);
  const hashData = querystring.stringify(sorted, { encode: false });
  const expectedHash = createSecureHash(hashData, secret);

  return expectedHash === vnp_SecureHash;
}

/**
 * Lấy thông tin kết quả từ VNPay return
 */
export function parseVNPayReturn(query) {
  const {
    vnp_ResponseCode,
    vnp_TransactionStatus,
    vnp_TxnRef,
    vnp_Amount,
    vnp_BankCode,
    vnp_BankTranNo,
    vnp_PayDate,
    vnp_CardType,
    vnp_OrderInfo,
    vnp_SecureHash,
    ...rest
  } = query;

  const isSuccess =
    (vnp_ResponseCode === "00" || vnp_TransactionStatus === "00");

  return {
    isSuccess,
    responseCode: vnp_ResponseCode,
    transactionStatus: vnp_TransactionStatus,
    orderId: vnp_TxnRef,
    amount: vnp_Amount ? Number(vnp_Amount) / 100 : 0,
    bankCode: vnp_BankCode,
    bankTranNo: vnp_BankTranNo,
    payDate: vnp_PayDate,
    cardType: vnp_CardType,
    orderInfo: vnp_OrderInfo,
    ...rest,
  };
}

// ============================================================
// Helper: format date yyyyMMddHHmmss (GMT+7)
// ============================================================
function formatDate(date) {
  const y = date.getFullYear();
  const mo = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const h = String(date.getHours()).padStart(2, "0");
  const mi = String(date.getMinutes()).padStart(2, "0");
  const s = String(date.getSeconds()).padStart(2, "0");
  return `${y}${mo}${d}${h}${mi}${s}`;
}