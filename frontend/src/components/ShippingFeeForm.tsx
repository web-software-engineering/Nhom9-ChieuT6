import { useState } from 'react';
import { Calculator, Loader2 } from 'lucide-react';
import {
  getShippingFee,
  isMockShippingServiceEnabled,
  shippingLocationService,
  toShippingErrorMessage,
} from '../services/shippingService';
import type { ShippingFeeQuote } from '../types/shipping';

const districtOptions = shippingLocationService.listDistricts();

export default function ShippingFeeForm() {
  const [formData, setFormData] = useState({
    fromDistrict: '',
    toDistrict: '',
    weight: '',
    length: '',
    width: '',
    height: '',
  });
  const [result, setResult] = useState<ShippingFeeQuote | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const isMockMode = isMockShippingServiceEnabled();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

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
      const fee = await getShippingFee({
        fromDistrictId: formData.fromDistrict,
        toDistrictId: formData.toDistrict,
        weightKg: parseFloat(formData.weight),
        lengthCm: parseFloat(formData.length),
        widthCm: parseFloat(formData.width),
        heightCm: parseFloat(formData.height),
      });

      setResult(fee);
    } catch (error) {
      setError(toShippingErrorMessage(error, 'Không thể tính phí vận chuyển lúc này.'));
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
          <Calculator className="w-6 h-6 text-orange-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Tính phí vận chuyển</h2>
          <p className="text-gray-500 text-sm">
            Tính toán chi phí giao hàng nhanh chóng qua lớp service của frontend
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quận gửi hàng <span className="text-red-500">*</span>
            </label>
            <select
              name="fromDistrict"
              value={formData.fromDistrict}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">Chọn quận gửi hàng</option>
              {districtOptions.map((district) => (
                <option key={district.id} value={district.id}>
                  {district.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quận nhận hàng <span className="text-red-500">*</span>
            </label>
            <select
              name="toDistrict"
              value={formData.toDistrict}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">Chọn quận nhận hàng</option>
              {districtOptions.map((district) => (
                <option key={district.id} value={district.id}>
                  {district.name}
                </option>
              ))}
            </select>
          </div>
        </div>

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
            placeholder="Ví dụ: 2.5"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chiều dài (cm) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="length"
              value={formData.length}
              onChange={handleChange}
              required
              min="1"
              placeholder="30"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chiều rộng (cm) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="width"
              value={formData.width}
              onChange={handleChange}
              required
              min="1"
              placeholder="20"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chiều cao (cm) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="height"
              value={formData.height}
              onChange={handleChange}
              required
              min="1"
              placeholder="10"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Đang tính toán...
            </>
          ) : (
            <>
              <Calculator className="w-5 h-5" />
              Tính phí vận chuyển
            </>
          )}
        </button>

        <p className="text-xs text-gray-500">
          {isMockMode
            ? 'Đang dùng mock response qua shippingService cho tới khi backend sẵn sàng.'
            : 'Đang gọi backend shipping endpoint qua shippingService.'}
        </p>
      </form>

      {error && (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 animate-fade-in">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-6 p-6 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200 animate-fade-in">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Kết quả tính phí</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-orange-200">
              <span className="text-gray-600">Phí vận chuyển:</span>
              <span className="font-semibold text-gray-800">{formatCurrency(result.shippingFee)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-orange-200">
              <span className="text-gray-600">Phí bảo hiểm:</span>
              <span className="font-semibold text-gray-800">{formatCurrency(result.insuranceFee)}</span>
            </div>
            <div className="flex justify-between items-center py-3 bg-white rounded-lg px-4">
              <span className="text-lg font-bold text-gray-800">Tổng phí ship:</span>
              <span className="text-2xl font-bold text-orange-600">{formatCurrency(result.total)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
