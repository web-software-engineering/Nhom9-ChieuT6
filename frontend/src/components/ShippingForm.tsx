import React, { useState, useEffect } from "react";
// Đảm bảo file districts.ts nằm trong thư mục src/data/ để import dễ dàng hơn
import { districts } from "../data/districts"; 

const ShippingForm = () => {
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedWard, setSelectedWard] = useState(""); // State để lưu phường đã chọn
  const [wards, setWards] = useState<string[]>([]);

  // Mỗi khi quận thay đổi, cập nhật lại danh sách phường và reset phường cũ
  const handleDistrictChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const district = event.target.value;
    setSelectedDistrict(district);
    setSelectedWard(""); // Reset phường khi đổi quận
    setWards(districts[district] || []);
  };

  return (
    <div className="space-y-4 p-4 border rounded-xl bg-white/50 shadow-sm">
      <h2 className="text-lg font-bold text-slate-900">Thông tin giao hàng</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Chọn Quận/Huyện */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Quận/Huyện:</label>
          <select 
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={selectedDistrict} 
            onChange={handleDistrictChange}
          >
            <option value="">-- Chọn quận/huyện --</option>
            {Object.keys(districts).map((district) => (
              <option key={district} value={district}>
                {district}
              </option>
            ))}
          </select>
        </div>

        {/* Chọn Phường/Xã */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Phường/Xã:</label>
          <select 
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            disabled={!wards.length}
            value={selectedWard}
            onChange={(e) => setSelectedWard(e.target.value)}
          >
            <option value="">-- Chọn phường/xã --</option>
            {wards.map((ward) => (
              <option key={ward} value={ward}>
                {ward}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedWard && (
        <p className="text-sm text-green-600 font-medium">
          📍 Bạn đã chọn: {selectedWard}, {selectedDistrict}, TP. Hồ Chí Minh
        </p>
      )}
    </div>
  );
};

export default ShippingForm;