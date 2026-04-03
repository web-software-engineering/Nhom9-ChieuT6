import React, { useEffect, useState } from "react";
import axios from "axios";

interface DanhMuc {
  category_ID: number;
  category_name: string;
  category_type: string;
}

const API_URL = "http://localhost:3000/api/categories";

const QuanLyDanhMuc: React.FC = () => {
  const [danhMuc, setDanhMuc] = useState<DanhMuc[]>([]);
  const [timKiem, setTimKiem] = useState("");
  const [hienModal, setHienModal] = useState(false);
  const [dangSua, setDangSua] = useState<DanhMuc | null>(null);
  const [form, setForm] = useState({ category_name: "", category_type: "" });

  const layDanhMuc = async () => {
    try {
      const res = await axios.get<DanhMuc[]>(API_URL);
      setDanhMuc(res.data);
    } catch (err) {
      console.error("Lỗi khi lấy danh mục:", err);
    }
  };

  useEffect(() => {
    layDanhMuc();
  }, []);

  const xoaDanhMuc = async (id: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa danh mục này?")) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      layDanhMuc();
    } catch (err) {
      console.error("Lỗi khi xóa danh mục:", err);
    }
  };

  const moModal = (dm?: DanhMuc) => {
    if (dm) {
      setDangSua(dm);
      setForm({ category_name: dm.category_name, category_type: dm.category_type });
    } else {
      setDangSua(null);
      setForm({ category_name: "", category_type: "" });
    }
    setHienModal(true);
  };

  const guiForm = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (dangSua) {
        await axios.put(`${API_URL}/${dangSua.category_ID}`, form);
      } else {
        await axios.post(API_URL, form);
      }
      setHienModal(false);
      layDanhMuc();
    } catch (err) {
      console.error("Lỗi khi gửi form:", err);
    }
  };

  const danhMucLoc = danhMuc.filter(
    (dm) =>
      dm.category_name.toLowerCase().includes(timKiem.toLowerCase()) ||
      dm.category_type.toLowerCase().includes(timKiem.toLowerCase())
  );

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Quản Lý Danh Mục</h1>

      <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center mb-4 gap-2">
        <input
          type="text"
          placeholder="🔍 Tìm kiếm danh mục..."
          className="border border-gray-300 rounded px-3 py-2 w-full sm:w-1/3 focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={timKiem}
          onChange={(e) => setTimKiem(e.target.value)}
        />
        <button
          onClick={() => moModal()}
          className="bg-green-500 text-white px-5 py-2 rounded hover:bg-green-600 transition-all"
        >
          + Thêm danh mục
        </button>
      </div>

      <div className="overflow-x-auto border rounded shadow">
        <table className="min-w-full bg-white divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr className="text-gray-700 text-center">
              <th className="px-4 py-2 border">ID</th>
              <th className="px-4 py-2 border">Tên danh mục</th>
              <th className="px-4 py-2 border">Loại danh mục</th>
              <th className="px-4 py-2 border">Hành động</th>
            </tr>
          </thead>
          <tbody className="text-center">
            {danhMucLoc.map((dm) => (
              <tr key={dm.category_ID} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-2 border">{dm.category_ID}</td>
                <td className="px-4 py-2 border">{dm.category_name}</td>
                <td className="px-4 py-2 border">{dm.category_type}</td>
                <td className="px-4 py-2 border flex justify-center gap-2">
                  <button
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-all"
                    onClick={() => moModal(dm)}
                  >
                    Sửa
                  </button>
                  <button
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-all"
                    onClick={() => xoaDanhMuc(dm.category_ID)}
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
            {danhMucLoc.length === 0 && (
              <tr>
                <td colSpan={4} className="py-4 text-gray-500">
                  Không tìm thấy danh mục nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {hienModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg w-11/12 sm:w-1/3 p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-700">
              {dangSua ? "Sửa danh mục" : "Thêm danh mục"}
            </h2>
            <form onSubmit={guiForm} className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Tên danh mục"
                className="border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={form.category_name}
                onChange={(e) => setForm({ ...form, category_name: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Loại danh mục"
                className="border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={form.category_type}
                onChange={(e) => setForm({ ...form, category_type: e.target.value })}
                required
              />
              <div className="flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  className="px-4 py-2 rounded border hover:bg-gray-100 transition-all"
                  onClick={() => setHienModal(false)}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 transition-all"
                >
                  {dangSua ? "Cập nhật" : "Thêm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuanLyDanhMuc;