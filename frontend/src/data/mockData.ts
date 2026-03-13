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
  { id: '1442', name: 'Quận 1' },
  { id: '1443', name: 'Quận 2' },
  { id: '1444', name: 'Quận 3' },
  { id: '1446', name: 'Quận 4' },
  { id: '1447', name: 'Quận 5' },
  { id: '1448', name: 'Quận 6' },
  { id: '1449', name: 'Quận 7' },
  { id: '1450', name: 'Quận 8' },
  { id: '1451', name: 'Quận 9' },
  { id: '1452', name: 'Quận 10' },
  { id: '1453', name: 'Quận 11' },
  { id: '1454', name: 'Quận 12' },
  { id: '1462', name: 'Bình Thạnh' },
  { id: '1457', name: 'Phú Nhuận' },
  { id: '3695', name: 'Thành Phố Thủ Đức' },
  { id: '1461', name: 'Gò Vấp' },
];

// Mock wards
export const wards: Ward[] = [
  { id: '20101', name: 'Phường Bến Nghé', districtId: '1442' },
  { id: '20102', name: 'Phường Bến Thành', districtId: '1442' },
  { id: '20108', name: 'Phường Nguyễn Thái Bình', districtId: '1442' },
  { id: '20109', name: 'Phường Phạm Ngũ Lão', districtId: '1442' },
  { id: '20208', name: 'Phường An Phú', districtId: '1443' },
  { id: '20211', name: 'Phường Thảo Điền', districtId: '1443' },
  { id: '20204', name: 'Phường Bình An', districtId: '1443' },
  { id: '20308', name: 'Phường Võ Thị Sáu', districtId: '1444' },
  { id: '20307', name: 'Phường 6', districtId: '1444' },
  { id: '20309', name: 'Phường 7', districtId: '1444' },
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
