// frontend/src/pages/admin/Dashboard.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";

interface TopProduct {
  product_name: string;
  sold: number;
}

interface Review {
  user_name: string;
  product_name: string;
  rating: number;
  comment: string;
  review_date: string;
}

interface User {
  user_ID: number;
  username: string;
  name: string;
  role: string;
}

const Dashboard: React.FC = () => {
  const [revenue, setRevenue] = useState<number>(0);
  const [orders, setOrders] = useState<number>(0);
  const [customersCount, setCustomersCount] = useState<number>(0); // chỉ đếm customer
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const start = "2026-01-01";
        const end = "2026-12-31";

        const [revRes, ordRes, userRes, topRes, reviewRes] = await Promise.all([
          axios
            .get("http://localhost:3000/api/stats/revenue", { params: { filter: "day", start, end } })
            .catch(() => ({ data: [] })),
          axios
            .get("http://localhost:3000/api/stats/orders", { params: { filter: "day", start, end } })
            .catch(() => ({ data: [] })),
          axios.get("http://localhost:3000/api/users").catch(() => ({ data: [] })),
          axios.get("http://localhost:3000/api/stats/top-products").catch(() => ({ data: [] })),
          axios.get("http://localhost:3000/api/reviews/all").catch(() => ({ data: [] })),
        ]);

        const totalRevenue = Array.isArray(revRes.data)
          ? revRes.data.reduce((sum: number, r: any) => sum + r.total, 0)
          : 0;
        const totalOrders = Array.isArray(ordRes.data)
          ? ordRes.data.reduce((sum: number, o: any) => sum + o.total_orders, 0)
          : 0;

        setRevenue(totalRevenue);
        setOrders(totalOrders);

        // Đếm số khách hàng
        const customers = Array.isArray(userRes.data)
          ? userRes.data.filter((u: User) => u.role === "customer").length
          : 0;
        setCustomersCount(customers);

        setTopProducts(topRes.data);
        setReviews(reviewRes.data);
      } catch (err) {
        console.error("Lỗi fetch dữ liệu:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-6 p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard Admin</h1>

      {/* Tổng quan */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-green-100 p-4 rounded shadow text-center">
          <h3 className="text-sm font-semibold text-gray-700">Tổng doanh thu</h3>
          <p className="text-2xl font-bold text-green-700">{revenue.toLocaleString()} đ</p>
        </div>
        <div className="bg-blue-100 p-4 rounded shadow text-center">
          <h3 className="text-sm font-semibold text-gray-700">Tổng đơn hàng</h3>
          <p className="text-2xl font-bold text-blue-700">{orders}</p>
        </div>
        <div className="bg-yellow-100 p-4 rounded shadow text-center">
          <h3 className="text-sm font-semibold text-gray-700">Khách hàng</h3>
          <p className="text-2xl font-bold text-yellow-700">{customersCount}</p>
        </div>
        <div className="bg-pink-100 p-4 rounded shadow text-center">
          <h3 className="text-sm font-semibold text-gray-700">Top sản phẩm</h3>
          <ul className="text-xs mt-2">
            {topProducts.map((p, idx) => (
              <li key={idx}>{p.product_name} ({p.sold})</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Review chi tiết */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-2">Danh sách đánh giá</h2>
        {loading ? (
          <p>Đang tải dữ liệu...</p>
        ) : reviews.length === 0 ? (
          <p>Chưa có đánh giá nào.</p>
        ) : (
          <div className="overflow-x-auto max-h-[500px]">
            <table className="min-w-full border-collapse text-left">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  <th className="border px-3 py-2">Người đánh giá</th>
                  <th className="border px-3 py-2">Sản phẩm</th>
                  <th className="border px-3 py-2 text-center">Số sao</th>
                  <th className="border px-3 py-2">Nội dung</th>
                  <th className="border px-3 py-2 text-center">Ngày đánh giá</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((r, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="border px-3 py-2 font-medium">{r.user_name}</td>
                    <td className="border px-3 py-2">{r.product_name}</td>
                    <td className="border px-3 py-2 text-center">{r.rating} ⭐</td>
                    <td className="border px-3 py-2">{r.comment}</td>
                    <td className="border px-3 py-2 text-center">
                      {new Date(r.review_date).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;