import type {
  CreateShippingOrderRequest,
  District,
  ShippingFeeQuote,
  ShippingOrder,
  TrackingStatus,
  Ward,
} from '../types/shipping';

// Mock data cho shipping service demo

// Mock districts
export const districts: District[] = [
  { id: '1', name: 'Quận 1' },
  { id: '2', name: 'Quận 2' },
  { id: '3', name: 'Quận 3' },
  { id: '4', name: 'Quận 4' },
  { id: '5', name: 'Quận 5' },
  { id: '6', name: 'Quận 6' },
  { id: '7', name: 'Quận 7' },
  { id: '8', name: 'Quận 8' },
  { id: '9', name: 'Quận 9' },
  { id: '10', name: 'Quận 10' },
  { id: '11', name: 'Quận 11' },
  { id: '12', name: 'Quận 12' },
  { id: 'bd', name: 'Bình Thạnh' },
  { id: 'pn', name: 'Phú Nhuận' },
  { id: 'td', name: 'Thủ Đức' },
  { id: 'go', name: 'Gò Vấp' },
];

// Mock wards
export const wards: Ward[] = [
  { id: '1-1', name: 'Phường Bến Nghé', districtId: '1' },
  { id: '1-2', name: 'Phường Bến Thành', districtId: '1' },
  { id: '1-3', name: 'Phường Nguyễn Thái Bình', districtId: '1' },
  { id: '1-4', name: 'Phường Phạm Ngũ Lão', districtId: '1' },
  { id: '2-1', name: 'Phường An Phú', districtId: '2' },
  { id: '2-2', name: 'Phường Thảo Điền', districtId: '2' },
  { id: '2-3', name: 'Phường Bình An', districtId: '2' },
  { id: '3-1', name: 'Phường 1', districtId: '3' },
  { id: '3-2', name: 'Phường 2', districtId: '3' },
  { id: '3-3', name: 'Phường 3', districtId: '3' },
];

export const calculateShippingFeeMock = (
  _fromDistrict: string,
  _toDistrict: string,
  weight: number,
  length: number,
  width: number,
  height: number
): ShippingFeeQuote => {
  const basePrice = 20000;
  const weightPrice = weight * 2000;
  const volumePrice = (((length * width * height) / 1000) * 500);

  const shippingFee = basePrice + weightPrice + volumePrice;
  const insuranceFee = shippingFee * 0.1;
  const total = shippingFee + insuranceFee;

  return {
    total: Math.round(total),
    shippingFee: Math.round(shippingFee),
    insuranceFee: Math.round(insuranceFee),
    currency: 'VND',
  };
};

export const createShippingOrderMock = (
  orderData: CreateShippingOrderRequest
): ShippingOrder => {
  const orderCode = `GHN${Math.floor(Math.random() * 1000000000)}`;
  const now = new Date().toISOString();

  return {
    orderCode,
    receiverName: orderData.receiverName,
    phone: orderData.phone,
    address: orderData.address,
    district: orderData.districtName,
    ward: orderData.wardName,
    weight: orderData.weightKg,
    product: orderData.productDescription,
    status: 'Đang chờ lấy hàng',
    createdAt: now,
  };
};

export const trackShippingOrderMock = (orderCode: string): TrackingStatus[] => {
  if (!orderCode.trim().toUpperCase().startsWith('GHN')) {
    throw new Error('Mã vận đơn không hợp lệ. Mã vận đơn phải bắt đầu bằng "GHN".');
  }

  const now = new Date();
  const statuses: TrackingStatus[] = [
    {
      status: 'Đơn hàng đã được tạo',
      description: 'Đơn hàng đã được tạo thành công',
      time: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toLocaleString('vi-VN'),
    },
    {
      status: 'Đã lấy hàng',
      description: 'Shipper đã lấy hàng từ người gửi',
      time: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toLocaleString('vi-VN'),
    },
    {
      status: 'Đang vận chuyển',
      description: 'Đơn hàng đang được vận chuyển đến khu vực của bạn',
      time: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toLocaleString('vi-VN'),
    },
    {
      status: 'Đang giao',
      description: 'Shipper đang trên đường giao hàng',
      time: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toLocaleString('vi-VN'),
    },
    {
      status: 'Đã giao thành công',
      description: 'Đơn hàng đã được giao thành công',
      time: now.toLocaleString('vi-VN'),
    },
  ];

  return statuses;
};
