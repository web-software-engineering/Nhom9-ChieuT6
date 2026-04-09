import React, { useEffect, useState } from "react";
import axios from "axios";

// Interfaces
interface Category {
  category_ID: number;
  category_name: string;
}

interface Product {
  product_ID: number;
  category_ID: number;
  seller_ID: number;
  product_name: string;
  product_image: string | null;
  category_name?: string;
  price: number;
  number: number;
  import_date?: string;
}

// API
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const API_PRODUCTS = `${API_URL}/api/products`;
const API_CATEGORIES = `${API_URL}/api/categories`;

// Modal form props
interface ProductFormProps {
  categories: Category[];
  product?: Product;
  onClose: () => void;
  onSave: () => void;
}

const ProductFormModal: React.FC<ProductFormProps> = ({ categories, product, onClose, onSave }) => {
  const [form, setForm] = useState({
    category_ID: product?.category_ID || 0,
    product_name: product?.product_name || "",
    price: product?.price.toString() || "",
    number: product?.number.toString() || "",
    product_image: null as File | null,
    import_date: product?.import_date ? product.import_date.split("T")[0] : "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const price = Number(form.price);
    const number = Number(form.number);

    if (form.category_ID === 0) return alert("Chọn danh mục!");
    if (!form.product_name) return alert("Nhập tên sản phẩm!");
    if (isNaN(price) || price < 0) return alert("Giá không hợp lệ!");
    if (isNaN(number) || number < 0) return alert("Số lượng không hợp lệ!");

    const formData = new FormData();
    formData.append("category_ID", form.category_ID.toString());
    formData.append("product_name", form.product_name);
    formData.append("price", price.toString());
    formData.append("number", number.toString());
    if (form.product_image) formData.append("product_image", form.product_image);
    formData.append("import_date", form.import_date || new Date().toISOString().split("T")[0]);

    try {
      if (product) {
        await axios.put(`${API_PRODUCTS}/${product.product_ID}`, formData);
      } else {
        await axios.post(API_PRODUCTS, formData);
      }
      onSave();
    } catch (err) {
      console.error(err);
      alert("Lưu sản phẩm thất bại!");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 overflow-y-auto">
      <div className="bg-white p-6 rounded w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">{product ? "Sửa" : "Thêm"} sản phẩm</h2>
        <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
          <select
            className="border px-3 py-2 rounded"
            value={form.category_ID}
            onChange={(e) => setForm({ ...form, category_ID: Number(e.target.value) })}
          >
            <option value={0}>Chọn danh mục</option>
            {categories.map(c => <option key={c.category_ID} value={c.category_ID}>{c.category_name}</option>)}
          </select>

          <input type="text" placeholder="Tên sản phẩm" value={form.product_name} onChange={(e) => setForm({ ...form, product_name: e.target.value })} className="border px-3 py-2 rounded" />
          <input type="number" min={0} placeholder="Giá sản phẩm" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="border px-3 py-2 rounded" />
          <input type="number" min={0} placeholder="Số lượng" value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} className="border px-3 py-2 rounded" />
          <input type="date" value={form.import_date} onChange={(e) => setForm({ ...form, import_date: e.target.value })} className="border px-3 py-2 rounded" />
          <input type="file" onChange={(e) => setForm({ ...form, product_image: e.target.files ? e.target.files[0] : null })} className="border px-3 py-2 rounded" />

          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="border px-4 py-2 rounded">Hủy</button>
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Lưu</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ProductManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const res = await axios.get<Product[]>(API_PRODUCTS);
      setProducts(res.data);
    } catch (err) {
      console.error(err);
      alert("Không thể tải sản phẩm!");
    } finally {
      setLoadingProducts(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get<Category[]>(API_CATEGORIES);
      setCategories(res.data);
    } catch (err) {
      console.error(err);
      alert("Không thể tải danh mục!");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Bạn có chắc muốn xóa?")) return;
    await axios.delete(`${API_PRODUCTS}/${id}`);
    fetchProducts();
    setSelectedProducts(selectedProducts.filter(pid => pid !== id));
  };

  const handleDeleteSelected = async () => {
    if (!selectedProducts.length) return alert("Chưa chọn sản phẩm nào!");
    if (!window.confirm(`Xóa ${selectedProducts.length} sản phẩm?`)) return;
    await Promise.all(selectedProducts.map(id => axios.delete(`${API_PRODUCTS}/${id}`)));
    setSelectedProducts([]);
    fetchProducts();
  };

  const filteredProducts = products.filter(
    p => p.product_name.toLowerCase().includes(search.toLowerCase()) ||
         (p.category_name || "").toLowerCase().includes(search.toLowerCase())
  );

  const handleCheck = (id: number, checked: boolean) => {
    if (checked) setSelectedProducts(prev => [...prev, id]);
    else setSelectedProducts(prev => prev.filter(x => x !== id));
  };

  const handleCheckAll = (checked: boolean) => {
    if (checked) setSelectedProducts(filteredProducts.map(p => p.product_ID));
    else setSelectedProducts([]);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Quản Lý Sản Phẩm</h1>

      <div className="flex flex-col sm:flex-row sm:justify-between mb-4 gap-2">
        <input type="text" placeholder="🔍 Tìm kiếm sản phẩm..." className="border px-3 py-2 rounded w-full sm:w-1/3" value={search} onChange={e => setSearch(e.target.value)} />
        <div className="flex gap-2">
          <button className="bg-green-500 text-white px-5 py-2 rounded hover:bg-green-600" onClick={() => { setEditingProduct(undefined); setShowModal(true); }}>+ Thêm sản phẩm</button>
          <button className="bg-red-500 text-white px-5 py-2 rounded hover:bg-red-600" onClick={handleDeleteSelected}>Xóa đã chọn</button>
        </div>
      </div>

      <div className="overflow-x-auto border rounded shadow">
        <table className="min-w-full bg-white text-center">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 border">
                <input type="checkbox" checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0} onChange={e => handleCheckAll(e.target.checked)} />
              </th>
              <th className="px-4 py-2 border">ID</th>
              <th className="px-4 py-2 border">Danh mục</th>
              <th className="px-4 py-2 border">Tên</th>
              <th className="px-4 py-2 border">Giá</th>
              <th className="px-4 py-2 border">Số lượng</th>
              <th className="px-4 py-2 border">Tình trạng</th>
              <th className="px-4 py-2 border">Ngày nhập</th>
              <th className="px-4 py-2 border">Hình</th>
              <th className="px-4 py-2 border">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loadingProducts ? (
              <tr><td colSpan={10} className="py-4">Đang tải dữ liệu...</td></tr>
            ) : filteredProducts.length === 0 ? (
              <tr><td colSpan={10} className="py-4 text-gray-500">Không có dữ liệu</td></tr>
            ) : filteredProducts.map(p => (
              <tr key={p.product_ID} className="hover:bg-gray-50">
                <td className="border px-2 py-2">
                  <input type="checkbox" checked={selectedProducts.includes(p.product_ID)} onChange={e => handleCheck(p.product_ID, e.target.checked)} />
                </td>
                <td className="border px-2 py-2">{p.product_ID}</td>
                <td className="border">{p.category_name}</td>
                <td className="border">{p.product_name}</td>
                <td className="border">{p.price.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}</td>
                <td className="border">{p.number}</td>
                <td className="border">
                  {p.number === 0 ? <span className="text-red-600 font-bold">Hết hàng</span>
                  : p.number <= 3 ? <span className="text-orange-600 font-bold">Sắp hết</span>
                  : <span className="text-green-600">Còn hàng</span>}
                </td>
                <td className="border">{p.import_date ? new Date(p.import_date).toLocaleDateString() : "-"}</td>
                <td className="border">{p.product_image ? <img src={p.product_image.startsWith("http") ? p.product_image : `${API_URL}/${p.product_image}`} className="w-16 h-16 object-cover mx-auto" /> : <span>Chưa có</span>}</td>
                <td className="border flex justify-center gap-2 py-2">
                  <button className="bg-blue-500 text-white px-3 py-1 rounded" onClick={() => { setEditingProduct(p); setShowModal(true); }}>Sửa</button>
                  <button className="bg-red-500 text-white px-3 py-1 rounded" onClick={() => handleDelete(p.product_ID)}>Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && <ProductFormModal categories={categories} product={editingProduct} onClose={() => setShowModal(false)} onSave={() => { setShowModal(false); fetchProducts(); }} />}
    </div>
  );
};

export default ProductManagement;