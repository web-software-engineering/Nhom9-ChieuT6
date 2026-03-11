import { useMemo, useState } from 'react';
import { Package, Loader2, CheckCircle2, Copy } from 'lucide-react';
import {
  createShippingOrder,
  isMockShippingServiceEnabled,
  shippingLocationService,
  toShippingErrorMessage,
} from '../services/shippingService';
import type { ShippingOrder } from '../types/shipping';

const districtOptions = shippingLocationService.listDistricts();

const initialFormData = {
  receiverName: '',
  phone: '',
  address: '',
  district: '',
  ward: '',
  weight: '',
  product: '',
};

export default function CreateOrderForm() {
  const [formData, setFormData] = useState(initialFormData);
  const [result, setResult] = useState<ShippingOrder | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const isMockMode = isMockShippingServiceEnabled();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
      ...(name === 'district' ? { ward: '' } : {}),
    }));

    if (error) {
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);
    setError('');

    try {
      const order = await createShippingOrder({
        receiverName: formData.receiverName.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        districtId: formData.district,
        districtName: shippingLocationService.getDistrictName(formData.district),
        wardId: formData.ward,
        wardName: shippingLocationService.getWardName(formData.ward),
        weightKg: parseFloat(formData.weight),
        productDescription: formData.product.trim(),
      });

      setResult(order);
      setFormData(initialFormData);
    } catch (error) {
      setError(toShippingErrorMessage(error, 'Không thể tạo đơn vận chuyển lúc này.'));
    } finally {
      setIsLoading(false);
    }
  };

  const copyOrderCode = async () => {
    if (result) {
      try {
        await navigator.clipboard.writeText(result.orderCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        setCopied(false);
      }
    }
  };

  const filteredWards = useMemo(
    () => shippingLocationService.listWardsByDistrict(formData.district),
    [formData.district]
  );

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
          <Package className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Tạo đơn vận chuyển</h2>
          <p className="text-gray-500 text-sm">Tạo đơn hàng qua backend shipping service</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tên người nhận <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="receiverName"
              value={formData.receiverName}
              onChange={handleChange}
              required
              placeholder="Nguyễn Văn A"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Số điện thoại <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              placeholder="0901234567"
              pattern="[0-9]{10}"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Địa chỉ <span className="text-red-500">*</span>
          </label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
            rows={3}
            placeholder="Số nhà, tên đường..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quận/Huyện <span className="text-red-500">*</span>
            </label>
            <select
              name="district"
              value={formData.district}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Chọn quận/huyện</option>
              {districtOptions.map((district) => (
                <option key={district.id} value={district.id}>
                  {district.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phường/Xã <span className="text-red-500">*</span>
            </label>
            <select
              name="ward"
              value={formData.ward}
              onChange={handleChange}
              required
              disabled={!formData.district}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">Chọn phường/xã</option>
              {filteredWards.map((ward) => (
                <option key={ward.id} value={ward.id}>
                  {ward.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trọng lượng (kg) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              required
              min="0.1"
              step="0.1"
              placeholder="2.5"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sản phẩm <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="product"
              value={formData.product}
              onChange={handleChange}
              required
              placeholder="Sổ tay, bút bi, giấy A4..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Đang tạo đơn hàng...
            </>
          ) : (
            <>
              <Package className="w-5 h-5" />
              Tạo đơn vận chuyển
            </>
          )}
        </button>

        <p className="text-xs text-gray-500">
          {isMockMode
            ? 'Đang dùng mock response qua shippingService cho tới khi backend shipping hoàn tất.'
            : 'Đang gọi backend shipping endpoint qua shippingService.'}
        </p>
      </form>

      {error && (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 animate-fade-in">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-2 border-green-300 animate-fade-in">
          <div className="flex items-start gap-3 mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-bold text-gray-800">Tạo đơn thành công!</h3>
              <p className="text-sm text-gray-600">Đơn hàng của bạn đã được tạo thành công</p>
            </div>
          </div>

          <div className="space-y-3 mt-4">
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <label className="text-sm text-gray-600 block mb-2">Mã vận đơn</label>
              <div className="flex items-center justify-between gap-3">
                <span className="text-2xl font-bold text-blue-600">{result.orderCode}</span>
                <button
                  type="button"
                  onClick={copyOrderCode}
                  className="px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  {copied ? 'Đã sao chép!' : 'Sao chép'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-lg p-3 border border-green-200">
                <label className="text-xs text-gray-500 block mb-1">Người nhận</label>
                <span className="text-sm font-semibold text-gray-800">{result.receiverName}</span>
              </div>
              <div className="bg-white rounded-lg p-3 border border-green-200">
                <label className="text-xs text-gray-500 block mb-1">Số điện thoại</label>
                <span className="text-sm font-semibold text-gray-800">{result.phone}</span>
              </div>
              <div className="bg-white rounded-lg p-3 border border-green-200">
                <label className="text-xs text-gray-500 block mb-1">Sản phẩm</label>
                <span className="text-sm font-semibold text-gray-800">{result.product}</span>
              </div>
              <div className="bg-white rounded-lg p-3 border border-green-200">
                <label className="text-xs text-gray-500 block mb-1">Trạng thái</label>
                <span className="text-sm font-semibold text-orange-600">{result.status}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
