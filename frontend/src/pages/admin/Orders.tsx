import React, { useState, useEffect } from "react";
import axios from "axios";

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [details, setDetails] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedOrders, setSelectedOrders] = useState<number[]>([]); // ID các đơn hàng được chọn

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/orders");
      setOrders(res.data);
    } catch (err) {
      console.error("Lỗi tải đơn hàng:", err);
      alert("Không thể tải danh sách đơn hàng!");
    }
  };

  const viewDetails = async (orderID) => {
    try {
      const res = await axios.get(`http://localhost:3000/api/orders/${orderID}`);
      setDetails(res.data);
      setSelectedOrder(orderID);
    } catch (err) {
      console.error("Lỗi tải chi tiết:", err);
      alert("Không thể tải chi tiết đơn hàng!");
    }
  };

  const payOrder = async (orderID) => {
    try {
      const res = await axios.post(`http://localhost:3000/api/orders/${orderID}/pay`);
      alert(res.data.message);

      setOrders((prev) =>
        prev.map((o) =>
          o.order_ID === orderID ? { ...o, payment_status: "Đã thanh toán" } : o
        )
      );
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Lỗi thanh toán");
    }
  };

  const deliverOrder = async (orderID) => {
    try {
      const res = await axios.post(`http://localhost:3000/api/orders/${orderID}/deliver`);
      alert(res.data.message);

      setOrders((prev) =>
        prev.map((o) =>
          o.order_ID === orderID ? { ...o, delivery_status: "Đã giao" } : o
        )
      );
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Lỗi giao hàng");
    }
  };

  const handleCheck = (id, checked) => {
    if (checked) {
      setSelectedOrders(prev => [...prev, id]);
    } else {
      setSelectedOrders(prev => prev.filter(x => x !== id));
    }
  };

  const handleCheckAll = (checked) => {
    if (checked) {
      setSelectedOrders(filteredOrders.map(o => o.order_ID));
    } else {
      setSelectedOrders([]);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedOrders.length === 0) return alert("Chưa chọn đơn hàng nào!");
    if (!window.confirm(`Bạn có chắc muốn xóa ${selectedOrders.length} đơn hàng đã chọn?`)) return;

    try {
      await Promise.all(selectedOrders.map(id => axios.delete(`http://localhost:3000/api/orders/${id}`)));
      setSelectedOrders([]);
      fetchOrders();
    } catch (err) {
      console.error(err);
      alert("Xóa đơn hàng thất bại!");
    }
  };

  // Lọc theo tên khách hàng
  const filteredOrders = orders.filter(o => 
    o.customer_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Quản lý Đơn hàng</h2>

      <div className="flex flex-col sm:flex-row sm:justify-between mb-4 gap-2">
        <input
          type="text"
          placeholder="🔍 Tìm kiếm khách hàng..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-3 py-2 rounded w-full sm:w-1/3"
        />
        <button
          onClick={handleDeleteSelected}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Xóa đã chọn
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border rounded-lg">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 border-b">
                <input
                  type="checkbox"
                  checked={selectedOrders.length === filteredOrders.length && filteredOrders.length > 0}
                  onChange={(e) => handleCheckAll(e.target.checked)}
                />
              </th>
              <th className="px-4 py-2 border-b">Khách hàng</th>
              <th className="px-4 py-2 border-b">Ngày đặt</th>
              <th className="px-4 py-2 border-b">Thanh toán</th>
              <th className="px-4 py-2 border-b">Giao hàng</th>
              <th className="px-4 py-2 border-b">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((o) => (
              <tr key={o.order_ID} className="hover:bg-gray-50">
                <td className="px-4 py-2 border-b">
                  <input
                    type="checkbox"
                    checked={selectedOrders.includes(o.order_ID)}
                    onChange={(e) => handleCheck(o.order_ID, e.target.checked)}
                  />
                </td>
                <td className="px-4 py-2 border-b">{o.customer_name}</td>
                <td className="px-4 py-2 border-b">{new Date(o.order_date).toLocaleDateString()}</td>
                <td className="px-4 py-2 border-b">{o.payment_status}</td>
                <td className="px-4 py-2 border-b">{o.delivery_status}</td>
                <td className="px-4 py-2 border-b flex gap-2">
                  <button
                    className="bg-blue-500 text-white px-2 py-1 rounded"
                    onClick={() => viewDetails(o.order_ID)}
                  >
                    Xem
                  </button>
                  <button
                    className={`px-2 py-1 rounded ${
                      o.payment_status === "Đã thanh toán"
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-green-500 text-white"
                    }`}
                    onClick={() => payOrder(o.order_ID)}
                    disabled={o.payment_status === "Đã thanh toán"}
                  >
                    Thanh toán
                  </button>
                  <button
                    className={`px-2 py-1 rounded ${
                      o.delivery_status === "Đã giao"
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-purple-500 text-white"
                    }`}
                    onClick={() => deliverOrder(o.order_ID)}
                    disabled={o.delivery_status === "Đã giao"}
                  >
                    Giao hàng
                  </button>
                </td>
              </tr>
            ))}
            {filteredOrders.length === 0 && (
              <tr>
                <td colSpan={6} className="py-4 text-gray-500 text-center">
                  Không có dữ liệu
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedOrder && details.length > 0 && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-2">Chi tiết đơn hàng #{selectedOrder}</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border rounded-lg text-left">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 border-b">Sản phẩm</th>
                  <th className="px-4 py-2 border-b">Số lượng</th>
                  <th className="px-4 py-2 border-b">Giá</th>
                  <th className="px-4 py-2 border-b">Tổng</th>
                </tr>
              </thead>
              <tbody>
                {details.map((d, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-2 border-b">{d.product_name}</td>
                    <td className="px-4 py-2 border-b">{d.quantity}</td>
                    <td className="px-4 py-2 border-b">{d.price.toLocaleString()} đ</td>
                    <td className="px-4 py-2 border-b">{d.total.toLocaleString()} đ</td>
                  </tr>
                ))}
                <tr className="font-bold bg-gray-100">
                  <td colSpan="3" className="px-4 py-2 border-b text-right">Tổng cộng</td>
                  <td className="px-4 py-2 border-b">
                    {details.reduce((sum, item) => sum + item.total, 0).toLocaleString()} đ
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminOrders;