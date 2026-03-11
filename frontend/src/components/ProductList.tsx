import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, Search, SlidersHorizontal } from 'lucide-react';
import ProductCard from './ProductCard';
import { products, categories } from '../data/stationeryData';

export default function ProductList() {
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const categoryDropdownRef = useRef<HTMLDivElement | null>(null);
  const hasActiveFilters = selectedCategory !== 'Tất cả' || searchQuery.length > 0;

  const filteredProducts = useMemo(
    () =>
      products.filter((product) => {
        const matchesCategory = selectedCategory === 'Tất cả' || product.category === selectedCategory;
        const matchesSearch =
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesCategory && matchesSearch;
      }),
    [selectedCategory, searchQuery]
  );

  const resetFilters = () => {
    setSelectedCategory('Tất cả');
    setSearchQuery('');
  };

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!categoryDropdownRef.current?.contains(event.target as Node)) {
        setIsCategoryMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsCategoryMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const handleSelectCategory = (category: string) => {
    setSelectedCategory(category);
    setIsCategoryMenuOpen(false);
  };

  return (
    <div className="space-y-6">
      <section className="soft-card p-5 sm:p-6">
        <div className="grid grid-cols-[minmax(0,1fr)_160px] gap-3 sm:grid-cols-[minmax(0,1fr)_240px] sm:gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="relative min-w-0">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm theo tên hoặc mô tả..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-modern pl-12 shadow-[0_18px_35px_-30px_rgba(15,23,42,0.65)]"
            />
          </div>

          <div ref={categoryDropdownRef} className="relative min-w-0">
            <button
              type="button"
              aria-haspopup="listbox"
              aria-expanded={isCategoryMenuOpen}
              aria-label="Lọc theo danh mục"
              onClick={() => setIsCategoryMenuOpen((currentValue) => !currentValue)}
              className={`input-modern flex items-center gap-3 px-3 py-2 shadow-[0_18px_35px_-30px_rgba(15,23,42,0.75)] ${
                isCategoryMenuOpen ? 'border-teal-500 ring-4 ring-teal-500/15' : ''
              }`}
            >
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white">
                <SlidersHorizontal className="h-4 w-4" />
              </span>

              <span className="min-w-0 flex-1 truncate text-left text-sm font-semibold text-slate-800">
                {selectedCategory}
              </span>

              <ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition ${isCategoryMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {isCategoryMenuOpen && (
              <div className="absolute right-0 top-[calc(100%+0.55rem)] z-30 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_24px_50px_-30px_rgba(15,23,42,0.35)]">
                <div role="listbox" aria-label="Danh mục sản phẩm" className="max-h-72 space-y-1 overflow-y-auto">
                  {categories.map((category) => {
                    const isSelected = selectedCategory === category;

                    return (
                      <button
                        key={category}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => handleSelectCategory(category)}
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-sm font-medium transition ${
                          isSelected
                            ? 'bg-teal-50 text-teal-700'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span className="truncate">{category}</span>
                        {isSelected && <Check className="ml-3 h-4 w-4 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        <p className="text-sm text-slate-600 sm:text-base">
          Hiển thị <span className="font-bold text-slate-900">{filteredProducts.length}</span> sản phẩm
          {selectedCategory !== 'Tất cả' && (
            <span className="ml-2 rounded-full bg-teal-50 px-2 py-1 text-xs font-semibold text-teal-700">
              {selectedCategory}
            </span>
          )}

          {searchQuery && (
            <span className="ml-2 rounded-full bg-orange-50 px-2 py-1 text-xs font-semibold text-orange-700">
              {searchQuery}
            </span>
          )}
        </p>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={resetFilters}
            className="text-sm font-semibold text-slate-500 transition hover:text-slate-800"
          >
            Xóa bộ lọc
          </button>
        )}
      </div>

      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="soft-card py-12 text-center animate-fade-in">
          <p className="text-lg font-semibold text-slate-700">Không tìm thấy sản phẩm phù hợp</p>
          <p className="mt-2 text-sm text-slate-500">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.</p>

          {hasActiveFilters && (
            <button type="button" onClick={resetFilters} className="secondary-btn mt-5 text-sm">
              Xem lại tất cả sản phẩm
            </button>
          )}
        </div>
      )}
    </div>
  );
}
