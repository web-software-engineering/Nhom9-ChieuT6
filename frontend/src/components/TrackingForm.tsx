import React, { useState, useEffect } from 'react';
import { Search, Package, MapPin, Calendar, CreditCard, Clock, CheckCircle2, Truck, History } from 'lucide-react';

export default function TrackingForm() {
  const [searchQuery, setSearchQuery] = useState('');
  const [orderInfo, setOrderInfo] = useState<any>(null);
  const [error, setError] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  // Tự động tải lịch sử đơn hàng từ bộ nhớ trình duyệt khi mở trang
  useEffect(() => {
    const savedOrders = JSON.parse(localStorage.getItem('office_smart_orders') || '[]');
    // Đảo ngược mảng để đơn hàng mới nhất hiện lên đầu
    setRecentOrders(savedOrders.reverse());
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setOrderInfo(null);

    const query = searchQuery.trim().toUpperCase();

    if (!query) {
      setError('Vui lòng nhập mã vận đơn hoặc số điện thoại để tra cứu.');
      return;
    }

    setIsSearching(true);

    // Giả lập độ trễ mạng để nhìn giống thật
    await new Promise(resolve => setTimeout(resolve, 600));

    const savedOrders = JSON.parse(localStorage.getItem('office_smart_orders') || '[]');
    
    // NÂNG CẤP: Tìm theo Mã đơn hàng HOẶC Số điện thoại
    const foundOrders = savedOrders.filter((o: any) => 
      o.orderCode === query || o.phone === query
    );

    if (foundOrders.length > 0) {
      // Nếu tìm thấy bằng SĐT (có thể ra nhiều đơn), tạm thời hiển thị đơn mới nhất
      setOrderInfo(foundOrders[0]); 
    } else {
      setError(`Không tìm thấy đơn hàng nào khớp với "${searchQuery}".`);
    }
    
    setIsSearching(false);
  };

  // Hàm xem nhanh chi tiết đơn hàng từ danh sách lịch sử
  const viewOrderDetails = (order: any) => {
    setOrderInfo(order);
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const getStatusDisplay = (status: string) => {
    switch(status) {
      case 'pending': return { text: 'Chờ xác nhận', color: 'text-amber-600', bg: 'bg-amber-100', icon: Clock };
      case 'confirmed': return { text: 'Đã xác nhận', color: 'text-blue-600', bg: 'bg-blue-100', icon: CheckCircle2 };
      case 'shipping': return { text: 'Đang giao hàng', color: 'text-purple-600', bg: 'bg-purple-100', icon: Truck };
      case 'done': return { text: 'Hoàn thành', color: 'text-emerald-600', bg: 'bg-emerald-100', icon: CheckCircle2 };
      case 'cancel': return { text: 'Đã hủy', color: 'text-rose-600', bg: 'bg-rose-100', icon: Package };
      default: return { text: 'Không xác định', color: 'text-slate-600', bg: 'bg-slate-100', icon: Package };
    }
  };

  return (
    <div className="mx-auto max-w-3xl animate-fade-in space-y-6">
      {/* Form Tra Cứu */}
      <div className="soft-card p-6 sm:p-8">
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-100 text-teal-600">
            <Search className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Theo dõi đơn hàng</h2>
            <p className="text-sm text-slate-500">Tra cứu bằng Mã vận đơn hoặc Số điện thoại</p>
          </div>
        </div>

        <form onSubmit={handleSearch} className="space-y-4">
          <div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="VD: OS123456 hoặc 0901234567"
                className="input-modern pl-10"
              />
            </div>
          </div>
          <button type="submit" disabled={isSearching} className="primary-btn w-full flex justify-center items-center gap-2">
            {isSearching ? 'Đang tìm kiếm...' : 'Tra cứu ngay'}
          </button>
        </form>

        {error && (
          <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 animate-fade-in">
            {error}
          </div>
        )}

        {/* Chi tiết đơn hàng khi tìm thấy */}
        {orderInfo && (() => {
          const statusInfo = getStatusDisplay(orderInfo.status);
          const StatusIcon = statusInfo.icon;
          
          return (
            <div className="mt-8 space-y-6 animate-fade-in border-t border-slate-200 pt-8">
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-slate-50 p-4 border border-slate-100">
                <div>
                  <p className="text-sm text-slate-500">Mã đơn hàng</p>
                  <p className="text-xl font-bold text-slate-900">{orderInfo.orderCode}</p>
                </div>
                <div className={`flex items-center gap-2 rounded-full px-4 py-2 ${statusInfo.bg} ${statusInfo.color}`}>
                  <StatusIcon className="h-5 w-5" />
                  <span className="font-semibold">{statusInfo.text}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2 border-b pb-2">
                    <MapPin className="h-5 w-5 text-slate-400" /> Thông tin nhận hàng
                  </h3>
                  <div className="text-sm text-slate-600 space-y-2">
                    <p><strong>Người nhận:</strong> {orderInfo.receiverName}</p>
                    <p><strong>Điện thoại:</strong> {orderInfo.phone}</p>
                    <p><strong>Địa chỉ:</strong> {orderInfo.address}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2 border-b pb-2">
                    <Calendar className="h-5 w-5 text-slate-400" /> Chi tiết giao dịch
                  </h3>
                  <div className="text-sm text-slate-600 space-y-2">
                    <p><strong>Ngày đặt:</strong> {orderInfo.orderDate}</p>
                    <p><strong>Phí giao hàng:</strong> {formatCurrency(orderInfo.shippingFee)}</p>
                    <p className="text-base font-bold text-slate-900 pt-2 border-t mt-2">
                      Tổng tiền: {formatCurrency(orderInfo.totalPrice)}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 flex items-center gap-2 border-b pb-2 mb-4">
                  <Package className="h-5 w-5 text-slate-400" /> Sản phẩm đã đặt
                </h3>
                <ul className="space-y-3">
                  {orderInfo.items.map((item: any, idx: number) => (
                    <li key={idx} className="flex justify-between text-sm bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <span className="font-medium text-slate-800">{item.name} <span className="text-slate-500 font-normal">x{item.quantity}</span></span>
                      <span className="font-semibold text-slate-900">{formatCurrency(item.price * item.quantity)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })()}
      </div>

      {/* TỰ ĐỘNG HIỂN THỊ: Lịch sử đặt hàng gần đây */}
      {!orderInfo && recentOrders.length > 0 && (
        <div className="soft-card p-6 sm:p-8 animate-fade-in">
          <div className="mb-4 flex items-center gap-2 border-b border-slate-200 pb-4">
            <History className="h-5 w-5 text-slate-500" />
            <h3 className="text-lg font-bold text-slate-900">Đơn hàng gần đây trên thiết bị này</h3>
          </div>
          
          <div className="space-y-3">
            {recentOrders.map((order, idx) => {
              const statusInfo = getStatusDisplay(order.status);
              return (
                <div key={idx} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 p-4 transition hover:border-teal-300 hover:shadow-sm bg-white">
                  <div>
                    <p className="font-bold text-slate-900">{order.orderCode}</p>
                    <p className="text-sm text-slate-500">{order.orderDate} • {order.items.length} sản phẩm</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-md ${statusInfo.bg} ${statusInfo.color}`}>
                      {statusInfo.text}
                    </span>
                    <button 
                      onClick={() => viewOrderDetails(order)}
                      className="text-sm font-semibold text-teal-600 hover:text-teal-700"
                    >
                      Xem chi tiết →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}