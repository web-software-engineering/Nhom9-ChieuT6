import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useNavigate } from './Navigation';

export default function Cart() {
  const { cartItems, updateQuantity, removeFromCart, getTotalPrice, getTotalItems } = useCart();
  const navigate = useNavigate();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  if (cartItems.length === 0) {
    return (
      <div className="soft-card p-8 text-center animate-fade-in">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
          <ShoppingBag className="h-10 w-10" />
        </div>
        <h3 className="text-2xl font-bold text-slate-900">Giỏ hàng đang trống</h3>
        <p className="mt-2 text-slate-600">Mua hàng ngay</p>
        <button
          onClick={() => navigate('home')}
          className="secondary-btn mt-6"
          type="button"
        >
          Tiếp tục mua sắm
        </button>
      </div>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
      <section className="soft-card p-5 sm:p-6">
        <h2 className="text-2xl font-bold text-slate-900">Giỏ hàng của bạn ({getTotalItems()} sản phẩm)</h2>

        <div className="mt-5 space-y-4">
          {cartItems.map((item) => (
            <article
              key={item.product.id}
              className="rounded-2xl border border-slate-200/80 bg-white p-4 transition hover:border-slate-300 sm:p-5"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="h-20 w-20 rounded-xl border border-slate-200 object-cover"
                />

                <div className="min-w-0 flex-1">
                  <h4 className="truncate text-base font-bold text-slate-900 sm:text-lg">{item.product.name}</h4>
                  <p className="mt-1 text-sm text-slate-500">{item.product.category}</p>
                  <p className="mt-2 text-sm font-semibold text-slate-700">{formatCurrency(item.product.price)} / sản phẩm</p>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50"
                      type="button"
                    >
                      <Minus className="h-4 w-4" />
                    </button>

                    <span className="inline-flex h-9 min-w-10 items-center justify-center rounded-lg bg-slate-100 px-3 font-bold text-slate-700">
                      {item.quantity}
                    </span>

                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      disabled={item.quantity >= item.product.stock}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-45"
                      type="button"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:block sm:text-right">
                  <p className="text-lg font-bold text-slate-900">{formatCurrency(item.product.price * item.quantity)}</p>

                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="mt-2 inline-flex items-center gap-1 rounded-lg bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-100"
                    type="button"
                  >
                    <Trash2 className="h-4 w-4" />
                    Xóa
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <aside className="soft-card h-fit p-6 xl:sticky xl:top-24">
        <h3 className="text-xl font-bold text-slate-900">Tổng đơn hàng</h3>

        <div className="mt-5 space-y-3">
          <div className="flex justify-between">
            <span className="text-slate-600">Tạm tính:</span>
            <span className="font-semibold">{formatCurrency(getTotalPrice())}</span>
          </div>
          <div className="flex justify-between text-sm text-slate-500">
            <span>Phí vận chuyển:</span>
            <span>Tính ở bước tiếp theo</span>
          </div>
          <div className="flex items-center justify-between border-t border-slate-200 pt-3">
            <span className="text-lg font-bold text-slate-900">Tổng tiền:</span>
            <span className="text-2xl font-bold text-slate-900">
              {formatCurrency(getTotalPrice())}
            </span>
          </div>
        </div>

        <button
          onClick={() => navigate('checkout')}
          className="primary-btn mt-6 flex w-full items-center justify-center gap-2 py-3.5"
          type="button"
        >
          Tiến hành thanh toán
          <ArrowRight className="h-4 w-4" />
        </button>
      </aside>
    </div>
  );
}
