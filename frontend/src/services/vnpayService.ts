/**
 * VNPay Payment Service - Frontend
 * Giao tiếp với backend để tạo URL thanh toán VNPay
 */

export interface VNPayCreateUrlRequest {
  amount: number;
  orderId: string;
  orderInfo?: string;
}

export interface VNPayCreateUrlResponse {
  paymentUrl: string;
  orderId: string;
  amount: number;
  isMock?: boolean;
  /** Ảnh PNG base64 từ backend (mã hóa paymentUrl) */
  qrCodeUrl?: string;
}

export interface VNPayStatusResponse {
  success: boolean;
  data?: {
    responseCode: string;
    transactionStatus: string;
    orderId: string;
    amount: number;
    bankCode?: string;
    bankTranNo?: string;
    payDate?: string;
    cardType?: string;
    orderInfo?: string;
    isSuccess: boolean;
  };
}

export class VNPayServiceError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "VNPayServiceError";
    this.status = status;
  }
}

const VNPAY_API_BASE = import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL}/api/vnpay`
  : "/api/vnpay";

const getErrorMessage = (error: unknown, fallback = "Đã xảy ra lỗi không xác định") => {
  if (error instanceof VNPayServiceError) return error.message;
  if (error instanceof Error) return error.message;
  return fallback;
};

const requestJson = async <T>(
  path: string,
  init: RequestInit = {}
): Promise<T> => {
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${VNPAY_API_BASE}${path}`, {
    ...init,
    headers,
  });

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new VNPayServiceError(
      body.message || `Yêu cầu thất bại (mã ${response.status})`,
      response.status
    );
  }

  if (!body.success) {
    throw new VNPayServiceError(body.message || "Tạo thanh toán VNPay thất bại", response.status);
  }

  return body.data as T;
};

/**
 * Tạo URL thanh toán VNPay - gọi backend để tạo payment URL
 */
export const createVNPayUrl = async (
  payload: VNPayCreateUrlRequest
): Promise<VNPayCreateUrlResponse> => {
  return requestJson<VNPayCreateUrlResponse>("/create-url", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

/**
 * Mở URL thanh toán VNPay
 */
export const openVNPayPayment = (paymentUrl: string) => {
  window.location.href = paymentUrl;
};

export { getErrorMessage };