import { useMemo, useState } from 'react';
import {
  Package,
  Loader2,
  CheckCircle2,
  ArrowLeft,
  UserRound,
  Truck,
  ClipboardList,
} from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useNavigate } from '../components/Navigation';
import {
  createShippingOrder,
  getShippingFee,
  toShippingErrorMessage,
} from '../services/shippingService';
// Import trực tiếp data quận/huyện TP.HCM bạn vừa tạo
import { districts } from '../data/districts';

const initialFormData = {
  receiverName: '',
  phone: '',
  address: '',
  district: '',
  ward: '',
  fromDistrict: 'Quận 1', // Mặc định kho hàng ở Quận 1
};

export default function Checkout() {
  const { cartItems, getTotalPrice, getTotalWeight, clearCart } = useCart();
  const navigate = useNavigate();

  const [step, setStep] = useState<'info' | 'shipping' | 'success'>('info');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState(initialFormData);

  const [shippingFee, setShippingFee] = useState(0);
  const [orderCode, setOrderCode] = useState('');
  const [orderSubtotal, setOrderSubtotal] = useState(0);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
      // Nếu đổi Quận/Huyện thì tự động reset Phường/Xã về rỗng
      ...(name === 'district' ? { ward: '' } : {}),
    }));

    setError('');

    if (step === 'shipping') {
      setShippingFee(0);
      setStep('info');
    }
  };

  // const handleCalculateShipping = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setIsLoading(true);
  //   setError('');

  //   try {
  //     const fee = await getShippingFee({
  //       fromDistrictId: formData.fromDistrict,
  //       toDistrictId: formData.district, // Dùng tên quận làm ID mô phỏng
  //       weightKg: getTotalWeight(),
  //       lengthCm: 30,
  //       widthCm: 20,
  //       heightCm: 15,
  //     });

  //     setShippingFee(fee.total);
  //     setStep('shipping');
  //   } catch (error) {
  //     setError(toShippingErrorMessage(error, 'Không thể tính phí vận chuyển cho đơn hàng này.'));
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // const handlePlaceOrder = async () => {
  //   setIsLoading(true);
  //   setError('');

  //   try {
  //     const order = await createShippingOrder({
  //       receiverName: formData.receiverName.trim(),
  //       phone: formData.phone.trim(),
  //       address: formData.address.trim(),
  //       districtId: formData.district,
  //       districtName: formData.district, // Lưu thẳng tên Quận
  //       wardId: formData.ward,
  //       wardName: formData.ward, // Lưu thẳng tên Phường
  //       weightKg: getTotalWeight(),
  //       productDescription: `${cartItems.length} sản phẩm văn phòng phẩm`,
  //     });

  //     setOrderCode(order.orderCode);
  //     setOrderSubtotal(getTotalPrice());
  //     setStep('success');
  //     clearCart();
  //   } catch (error) {
  //     setError(toShippingErrorMessage(error, 'Không thể tạo đơn giao hàng lúc này.'));
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };
  const handleCalculateShipping = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Giả lập thời gian chờ gọi API (800ms) để nhìn giống thật
      await new Promise(resolve => setTimeout(resolve, 800));

      // Tính phí vận chuyển giả lập: Nếu là "Huyện" thì 40k, "Quận" thì 25k
      const fee = formData.district.includes('Huyện') ? 40000 : 25000;

      setShippingFee(fee);
      setStep('shipping');
    } catch (error) {
      setError('Không thể tính phí vận chuyển cho đơn hàng này.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Giả lập thời gian chờ hệ thống tạo đơn hàng (1 giây)
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Random một mã đơn hàng 
      const fakeOrderCode = 'OS' + Math.floor(100000 + Math.random() * 900000);

      // --- CODE MỚI THÊM: Tạo object lưu thông tin đơn hàng ---
      const newOrderData = {
        orderCode: fakeOrderCode,
        receiverName: formData.receiverName,
        phone: formData.phone,
        address: `${formData.address}, ${formData.ward}, ${formData.district}, TP.HCM`,
        totalPrice: getTotalPrice() + shippingFee,
        shippingFee: shippingFee,
        status: 'pending', // Trạng thái mặc định ban đầu
        orderDate: new Date().toLocaleString('vi-VN'),
        items: cartItems.map(item => ({
          name: item.product.name,
          quantity: item.quantity,
          price: item.product.price
        }))
      };

      // Kéo mảng đơn hàng cũ từ localStorage lên (nếu có), nhét thêm đơn mới vào và lưu lại
      const existingOrders = JSON.parse(localStorage.getItem('office_smart_orders') || '[]');
      localStorage.setItem('office_smart_orders', JSON.stringify([...existingOrders, newOrderData]));
      // ---------------------------------------------------------

      setOrderCode(fakeOrderCode);
      setOrderSubtotal(getTotalPrice());
      setStep('success');
      clearCart();
    } catch (error) {
      setError('Không thể tạo đơn giao hàng lúc này.');
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

  // Lấy danh sách phường/xã dựa trên quận/huyện đang được chọn
  const filteredWards = useMemo(
    () => (formData.district && districts[formData.district as keyof typeof districts]) || [],
    [formData.district]
  );

  const currentStepIndex = step === 'info' ? 0 : step === 'shipping' ? 1 : 2;

  const checkoutSteps = [
    { id: 'info', label: 'Thông tin', icon: UserRound },
    { id: 'shipping', label: 'Vận chuyển', icon: Truck },
    { id: 'success', label: 'Hoàn tất', icon: CheckCircle2 },
  ];

  // ... (Giao diện khi giỏ hàng trống và khi đặt hàng thành công giữ nguyên)
  if (cartItems.length === 0 && step !== 'success') {
    return (
      <div className="soft-card p-8 text-center animate-fade-in">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
          <Package className="h-10 w-10" />
        </div>
        <h3 className="text-2xl font-bold text-slate-900">Chưa có sản phẩm để thanh toán</h3>
        <p className="mt-2 text-slate-600">Vui lòng thêm sản phẩm vào giỏ hàng trước khi tiếp tục.</p>
        <button onClick={() => navigate('home')} className="secondary-btn mt-6" type="button">
          Quay lại trang chủ
        </button>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="soft-card p-7 sm:p-8 animate-fade-in">
        <div className="text-center mb-6">
          <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle2 className="h-12 w-12" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900">Đặt hàng thành công</h2>
          <p className="mt-2 text-slate-600">Mã đơn đã được tạo và gửi qua hệ thống GHN.</p>
        </div>

        <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-6">
          <label className="block text-sm text-slate-600">Mã đơn hàng của bạn</label>
          <div className="mt-3 text-center text-3xl font-bold text-slate-900">{orderCode}</div>
          <p className="mt-3 text-center text-sm text-slate-600">Vui lòng lưu mã đơn để tra cứu trạng thái.</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900">
            <ClipboardList className="h-5 w-5" />
            Thông tin đơn hàng
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Người nhận:</span>
              <span className="font-semibold text-slate-800">{formData.receiverName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Số điện thoại:</span>
              <span className="font-semibold text-slate-800">{formData.phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Khu vực:</span>
              <span className="font-semibold text-slate-800">{formData.ward}, {formData.district}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Tiền hàng:</span>
              <span className="font-semibold text-slate-800">{formatCurrency(orderSubtotal)}</span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-3">
              <span className="text-base font-bold text-slate-900">Tổng cộng:</span>
              <span className="text-base font-bold text-slate-900">{formatCurrency(orderSubtotal + shippingFee)}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <button onClick={() => navigate('tracking')} className="primary-btn" type="button">
            Theo dõi đơn hàng
          </button>
          <button onClick={() => { setStep('info'); setOrderSubtotal(0); setShippingFee(0); setOrderCode(''); setError(''); setFormData(initialFormData); navigate('home'); }} className="secondary-btn" type="button">
            Tiếp tục mua sắm
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <div className="soft-card p-6 sm:p-7">
          <button onClick={() => navigate('cart')} className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-800" type="button">
            <ArrowLeft className="w-5 h-5" />
            Quay lại giỏ hàng
          </button>

          <h2 className="text-2xl font-bold text-slate-900">Thông tin giao hàng</h2>

          <div className="mb-6 mt-5 flex flex-wrap gap-2">
            {checkoutSteps.map((item, index) => {
              const isActive = currentStepIndex === index;
              const isDone = currentStepIndex > index;
              return (
                <div key={item.id} className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold ${isDone ? 'bg-emerald-100 text-emerald-700' : isActive ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </div>
              );
            })}
          </div>

          <form onSubmit={handleCalculateShipping} className="space-y-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Tên người nhận <span className="text-red-500">*</span></label>
                <input type="text" name="receiverName" value={formData.receiverName} onChange={handleChange} required placeholder="Nguyễn Văn A" className="input-modern" />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Số điện thoại <span className="text-red-500">*</span></label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required placeholder="0901234567" pattern="[0-9]{10}" className="input-modern" />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Địa chỉ <span className="text-red-500">*</span></label>
              <textarea name="address" value={formData.address} onChange={handleChange} required rows={3} placeholder="Số nhà, tên đường..." className="input-modern resize-none" />
            </div>

            {/* PHẦN CHỌN QUẬN / PHƯỜNG ĐỘNG */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Quận/Huyện <span className="text-red-500">*</span></label>
                <select name="district" value={formData.district} onChange={handleChange} required className="input-modern appearance-none">
                  <option value="">Chọn quận/huyện</option>
                  {Object.keys(districts).map((district) => (
                    <option key={district} value={district}>
                      {district}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Phường/Xã <span className="text-red-500">*</span></label>
                <select name="ward" value={formData.ward} onChange={handleChange} required disabled={!formData.district} className="input-modern appearance-none disabled:cursor-not-allowed disabled:bg-slate-100">
                  <option value="">Chọn phường/xã</option>
                  {filteredWards.map((ward) => (
                    <option key={ward} value={ward}>
                      {ward}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 animate-fade-in">{error}</div>}

            {step === 'info' && (
              <button type="submit" disabled={isLoading} className="primary-btn flex w-full items-center justify-center gap-2">
                {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" />Đang tính phí...</> : 'Tính phí vận chuyển'}
              </button>
            )}
          </form>

          {step === 'shipping' && (
            <div className="mt-6 animate-fade-in rounded-2xl border border-teal-200 bg-teal-50/70 p-6">
              <h3 className="mb-4 font-bold text-slate-900">Phí vận chuyển đã được tính</h3>
              <div className="mb-4 flex items-center justify-between">
                <span className="text-slate-600">Phí giao hàng:</span>
                <span className="text-2xl font-bold text-slate-900">{formatCurrency(shippingFee)}</span>
              </div>
              <button onClick={handlePlaceOrder} disabled={isLoading} className="primary-btn flex w-full items-center justify-center gap-2" type="button">
                {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" />Đang đặt hàng...</> : <><CheckCircle2 className="w-5 h-5" />Đặt hàng ngay</>}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="lg:col-span-1">
        <div className="soft-card p-6 lg:sticky lg:top-24">
          <h3 className="text-xl font-bold text-slate-900">Đơn hàng</h3>
          <div className="mt-4 max-h-64 space-y-3 overflow-y-auto pr-1">
            {cartItems.map((item) => (
              <div key={item.product.id} className="flex gap-3 text-sm">
                <img src={item.product.image} alt={item.product.name} className="h-14 w-14 rounded-lg border border-slate-200 object-cover" />
                <div className="min-w-0 flex-grow">
                  <p className="truncate font-semibold text-slate-800">{item.product.name}</p>
                  <p className="text-slate-500">SL: {item.quantity}</p>
                </div>
                <p className="font-bold text-slate-900">{formatCurrency(item.product.price * item.quantity)}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 space-y-2 border-t border-slate-200 pt-4">
            <div className="flex justify-between">
              <span className="text-slate-600">Tạm tính:</span>
              <span className="font-semibold">{formatCurrency(getTotalPrice())}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Phí vận chuyển:</span>
              <span className="font-semibold">{shippingFee > 0 ? formatCurrency(shippingFee) : 'Chưa tính'}</span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-3">
              <span className="text-lg font-bold text-slate-900">Tổng cộng:</span>
              <span className="text-xl font-bold text-slate-900">{formatCurrency(getTotalPrice() + shippingFee)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}