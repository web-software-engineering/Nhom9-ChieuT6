import React, { useEffect, useState } from "react";
import axios from "axios";

interface Category {
  category_ID: number;
  category_name: string;
}

interface Product {
  product_ID: number;
  category_ID: number;
  seller_ID: number;
  product_name: string;
  product_image: string;
  category_name?: string;
  price: number;
  number: number;
}

const API_URL_PRODUCTS = "http://localhost:3000/api/products";
const API_URL_CATEGORIES = "http://localhost:3000/api/categories";

const ProductManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [form, setForm] = useState({
    category_ID: 0,
    product_name: "",
    price: 0,
    number: 0,
    product_image: null as File | null,
  });

  // ================= FETCH =================
  const fetchProducts = async () => {
    const res = await axios.get<Product[]>(API_URL_PRODUCTS);
    setProducts(res.data);
  };

  const fetchCategories = async () => {
    const res = await axios.get<Category[]>(API_URL_CATEGORIES);
    setCategories(res.data);
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // ================= CRUD =================
  const openModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setForm({
        category_ID: product.category_ID,
        product_name: product.product_name,
        price: product.price,
        number: product.number,
        product_image: null,
      });
    } else {
      setEditingProduct(null);
      setForm({ category_ID: 0, product_name: "", price: 0, number: 0, product_image: null });
    }
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Bạn có chắc muốn xóa?")) return;
    await axios.delete(`${API_URL_PRODUCTS}/${id}`);
    fetchProducts();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("category_ID", form.category_ID.toString());
    formData.append("product_name", form.product_name);
    formData.append("price", form.price.toString());
    formData.append("number", form.number.toString());
    if (form.product_image) {
      formData.append("product_image", form.product_image);
    }

    if (editingProduct) {
      await axios.put(`${API_URL_PRODUCTS}/${editingProduct.product_ID}`, formData);
    } else {
      await axios.post(API_URL_PRODUCTS, formData);
    }

    setShowModal(false);
    fetchProducts();
  };

  // ================= FILTER =================
  const filteredProducts = products.filter(
    (p) =>
      p.product_name.toLowerCase().includes(search.toLowerCase()) ||
      (p.category_name || "").toLowerCase().includes(search.toLowerCase())
  );

  // ================= UI =================
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Quản Lý Sản Phẩm</h1>

      {/* SEARCH + BUTTON */}
      <div className="flex flex-col sm:flex-row sm:justify-between mb-4 gap-2">
        <input
          type="text"
          placeholder="🔍 Tìm kiếm sản phẩm..."
          className="border px-3 py-2 rounded w-full sm:w-1/3"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <button
          onClick={() => openModal()}
          className="bg-green-500 text-white px-5 py-2 rounded hover:bg-green-600"
        >
          + Thêm sản phẩm
        </button>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto border rounded shadow">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-100 text-center">
            <tr>
              <th className="px-4 py-2 border">ID</th>
              <th className="px-4 py-2 border">Danh mục</th>
              <th className="px-4 py-2 border">Tên</th>
              <th className="px-4 py-2 border">Giá</th>
              <th className="px-4 py-2 border">Số lượng</th>
              <th className="px-4 py-2 border">Hình</th>
              <th className="px-4 py-2 border">Hành động</th>
            </tr>
          </thead>

          <tbody className="text-center">
            {filteredProducts.map((p) => (
              <tr key={p.product_ID} className="hover:bg-gray-50">
                <td className="border px-2 py-2">{p.product_ID}</td>
                <td className="border">{p.category_name}</td>
                <td className="border">{p.product_name}</td>
                <td className="border">
                {p.price.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}
              </td>
                <td className="border">{p.number}</td>
                <td className="border">
                  {p.product_image && (
                    <img
                      src={`http://localhost:3000/${p.product_image}`}
                      className="w-16 h-16 object-cover mx-auto"
                    />
                  )}
                </td>
                <td className="border flex justify-center gap-2 py-2">
                  <button
                    className="bg-blue-500 text-white px-3 py-1 rounded"
                    onClick={() => openModal(p)}
                  >
                    Sửa
                  </button>
                  <button
                    className="bg-red-500 text-white px-3 py-1 rounded"
                    onClick={() => handleDelete(p.product_ID)}
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}

            {filteredProducts.length === 0 && (
              <tr>
                <td colSpan={7} className="py-4 text-gray-500">
                  Không có dữ liệu
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded w-1/3">
            <h2 className="text-xl font-bold mb-4">{editingProduct ? "Sửa" : "Thêm"} sản phẩm</h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <select
                value={form.category_ID}
                onChange={(e) => setForm({ ...form, category_ID: Number(e.target.value) })}
                className="border px-3 py-2 rounded"
              >
                <option value={0}>Chọn danh mục</option>
                {categories.map((c) => (
                  <option key={c.category_ID} value={c.category_ID}>
                    {c.category_name}
                  </option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Tên sản phẩm"
                value={form.product_name}
                onChange={(e) => setForm({ ...form, product_name: e.target.value })}
                className="border px-3 py-2 rounded"
              />

              <input
                type="number"
                placeholder="Giá sản phẩm"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                className="border px-3 py-2 rounded"
              />

              <input
                type="number"
                placeholder="Số lượng"
                value={form.number}
                onChange={(e) => setForm({ ...form, number: Number(e.target.value) })}
                className="border px-3 py-2 rounded"
              />

              <input
                type="file"
                onChange={(e) =>
                  setForm({ ...form, product_image: e.target.files ? e.target.files[0] : null })
                }
                className="border px-3 py-2 rounded"
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="border px-4 py-2 rounded"
                >
                  Hủy
                </button>
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
                  Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;