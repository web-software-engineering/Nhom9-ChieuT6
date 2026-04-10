import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ShoppingCart, Star } from "lucide-react";
import {
  products as mockProducts,
  type Product as MockProduct,
} from "../data/stationeryData";

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const product = useMemo<MockProduct | undefined>(() => {
    if (!id) return undefined;
    return mockProducts.find((item) => item.id === id);
  }, [id]);

  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return mockProducts.filter(
      (item) => item.category === product.category && item.id !== product.id,
    );
  }, [product]);

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
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white p-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft size={20} />
          Quay lại
        </button>
      </div>

      <div className="mx-auto mt-4 max-w-6xl rounded-lg bg-white p-6 shadow">
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <div className="mb-4 rounded-lg bg-gray-100 p-4">
              <img
                src={primaryImage}
                alt={product.name}
                className="h-96 w-full object-contain"
              />
            </div>

            {imageList.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {imageList.map((img, index) => (
                  <button
                    key={img}
                    type="button"
                    onClick={() => setSelectedImage(index)}
                    className={`h-20 w-20 flex-shrink-0 rounded border-2 ${
                      selectedImage === index
                        ? "border-blue-500"
                        : "border-gray-200"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`View ${index + 1}`}
                      className="h-full w-full object-contain"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="mb-4">
              <span className="text-sm text-gray-500">{product.category}</span>
              <h1 className="mt-2 text-3xl font-bold">{product.name}</h1>
            </div>

            <div className="mb-4 flex items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, index) => (
                  <Star key={index} size={20} className="text-yellow-300" />
                ))}
              </div>
              <span className="text-sm text-gray-600">Dữ liệu mẫu</span>
            </div>

            <div className="mb-6">
              <p className="text-4xl font-bold text-red-600">
                {product.price.toLocaleString("vi-VN")} ₫
              </p>
              <p className="mt-2 text-sm text-gray-500">
                {product.stock > 0
                  ? `Còn ${product.stock} sản phẩm`
                  : "Hết hàng"}
              </p>
            </div>

            <div className="mb-6">
              <h3 className="mb-2 font-bold">Mô tả sản phẩm</h3>
              <p className="whitespace-pre-wrap text-gray-700">
                {product.description}
              </p>
            </div>

            <div className="mb-6 flex gap-4">
              <div className="flex items-center rounded-lg border">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 hover:bg-gray-100"
                >
                  −
                </button>
                <input
                  type="number"
                  min={1}
                  max={product.stock}
                  value={quantity}
                  onChange={(event) =>
                    setQuantity(
                      Math.max(
                        1,
                        Math.min(
                          product.stock,
                          Number(event.target.value) || 1,
                        ),
                      ),
                    )
                  }
                  className="w-16 border-l border-r py-2 text-center"
                />
                <button
                  type="button"
                  onClick={() =>
                    setQuantity(Math.min(product.stock, quantity + 1))
                  }
                  className="px-3 py-2 hover:bg-gray-100"
                >
                  +
                </button>
              </div>

              <button
                type="button"
                onClick={() => navigate("/store")}
                disabled={product.stock === 0}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                <ShoppingCart size={20} />
                Thêm vào giỏ
              </button>
            </div>

            <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
              Trang chi tiết đang dùng dữ liệu mẫu để hiển thị ổn định khi
              backend không có sản phẩm.
            </div>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <div className="mt-12 border-t pt-8">
            <h2 className="mb-6 text-2xl font-bold">Sản phẩm liên quan</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-6">
              {relatedProducts.map((relatedProduct) => (
                <button
                  key={relatedProduct.id}
                  type="button"
                  onClick={() => navigate(`/product/${relatedProduct.id}`)}
                  className="overflow-hidden rounded-lg border transition hover:shadow-lg"
                >
                  <img
                    src={relatedProduct.image}
                    alt={relatedProduct.name}
                    className="h-40 w-full bg-gray-100 object-contain"
                  />
                  <div className="p-3 text-left">
                    <p className="line-clamp-2 text-sm font-semibold">
                      {relatedProduct.name}
                    </p>
                    <p className="mt-2 font-bold text-red-600">
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
