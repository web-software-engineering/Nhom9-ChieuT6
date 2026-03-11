export interface District {
  id: string;
  name: string;
}

export interface Ward {
  id: string;
  name: string;
  districtId: string;
}

export interface ShippingFeeRequest {
  fromDistrictId: string;
  toDistrictId: string;
  weightKg: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
}

export interface ShippingFeeQuote {
  total: number;
  shippingFee: number;
  insuranceFee: number;
  currency: 'VND';
}

export interface CreateShippingOrderRequest {
  receiverName: string;
  phone: string;
  address: string;
  districtId: string;
  districtName: string;
  wardId: string;
  wardName: string;
  weightKg: number;
  productDescription: string;
}

export interface ShippingOrder {
  orderCode: string;
  receiverName: string;
  phone: string;
  address: string;
  district: string;
  ward: string;
  weight: number;
  product: string;
  status: string;
  createdAt: string;
}

export interface TrackingStatus {
  status: string;
  description: string;
  time: string;
}