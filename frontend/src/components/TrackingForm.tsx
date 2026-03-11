import { useState } from 'react';
import { Search, Loader2, Package, Truck, Home, CheckCircle2 } from 'lucide-react';
import {
  getShippingTracking,
  isMockShippingServiceEnabled,
  toShippingErrorMessage,
} from '../services/shippingService';
import type { TrackingStatus } from '../types/shipping';

export default function TrackingForm() {
  const [orderCode, setOrderCode] = useState('');
  const [result, setResult] = useState<TrackingStatus[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const isMockMode = isMockShippingServiceEnabled();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);
    setError('');

    try {
      const tracking = await getShippingTracking(orderCode.trim().toUpperCase());
      setResult(tracking);
    } catch (error) {
      setError(toShippingErrorMessage(error, 'Không thể tra cứu đơn hàng lúc này.'));
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (index: number) => {
    const icons = [
      <Package className="w-5 h-5" />,
      <Package className="w-5 h-5" />,
      <Truck className="w-5 h-5" />,
      <Truck className="w-5 h-5" />,
      <CheckCircle2 className="w-5 h-5" />,
    ];
    return icons[index] || <Package className="w-5 h-5" />;
  };

  return (
    <div className="soft-card p-6 sm:p-7">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-100 text-teal-700">
          <Search className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Theo dõi đơn hàng</h2>
          <p className="text-sm text-slate-500">
            {isMockMode
              ? 'Tra cứu trạng thái vận chuyển bằng mock response qua service layer'
              : 'Tra cứu trạng thái vận chuyển qua backend shipping endpoint'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Mã vận đơn <span className="text-red-500">*</span>
          </label>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={orderCode}
              onChange={(e) => setOrderCode(e.target.value)}
              required
              placeholder="Nhập mã vận đơn (VD: GHN123456789)"
              className="input-modern pl-12"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="primary-btn flex w-full items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Đang tra cứu...
            </>
          ) : (
            <>
              <Search className="w-5 h-5" />
              Tra cứu
            </>
          )}
        </button>
      </form>

      {error && (
        <div className="mt-6 animate-fade-in rounded-xl border border-rose-200 bg-rose-50 p-4">
          <p className="text-sm text-rose-700">{error}</p>
        </div>
      )}

      {result && (
        <div className="mt-6 animate-fade-in">
          <div className="mb-4 rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2">
              <Home className="h-5 w-5 text-teal-700" />
              <span className="font-semibold text-slate-800">Mã vận đơn:</span>
              <span className="font-bold text-slate-900">{orderCode}</span>
            </div>
          </div>

          <h3 className="mb-4 text-lg font-bold text-slate-900">Lịch sử vận chuyển</h3>

          <div className="space-y-4">
            {result.map((status, index) => (
              <div
                key={`${status.status}-${status.time}`}
                className={`relative pl-8 pb-6 ${
                  index === result.length - 1 ? 'pb-0' : 'border-l-2 border-slate-200'
                }`}
              >
                <div
                  className={`absolute -left-3 top-0 w-6 h-6 rounded-full flex items-center justify-center ${
                    index === result.length - 1
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-700 text-white'
                  }`}
                >
                  {getStatusIcon(index)}
                </div>

                <div
                  className={`p-4 rounded-lg ${
                    index === result.length - 1
                      ? 'border-2 border-emerald-300 bg-emerald-50'
                      : 'border border-slate-200 bg-slate-50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4
                      className={`font-bold ${
                        index === result.length - 1 ? 'text-emerald-700' : 'text-slate-800'
                      }`}
                    >
                      {status.status}
                    </h4>
                    <span className="text-xs text-slate-500">{status.time}</span>
                  </div>
                  <p className="text-sm text-slate-600">{status.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-xl border border-teal-200 bg-teal-50 p-4">
            <p className="text-sm text-teal-800">
              <span className="font-semibold">Trạng thái mới nhất:</span>{' '}
              {result[result.length - 1]?.description ?? 'Chưa có thông tin vận chuyển.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
