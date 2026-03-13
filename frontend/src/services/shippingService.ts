import {
  calculateShippingFeeMock,
  createShippingOrderMock,
  districts,
  trackShippingOrderMock,
  wards,
} from '../data/mockData';
import type {
  CreateShippingOrderRequest,
  District,
  ShippingFeeQuote,
  ShippingFeeRequest,
  ShippingOrder,
  TrackingStatus,
  Ward,
} from '../types/shipping';

const SHIPPING_API_BASE =
  import.meta.env.VITE_SHIPPING_API_BASE ?? 'https://nhom9-chieut6-backend.onrender.com/api/shipping';const USE_MOCK_SHIPPING_API = import.meta.env.VITE_USE_MOCK_SHIPPING_API !== 'false';

export class ShippingServiceError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ShippingServiceError';
    this.status = status;
  }
}

const delay = (duration: number) => new Promise((resolve) => setTimeout(resolve, duration));

const createSearchParams = (params: Record<string, string | number>) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    searchParams.set(key, String(value));
  });

  return searchParams.toString();
};

const getErrorMessageFromResponse = async (response: Response) => {
  try {
    const body = (await response.json()) as { message?: string };
    if (body.message) {
      return body.message;
    }
  } catch {
    // Ignore JSON parse failures and fall back to a generic message.
  }

  return `Yêu cầu thất bại với mã ${response.status}`;
};

const requestJson = async <T>(path: string, init: RequestInit = {}): Promise<T> => {
  const headers = new Headers(init.headers);
  headers.set('Accept', 'application/json');

  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(path, {
    ...init,
    headers,
  });

  if (!response.ok) {
    throw new ShippingServiceError(await getErrorMessageFromResponse(response), response.status);
  }

  return response.json() as Promise<T>;
};

export const shippingLocationService = {
  listDistricts(): District[] {
    return districts;
  },

  listWardsByDistrict(districtId: string): Ward[] {
    return wards.filter((ward) => ward.districtId === districtId);
  },

  getDistrictName(districtId: string) {
    return districts.find((district) => district.id === districtId)?.name ?? '';
  },

  getWardName(wardId: string) {
    return wards.find((ward) => ward.id === wardId)?.name ?? '';
  },
};

export const isMockShippingServiceEnabled = () => USE_MOCK_SHIPPING_API;

export const getShippingFee = async (payload: ShippingFeeRequest): Promise<ShippingFeeQuote> => {
  if (USE_MOCK_SHIPPING_API) {
    await delay(1200);

    return calculateShippingFeeMock(
      payload.fromDistrictId,
      payload.toDistrictId,
      payload.weightKg,
      payload.lengthCm,
      payload.widthCm,
      payload.heightCm
    );
  }

  const query = createSearchParams({
    fromDistrictId: payload.fromDistrictId,
    toDistrictId: payload.toDistrictId,
    weightKg: payload.weightKg,
    lengthCm: payload.lengthCm,
    widthCm: payload.widthCm,
    heightCm: payload.heightCm,
  });

  return requestJson<ShippingFeeQuote>(`${SHIPPING_API_BASE}/fee?${query}`);
};

export const createShippingOrder = async (
  payload: CreateShippingOrderRequest
): Promise<ShippingOrder> => {
  if (USE_MOCK_SHIPPING_API) {
    await delay(1500);
    return createShippingOrderMock(payload);
  }

  return requestJson<ShippingOrder>(`${SHIPPING_API_BASE}/order`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const getShippingTracking = async (orderCode: string): Promise<TrackingStatus[]> => {
  if (USE_MOCK_SHIPPING_API) {
    await delay(1000);
    return trackShippingOrderMock(orderCode);
  }

  const query = createSearchParams({ orderCode });
  return requestJson<TrackingStatus[]>(`${SHIPPING_API_BASE}/tracking?${query}`);
};

export const toShippingErrorMessage = (
  error: unknown,
  fallbackMessage = 'Không thể kết nối đến dịch vụ vận chuyển lúc này.'
) => {
  if (error instanceof ShippingServiceError) {
    return error.message;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallbackMessage;
};