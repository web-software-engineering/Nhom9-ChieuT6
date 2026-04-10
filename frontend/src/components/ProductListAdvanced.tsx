import React, { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import ProductCard from "./ProductCard";
import {
  categories as mockCategories,
  products as mockProducts,
} from "../data/stationeryData";

const sortOptions = [
  { value: "latest", label: "Mới nhất" },
  { value: "price-asc", label: "Giá: Thấp → Cao" },
  { value: "price-desc", label: "Giá: Cao → Thấp" },
] as const;

const ProductListAdvanced: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(1000000);
  const [sortBy, setSortBy] =
    useState<(typeof sortOptions)[number]["value"]>("latest");
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);

  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  const categoryOptions = useMemo(
    () => mockCategories.filter((category) => category !== "Tất cả"),
    [],
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(event.target as Node)
      ) {
        setIsCategoryOpen(false);
      }

      if (
        sortDropdownRef.current &&
        !sortDropdownRef.current.contains(event.target as Node)
      ) {
        setIsSortOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredProducts = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase();

    const result = mockProducts.filter((product) => {
      const matchesSearch =
        !keyword ||
        product.name.toLowerCase().includes(keyword) ||
        product.description.toLowerCase().includes(keyword);
      const matchesCategory =
        selectedCategory === "Tất cả" || product.category === selectedCategory;
      const matchesPrice =
        product.price >= minPrice && product.price <= maxPrice;

      return matchesSearch && matchesCategory && matchesPrice;
    });

    switch (sortBy) {
      case "price-asc":
        return [...result].sort((left, right) => left.price - right.price);
      case "price-desc":
        return [...result].sort((left, right) => right.price - left.price);
      case "latest":
      default:
        return [...result].sort((left, right) =>
          right.id.localeCompare(left.id),
        );
    }
  }, [searchQuery, selectedCategory, minPrice, maxPrice, sortBy]);

  const hasActiveFilters =
    searchQuery ||
    selectedCategory !== "Tất cả" ||
    minPrice > 0 ||
    maxPrice < 1000000 ||
    sortBy !== "latest";

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("Tất cả");
    setMinPrice(0);
    setMaxPrice(1000000);
    setSortBy("latest");
  };

  return (
    <div className="space-y-6">
      <section className="soft-card p-5 sm:p-6">
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm theo tên hoặc mô tả..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="input-modern pl-12 shadow-[0_18px_35px_-30px_rgba(15,23,42,0.65)]"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div ref={categoryDropdownRef} className="relative min-w-0">
              <button
                type="button"
                aria-haspopup="listbox"
                aria-expanded={isCategoryOpen}
                onClick={() => setIsCategoryOpen((value) => !value)}
                className={`input-modern flex items-center justify-between gap-3 px-3 py-2 shadow-[0_18px_35px_-30px_rgba(15,23,42,0.75)] ${
                  isCategoryOpen
                    ? "border-teal-500 ring-4 ring-teal-500/15"
                    : ""
                }`}
              >
                <span className="min-w-0 flex-1 truncate text-left text-sm font-semibold text-slate-800">
                  {selectedCategory}
                </span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-slate-400 transition ${
                    isCategoryOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isCategoryOpen && (
                <div className="absolute right-0 top-[calc(100%+0.55rem)] z-30 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_24px_50px_-30px_rgba(15,23,42,0.35)]">
                  <div
                    role="listbox"
                    aria-label="Danh mục sản phẩm"
                    className="max-h-72 space-y-1 overflow-y-auto"
                  >
                    <button
                      type="button"
                      role="option"
                      aria-selected={selectedCategory === "Tất cả"}
                      onClick={() => {
                        setSelectedCategory("Tất cả");
                        setIsCategoryOpen(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-sm font-medium transition ${
                        selectedCategory === "Tất cả"
                          ? "bg-teal-50 text-teal-700"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <span className="truncate">Tất cả</span>
                      {selectedCategory === "Tất cả" && (
                        <Check className="ml-3 h-4 w-4 shrink-0" />
                      )}
                    </button>

                    {categoryOptions.map((category) => {
                      const isSelected = selectedCategory === category;

                      return (
                        <button
                          key={category}
                          type="button"
                          role="option"
                          aria-selected={isSelected}
                          onClick={() => {
                            setSelectedCategory(category);
                            setIsCategoryOpen(false);
                          }}
                          className={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-sm font-medium transition ${
                            isSelected
                              ? "bg-teal-50 text-teal-700"
                              : "text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          <span className="truncate">{category}</span>
                          {isSelected && (
                            <Check className="ml-3 h-4 w-4 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm text-gray-600">Giá từ</label>
              <input
                type="number"
                min={0}
                value={minPrice}
                onChange={(event) =>
                  setMinPrice(Math.max(0, Number(event.target.value)))
                }
                className="w-full rounded-lg border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-gray-600">
                Giá đến
              </label>
              <input
                type="number"
                min={0}
                value={maxPrice}
                onChange={(event) =>
                  setMaxPrice(Math.max(0, Number(event.target.value)))
                }
                className="w-full rounded-lg border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div ref={sortDropdownRef} className="relative min-w-0">
              <button
                type="button"
                aria-haspopup="listbox"
                aria-expanded={isSortOpen}
                onClick={() => setIsSortOpen((value) => !value)}
                className={`input-modern flex items-center justify-between gap-3 px-3 py-2 shadow-[0_18px_35px_-30px_rgba(15,23,42,0.75)] ${
                  isSortOpen ? "border-teal-500 ring-4 ring-teal-500/15" : ""
                }`}
              >
                <span className="min-w-0 flex-1 truncate text-left text-sm font-semibold text-slate-800">
                  {sortOptions.find((option) => option.value === sortBy)?.label}
                </span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-slate-400 transition ${
                    isSortOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isSortOpen && (
                <div className="absolute right-0 top-[calc(100%+0.55rem)] z-30 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_24px_50px_-30px_rgba(15,23,42,0.35)]">
                  {sortOptions.map((option) => {
                    const isSelected = sortBy === option.value;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          setSortBy(option.value);
                          setIsSortOpen(false);
                        }}
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-sm font-medium transition ${
                          isSelected
                            ? "bg-teal-50 text-teal-700"
                            : "text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <span className="truncate">{option.label}</span>
                        {isSelected && (
                          <Check className="ml-3 h-4 w-4 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              ↻ Reset bộ lọc
            </button>
          )}
        </div>
      </section>

      <section className="soft-card p-5 sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 px-1">
          <p className="text-sm text-slate-600 sm:text-base">
            Hiển thị{" "}
            <span className="font-bold text-slate-900">
              {filteredProducts.length}
            </span>{" "}
            sản phẩm
            {selectedCategory !== "Tất cả" && (
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
          <div className="animate-fade-in py-12 text-center">
            <p className="text-lg font-semibold text-slate-700">
              Không tìm thấy sản phẩm nào trong dữ liệu mẫu
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Thử đổi bộ lọc hoặc xóa từ khóa tìm kiếm.
            </p>
          </div>
        )}
      </section>
    </div>
  );
};

export default ProductListAdvanced;
