import { ShoppingCart } from 'lucide-react';
import { Product } from '../data/stationeryData';
import { useCart } from '../contexts/CartContext';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const handleAddToCart = () => {
    addToCart(product);
  };

  return (
    <article className="soft-card group flex h-full flex-col overflow-hidden transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_55px_-30px_rgba(15,23,42,0.75)]">
      <div className="relative overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="aspect-square w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/25 via-transparent to-transparent opacity-40" />

        <span className="absolute left-4 top-4 rounded-full border border-white/60 bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700">
          {product.category}
        </span>

        <span
          className={`absolute right-4 top-4 rounded-full px-3 py-1 text-xs font-semibold ${
            product.stock > 0 ? 'bg-teal-500 text-white' : 'bg-rose-500 text-white'
          }`}
        >
          {product.stock > 0 ? `Còn ${product.stock}` : 'Hết hàng'}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="line-clamp-2 h-14 text-lg font-bold text-slate-900">{product.name}</h3>

        <p className="mt-2 line-clamp-2 h-10 text-sm text-slate-600">{product.description}</p>

        <div className="mt-5 flex items-end justify-between gap-3">
          <div>
            <p className="text-2xl font-bold text-slate-900">{formatCurrency(product.price)}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.12em] text-slate-500">Giá đã bao gồm VAT</p>
          </div>

          <div className="rounded-lg bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">
            Mã {product.id}
          </div>
        </div>
      </div>

      <div className="px-5 pb-5">
        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          type="button"
          className="primary-btn flex w-full items-center justify-center gap-2 text-sm disabled:transform-none"
        >
          <ShoppingCart className="w-5 h-5" />
          {product.stock === 0 ? 'Hết hàng' : 'Thêm vào giỏ'}
        </button>
      </div>
    </article>
  );
}
