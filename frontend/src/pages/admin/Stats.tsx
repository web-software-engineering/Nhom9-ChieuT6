import React, { useEffect, useState } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface Revenue { order_date: string; total: number; }
interface Orders { order_date: string; total_orders: number; }
interface TopProduct { product_name: string; sold: number; }

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

const Stats: React.FC = () => {
  const [revenue, setRevenue] = useState<Revenue[]>([]);
  const [orders, setOrders] = useState<Orders[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [filterType, setFilterType] = useState<"day" | "month" | "year">("day");
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [loadingRevenue, setLoadingRevenue] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingTop, setLoadingTop] = useState(false);

  const formatDate = (date: Date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const getRange = (): [string, string] => {
    const now = startDate || new Date();
    if (filterType === "day")
      return [formatDate(startDate || new Date()), formatDate(endDate || new Date())];
    if (filterType === "month") {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return [formatDate(start), formatDate(end)];
    }
    const start = new Date(now.getFullYear(), 0, 1);
    const end = new Date(now.getFullYear(), 11, 31);
    return [formatDate(start), formatDate(end)];
  };

  const fetchData = async () => {
    const [start, end] = getRange();
    setLoadingRevenue(true); setLoadingOrders(true); setLoadingTop(true);

    try {
      const [revRes, ordRes, topRes] = await Promise.all([
        axios.get(`${API_BASE}/api/stats/revenue`, { params: { filter: filterType, start, end } }),
        axios.get(`${API_BASE}/api/stats/orders`, { params: { filter: filterType, start, end } }),
        axios.get(`${API_BASE}/api/stats/top-products`),
      ]);

      setRevenue(revRes.data || []);
      setOrders(ordRes.data || []);
      setTopProducts(topRes.data || []);
    } catch (err) {
      console.error(err);
      setRevenue([]); setOrders([]); setTopProducts([]);
    } finally {
      setLoadingRevenue(false); setLoadingOrders(false); setLoadingTop(false);
    }
  };

  useEffect(() => { fetchData(); }, [filterType, startDate, endDate]);

  const totalRevenue = revenue.reduce((sum, r) => sum + r.total, 0);
  const totalOrders = orders.reduce((sum, o) => sum + o.total_orders, 0);
  const doughnutColors = topProducts.map((_, i) => `hsl(${i * 45 % 360}, 70%, 60%)`);

  const renderChartLoading = () => (
    <div className="flex justify-center items-center py-16 text-gray-500">Đang tải dữ liệu...</div>
  );

  return (
    <div className="space-y-6 p-4">
      {/* Filter */}
      <div className="flex flex-col md:flex-row gap-2 md:items-center mb-4">
        <span className="font-medium text-gray-700">Xem theo:</span>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as any)}
          className="border rounded p-1"
        >
          <option value="day">Ngày</option>
          <option value="month">Tháng</option>
          <option value="year">Năm</option>
        </select>

        {filterType === "day" && (
          <div className="flex gap-2 items-center">
            <DatePicker
              selected={startDate}
              onChange={(date: Date | null) => setStartDate(date)}
              className="border rounded p-1"
              dateFormat="yyyy-MM-dd"
            />
            <span>→</span>
            <DatePicker
              selected={endDate}
              onChange={(date: Date | null) => setEndDate(date)}
              className="border rounded p-1"
              dateFormat="yyyy-MM-dd"
            />
          </div>
        )}

        {filterType === "month" && (
          <DatePicker
            selected={startDate}
            onChange={(date: Date | null) => setStartDate(date)}
            className="border rounded p-1"
            dateFormat="MM/yyyy"
            showMonthYearPicker
          />
        )}

        {filterType === "year" && (
          <input
            type="number"
            value={startDate?.getFullYear() ?? new Date().getFullYear()}
            onChange={(e) => setStartDate(new Date(Number(e.target.value), 0, 1))}
            className="border rounded p-1 w-24"
          />
        )}
      </div>

      {/* Tổng quan */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-100 p-4 rounded shadow text-center">
          <h3 className="text-sm font-semibold text-gray-700">Tổng doanh thu</h3>
          <p className="text-2xl font-bold text-green-700">{revenue.length ? totalRevenue.toLocaleString() + " đ" : "0 đ"}</p>
        </div>
        <div className="bg-blue-100 p-4 rounded shadow text-center">
          <h3 className="text-sm font-semibold text-gray-700">Tổng đơn hàng</h3>
          <p className="text-2xl font-bold text-blue-700">{orders.length ? totalOrders : 0}</p>
        </div>
        <div className="bg-yellow-100 p-4 rounded shadow text-center">
          <h3 className="text-sm font-semibold text-gray-700">Top sản phẩm</h3>
          {topProducts.length ? (
            <ul className="text-xs mt-2">{topProducts.map((p, idx) => <li key={idx}>{p.product_name} ({p.sold})</li>)}</ul>
          ) : (
            <p className="text-xs mt-2 text-gray-500">Không có dữ liệu</p>
          )}
        </div>
      </div>

      {/* Biểu đồ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded shadow lg:col-span-2">
          <h2 className="text-lg font-semibold mb-2">Doanh thu theo {filterType}</h2>
          {loadingRevenue ? renderChartLoading() :
            revenue.length ? (
              <div className="h-64">
                <Line
                  options={{ responsive: true, maintainAspectRatio: false }}
                  data={{
                    labels: revenue.map(r => r.order_date),
                    datasets: [{ label: `Doanh thu (đ)`, data: revenue.map(r => r.total), borderColor: "green", backgroundColor: "rgba(0,255,0,0.2)", fill: true, tension: 0.3 }],
                  }}
                />
              </div>
            ) : renderChartLoading()
          }
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-2">Top sản phẩm bán chạy</h2>
          {loadingTop ? renderChartLoading() :
            topProducts.length ? (
              <div className="h-64 flex justify-center items-center">
                <Doughnut
                  options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "bottom" } } }}
                  data={{
                    labels: topProducts.map(p => p.product_name),
                    datasets: [{ label: "Số lượng bán", data: topProducts.map(p => p.sold), backgroundColor: doughnutColors, borderWidth: 1 }],
                  }}
                />
              </div>
            ) : renderChartLoading()
          }
        </div>
      </div>

      {/* Số đơn hàng */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-2">Số đơn hàng theo {filterType}</h2>
        {loadingOrders ? renderChartLoading() :
          orders.length ? (
            <div className="h-64">
              <Bar
                options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }}
                data={{ labels: orders.map(o => o.order_date), datasets: [{ label: "Số đơn", data: orders.map(o => o.total_orders), backgroundColor: "#3b82f6", borderRadius: 4 }] }}
              />
            </div>
          ) : renderChartLoading()
        }
      </div>
    </div>
  );
};

export default Stats;