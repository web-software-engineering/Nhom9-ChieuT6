import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ShoppingCart, Star } from "lucide-react";
import { useCart } from "../contexts/CartContext";
import { fetchProductById, fetchProducts } from "../services/productService";
import type { Product } from "../types/product";

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<Product | undefined>(undefined);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const productList = await fetchProducts();
        setAllProducts(productList);

        try {
          const productData = await fetchProductById(id);
          setProduct(productData);
        } catch {
          const fallbackProduct = productList.find(
            (item) => String(item.productId) === id || item.id === id,
          );
          setProduct(fallbackProduct);
        }
      } catch (error) {
        console.error("Không tải được chi tiết sản phẩm:", error);
        setProduct(undefined);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  useEffect(() => {
    if (!product) return;
    setQuantity(product.stock > 0 ? 1 : 0);
  }, [product]);

  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return allProducts.filter(
      (item) => item.category === product.category && item.id !== product.id,
    );
  }, [allProducts, product]);

  const handleAddToCart = () => {
    if (!product || product.stock <= 0 || quantity <= 0) return;
    for (let index = 0; index < quantity; index += 1) {
      addToCart(product);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4 text-center">
        <p className="text-xl font-semibold text-slate-700">
          Đang tải chi tiết sản phẩm...
        </p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4 text-center">
        <div>
          <p className="text-2xl font-bold text-slate-900">
            Sản phẩm không tồn tại
          </p>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="secondary-btn mt-6"
          >
            Quay lại trang chủ
          </button>
        </div>
      </div>
    );
  }

  const imageList = [product.image];
  const primaryImage = imageList[selectedImage] || imageList[0];

  return (
    <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 pb-10 pt-4 sm:px-6 lg:px-8">
      <div className="glass-panel mb-5 flex items-center justify-between gap-3 rounded-2xl px-4 py-3 sm:px-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="pill-tab text-slate-700 hover:bg-slate-100"
        >
          <ArrowLeft size={18} />
          Quay lại
        </button>

        <span className="hidden text-sm font-semibold text-slate-500 sm:inline">
          Office Smart / Chi tiết sản phẩm
        </span>
      </div>

      <div className="soft-card animate-fade-in overflow-hidden">
        <div className="grid gap-0 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
          <div className="bg-gradient-to-br from-teal-50 via-white to-orange-50 p-4 sm:p-6 lg:p-8">
            <div className="relative overflow-hidden rounded-3xl bg-white/85 p-4 shadow-[0_24px_50px_-36px_rgba(15,23,42,0.75)]">
              <div className="absolute left-4 top-4 z-10 flex flex-wrap gap-2">
                <span className="rounded-full border border-white/70 bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700">
                  {product.category}
                </span>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    product.stock > 0
                      ? "bg-teal-500 text-white"
                      : "bg-rose-500 text-white"
                  }`}
                >
                  {product.stock > 0 ? `Còn ${product.stock}` : "Hết hàng"}
                </span>
              </div>

              <img
                src={primaryImage}
                alt={product.name}
                className="animate-float-up h-[20rem] w-full object-contain pt-10 sm:h-[28rem]"
              />
            </div>

            {imageList.length > 1 && (
              <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
                {imageList.map((img, index) => (
                  <button
                    key={img}
                    type="button"
                    onClick={() => setSelectedImage(index)}
                    className={`h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl border bg-white/90 p-1 transition ${
                      selectedImage === index
                        ? "border-teal-500 shadow-[0_14px_30px_-18px_rgba(15,118,110,0.8)]"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`View ${index + 1}`}
                      className="h-full w-full rounded-xl object-contain"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col p-5 sm:p-6 lg:p-8">
            <div className="mb-4 space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-600">
                Chi tiết sản phẩm
              </p>
              <h1 className="text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
                {product.name}
              </h1>
            </div>

            <div className="mb-5 flex items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, index) => (
                  <Star
                    key={index}
                    size={18}
                    className="fill-amber-300 text-amber-300"
                  />
                ))}
              </div>
              <span className="text-sm text-slate-500">Đánh giá sản phẩm</span>
            </div>

            <div className="mb-6 rounded-2xl bg-slate-50 p-4 sm:p-5">
              <p className="text-3xl font-bold text-slate-900 sm:text-4xl">
                {product.price.toLocaleString("vi-VN")} ₫
              </p>
              <p className="mt-2 text-sm text-slate-600">
                {product.stock > 0
                  ? `Còn ${product.stock} sản phẩm trong kho`
                  : "Sản phẩm hiện đã hết hàng"}
              </p>
            </div>

            <div className="mb-6">
              <h3 className="mb-3 text-lg font-bold text-slate-900">
                Mô tả sản phẩm
              </h3>
              <p className="whitespace-pre-wrap text-sm leading-7 text-slate-600 sm:text-base">
                {product.description}
              </p>
            </div>

            <div className="mt-auto rounded-3xl border border-slate-200/80 bg-white p-4 shadow-[0_18px_38px_-28px_rgba(15,23,42,0.7)] sm:p-5">
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <div className="inline-flex items-center rounded-2xl border border-slate-200 bg-slate-50 p-1">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="h-11 w-11 rounded-xl text-lg font-semibold text-slate-700 transition hover:bg-white"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min={product.stock > 0 ? 1 : 0}
                    max={product.stock}
                    value={quantity}
                    onChange={(event) =>
                      setQuantity(
                        Math.max(
                          product.stock > 0 ? 1 : 0,
                          Math.min(
                            product.stock,
                            Number(event.target.value) ||
                              (product.stock > 0 ? 1 : 0),
                          ),
                        ),
                      )
                    }
                    className="w-16 border-0 bg-transparent text-center text-base font-semibold text-slate-900 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setQuantity(Math.min(product.stock, quantity + 1))
                    }
                    className="h-11 w-11 rounded-xl text-lg font-semibold text-slate-700 transition hover:bg-white"
                  >
                    +
                  </button>
                </div>

                <p className="text-sm text-slate-500">
                  Chọn số lượng trước khi thêm vào giỏ.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="primary-btn flex flex-1 items-center justify-center gap-2 text-sm disabled:transform-none"
                >
                  <ShoppingCart size={20} />
                  Thêm vào giỏ
                </button>

                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="secondary-btn flex items-center justify-center text-sm sm:w-40"
                >
                  Quay lại
                </button>
              </div>
            </div>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <div className="border-t border-slate-200/80 bg-white px-5 py-6 sm:px-6 lg:px-8">
            <div className="mb-5 flex items-end justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Sản phẩm liên quan
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Cùng danh mục với sản phẩm bạn đang xem.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
              {relatedProducts.map((relatedProduct) => (
                <button
                  key={relatedProduct.id}
                  type="button"
                  onClick={() => navigate(`/product/${relatedProduct.id}`)}
                  className="soft-card overflow-hidden text-left transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_55px_-30px_rgba(15,23,42,0.75)]"
                >
                  <div className="relative">
                    <img
                      src={relatedProduct.image}
                      alt={relatedProduct.name}
                      className="h-40 w-full bg-slate-50 object-contain"
                    />
                    <span className="absolute left-3 top-3 rounded-full border border-white/60 bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                      {relatedProduct.category}
                    </span>
                  </div>

                  <div className="p-4">
                    <p className="line-clamp-2 text-sm font-semibold text-slate-900">
                      {relatedProduct.name}
                    </p>
                    <p className="mt-2 text-sm font-bold text-slate-900">
                      {relatedProduct.price.toLocaleString("vi-VN")} ₫
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
