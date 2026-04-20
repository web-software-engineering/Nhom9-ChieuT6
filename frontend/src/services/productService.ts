import api from "../api/api";
import type { BackendProduct, Product } from "../types/product";

const API_HOST = (
  import.meta.env.VITE_API_URL || "http://localhost:3000"
).replace(/\/+$/, "");

const buildImageUrl = (rawPath?: string | null): string => {
  if (!rawPath) {
    return "https://placehold.co/800x800?text=No+Image";
  }
  if (rawPath.startsWith("http://") || rawPath.startsWith("https://"))
    return rawPath;
  const normalized = rawPath.replace(/^\/+/, "");
  return `${API_HOST}/${normalized}`;
};

const normalizeDescription = (value?: string | null): string => {
  const text = String(value ?? "").trim();
  if (text) return text;
  return "Sản phẩm văn phòng phẩm chất lượng, phù hợp cho học tập và làm việc.";
};

const mapBackendProduct = (item: BackendProduct): Product => ({
  id: String(item.product_ID),
  productId: item.product_ID,
  name: item.product_name,
  category: item.category_name || "Chưa phân loại",
  price: Number(item.price ?? 0),
  image: buildImageUrl(item.product_image),
  description: normalizeDescription(item.description),
  stock: Number(item.number ?? 0),
  weight: 0.1,
});

export const fetchProducts = async (): Promise<Product[]> => {
  const response = await api.get<BackendProduct[]>("/products");
  return response.data.map(mapBackendProduct);
};

export const fetchProductById = async (id: string): Promise<Product> => {
  const response = await api.get<BackendProduct>(`/products/${id}`);
  return mapBackendProduct(response.data);
};

export const fetchCategories = async (): Promise<string[]> => {
  const response =
    await api.get<Array<{ category_ID: number; category_name: string }>>(
      "/categories",
    );
  return ["Tất cả", ...response.data.map((item) => item.category_name)];
};
