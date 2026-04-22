// src/pages/admin/QuanLyDanhMuc.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";

// Interface danh mục
interface DanhMuc {
  category_ID: number;
  category_name: string;
  category_type: string;
}

// API base (FIX CHUẨN DEPLOY)
const API_URL =
  import.meta.env.VITE_API_URL || "https://nhom9-chieut6-backend.onrender.com";

// Axios instance (FIX QUAN TRỌNG)
const axiosInstance = axios.create({
  baseURL: `${API_URL}/api`,
});

// Modal component
interface CategoryModalProps {
  show: boolean;
  dangSua?: DanhMuc | null;
  form: { category_name: string; category_type: string };
  onChange: (form: any) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

const CategoryModal: React.FC<CategoryModalProps> = ({
  show,
  dangSua,
  form,
  onChange,
  onClose,
  onSubmit,
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded shadow-lg w-11/12 sm:w-1/3 p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-700">
          {dangSua ? "Sửa danh mục" : "Thêm danh mục"}
        </h2>

        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Tên danh mục"
            className="border px-3 py-2 rounded"
            value={form.category_name}
            onChange={(e) =>
              onChange({ ...form, category_name: e.target.value })
            }
            required
          />

          <input
            type="text"
            placeholder="Loại danh mục"
            className="border px-3 py-2 rounded"
            value={form.category_type}
            onChange={(e) =>
              onChange({ ...form, category_type: e.target.value })
            }
            required
          />

          <div className="flex justify-end gap-2 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded"
            >
              Hủy
            </button>

            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              {dangSua ? "Cập nhật" : "Thêm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const QuanLyDanhMuc: React.FC = () => {
  const [danhMuc, setDanhMuc] = useState<DanhMuc[]>([]);
  const [timKiem, setTimKiem] = useState("");
  const [hienModal, setHienModal] = useState(false);
  const [dangSua, setDangSua] = useState<DanhMuc | null>(null);
  const [form, setForm] = useState({
    category_name: "",
    category_type: "",
  });
  const [chonNhieu, setChonNhieu] = useState<number[]>([]);

  // GET danh mục
  const layDanhMuc = async () => {
    try {
      const res = await axiosInstance.get("/categories");
      setDanhMuc(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Lỗi khi lấy danh mục:", err);
      setDanhMuc([]);
    }
  };

  useEffect(() => {
    layDanhMuc();
  }, []);

  // Xóa 1
  const xoaDanhMuc = async (id: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa?")) return;
    try {
      await axiosInstance.delete(`/categories/${id}`);
      layDanhMuc();
    } catch (err) {
      console.error("Lỗi khi xóa:", err);
    }
  };

  // Xóa nhiều
  const xoaNhieuDanhMuc = async () => {
    if (!chonNhieu.length) return alert("Chưa chọn danh mục!");
    if (!window.confirm(`Xóa ${chonNhieu.length} danh mục?`)) return;

    try {
      await Promise.all(
        chonNhieu.map((id) =>
          axiosInstance.delete(`/categories/${id}`)
        )
      );
      setChonNhieu([]);
      layDanhMuc();
    } catch (err) {
      console.error("Lỗi khi xóa nhiều:", err);
    }
  };

  // mở modal
  const moModal = (dm?: DanhMuc) => {
    if (dm) {
      setDangSua(dm);
      setForm({
        category_name: dm.category_name,
        category_type: dm.category_type,
      });
    } else {
      setDangSua(null);
      setForm({ category_name: "", category_type: "" });
    }
    setHienModal(true);
  };

  // submit form
  const guiForm = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (dangSua) {
        await axiosInstance.put(
          `/categories/${dangSua.category_ID}`,
          form
        );
      } else {
        await axiosInstance.post("/categories", form);
      }

      setHienModal(false);
      layDanhMuc();
    } catch (err) {
      console.error("Lỗi submit:", err);
    }
  };

  // filter an toàn
  const danhMucLoc = (Array.isArray(danhMuc) ? danhMuc : []).filter(
    (dm) =>
      (dm.category_name || "")
        .toLowerCase()
        .includes(timKiem.toLowerCase()) ||
      (dm.category_type || "")
        .toLowerCase()
        .includes(timKiem.toLowerCase())
  );

  const allChecked =
    danhMucLoc.length > 0 &&
    chonNhieu.length === danhMucLoc.length;

  const handleCheck = (id: number, checked: boolean) => {
    if (checked) setChonNhieu((prev) => [...prev, id]);
    else setChonNhieu((prev) => prev.filter((x) => x !== id));
  };

  const handleCheckAll = (checked: boolean) => {
    if (checked)
      setChonNhieu(danhMucLoc.map((dm) => dm.category_ID));
    else setChonNhieu([]);
  };

 return (
  <div className="p-6 max-w-6xl mx-auto">
    <h1 className="text-3xl font-bold mb-6 text-gray-800">
      Quản Lý Danh Mục
    </h1>

    {/* Search + Actions */}
    <div className="flex flex-col sm:flex-row sm:justify-between gap-3 mb-4">
      <input
        type="text"
        placeholder="🔍 Tìm kiếm danh mục..."
        className="border px-4 py-2 rounded w-full sm:w-1/3 focus:ring-2 focus:ring-blue-400 outline-none"
        value={timKiem}
        onChange={(e) => setTimKiem(e.target.value)}
      />

      <div className="flex gap-2">
        <button
          onClick={() => moModal()}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition"
        >
          + Thêm danh mục
        </button>

        <button
          onClick={xoaNhieuDanhMuc}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition"
        >
          Xóa đã chọn
        </button>
      </div>
    </div>

    {/* Table */}
    <div className="overflow-x-auto border rounded shadow bg-white">
      <table className="min-w-full text-center">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            <th className="p-3">
              <input
                type="checkbox"
                checked={allChecked}
                onChange={(e) => handleCheckAll(e.target.checked)}
              />
            </th>
            <th className="p-3">ID</th>
            <th className="p-3">Tên danh mục</th>
            <th className="p-3">Loại danh mục</th>
            <th className="p-3">Hành động</th>
          </tr>
        </thead>

        <tbody>
          {danhMucLoc.length === 0 ? (
            <tr>
              <td colSpan={5} className="py-6 text-gray-500">
                Không tìm thấy danh mục nào
              </td>
            </tr>
          ) : (
            danhMucLoc.map((dm) => (
              <tr
                key={dm.category_ID}
                className="border-t hover:bg-gray-50 transition"
              >
                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={chonNhieu.includes(dm.category_ID)}
                    onChange={(e) =>
                      handleCheck(dm.category_ID, e.target.checked)
                    }
                  />
                </td>

                <td className="p-3">{dm.category_ID}</td>
                <td className="p-3 font-medium text-gray-800">
                  {dm.category_name}
                </td>
                <td className="p-3">{dm.category_type}</td>

                <td className="p-3 flex justify-center gap-2">
                  <button
                    onClick={() => moModal(dm)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded transition"
                  >
                    Sửa
                  </button>

                  <button
                    onClick={() => xoaDanhMuc(dm.category_ID)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition"
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>

    {/* Modal */}
    <CategoryModal
      show={hienModal}
      dangSua={dangSua}
      form={form}
      onChange={setForm}
      onClose={() => setHienModal(false)}
      onSubmit={guiForm}
    />
  </div>
);
};

export default QuanLyDanhMuc;