/**
 * MoMo Payment Service - Frontend
 * Giao tiếp với backend để tạo và kiểm tra thanh toán MoMo
 */

export interface MoMoPaymentRequest {
  amount: number;
  orderId: string;
  orderInfo?: string;
  redirectUrl?: string;
  ipnUrl?: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
}

interface MoMoPaymentResponse {
  requestId: string;
  orderId: string;
  amount: number;
  payUrl: string;
  qrCodeUrl: string;
  deepLink: string;
  deeplinkWeb: string;
  deeplinkApp: string;
  /** Backend trả về khi MOMO_MOCK=true */
  isMock?: boolean;
}

export interface MoMoStatusResponse {
  success: boolean;
  data?: {
    resultCode: number;
    message: string;
    orderId: string;
    amount: number;
    transId?: string;
  };
}

export class MoMoServiceError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'MoMoServiceError';
    this.status = status;
  }
}

const MOMO_API_BASE = import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL}/api/momo`
  : '/api/momo';

const getErrorMessage = (error: unknown, fallback = 'Đã xảy ra lỗi không xác định') => {
  if (error instanceof MoMoServiceError) return error.message;
  if (error instanceof Error) return error.message;
  return fallback;
};

const requestJson = async <T>(
  path: string,
  init: RequestInit = {}
): Promise<T> => {
  const headers = new Headers(init.headers);
  headers.set('Accept', 'application/json');
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${MOMO_API_BASE}${path}`, {
    ...init,
    headers,
  });

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new MoMoServiceError(
      body.message || `Yêu cầu thất bại (mã ${response.status})`,
      response.status
    );
  }

  if (!body.success) {
    throw new MoMoServiceError(body.message || 'Tạo thanh toán MoMo thất bại', response.status);
  }

  return body.data as T;
};

/**
 * Tạo thanh toán MoMo QR - gọi backend để tạo payment
 */
export const createMoMoPayment = async (
  payload: MoMoPaymentRequest
): Promise<MoMoPaymentResponse> => {
  return requestJson<MoMoPaymentResponse>('/create', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

/**
 * Tạo QR code thanh toán MoMo (cho test/demo)
 */
export const createMoMoQR = async (
  payload: MoMoPaymentRequest
): Promise<MoMoPaymentResponse> => {
  return requestJson<MoMoPaymentResponse>('/create-qr', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

/**
 * Kiểm tra trạng thái thanh toán MoMo
 */
export const checkMoMoStatus = async (orderId: string): Promise<MoMoStatusResponse> => {
  const params = new URLSearchParams({ orderId });
  const response = await fetch(`${MOMO_API_BASE}/status?${params}`);
  return response.json() as Promise<MoMoStatusResponse>;
};

/**
 * Chuyển hướng đến app MoMo hoặc trang thanh toán
 */
export const openMoMoPayment = (payUrl: string, deepLink?: string) => {
  // Thử mở app MoMo trên mobile
  if (deepLink && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
    window.location.href = deepLink;
    return;
  }

  // Fallback: mở trang thanh toán MoMo
  window.location.href = payUrl;
};

export { getErrorMessage };
