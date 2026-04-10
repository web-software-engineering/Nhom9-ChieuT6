# Office Smart - Nhóm 9

Website bán văn phòng phẩm kết hợp quản lý đơn hàng, thanh toán và vận chuyển. Dự án gồm một frontend React/Vite và một backend Express riêng, hỗ trợ giỏ hàng, đặt hàng, tra cứu vận đơn, thanh toán và trang quản trị.

## Mô tả

Office Smart là một hệ thống bán hàng trực tuyến cho sản phẩm văn phòng phẩm. Người dùng có thể xem sản phẩm, thêm vào giỏ, thanh toán, tạo đơn vận chuyển và theo dõi trạng thái đơn hàng. Quản trị viên có thể quản lý sản phẩm, danh mục, đơn hàng và xem thống kê.

## Chức năng chính

- Trang chủ hiển thị danh sách sản phẩm, tìm kiếm và lọc theo danh mục.
- Giỏ hàng cho phép tăng giảm số lượng, xóa sản phẩm và tính tổng tiền.
- Thanh toán tích hợp thông tin người nhận, phí vận chuyển và tạo đơn hàng.
- Tra cứu đơn hàng theo mã vận đơn.
- Đăng ký, đăng nhập, quản lý hồ sơ người dùng.
- Đăng nhập bằng Google và Facebook.
- Cổng thanh toán MoMo và VNPay.
- Trang admin để quản lý sản phẩm, danh mục, đơn hàng và thống kê doanh thu.

## Quản lý sản phẩm thông minh

### Chức năng

- CRUD sản phẩm: tạo mới, xem danh sách, cập nhật, xóa sản phẩm.
- Upload nhiều ảnh cho một sản phẩm.
- Hiển thị chi tiết sản phẩm: thông tin, giá, ảnh, mô tả.

### Nâng cao

- Tìm kiếm nâng cao theo tên, khoảng giá và loại sản phẩm.
- Lọc và sắp xếp theo giá, mức độ bán chạy.
- Gợi ý sản phẩm liên quan theo danh mục hoặc hành vi mua sắm.

## Công nghệ

### Frontend

- React 18
- TypeScript
- Vite
- React Router
- TailwindCSS
- Axios
- Lucide React
- Chart.js

### Backend

- Node.js
- Express
- MySQL
- JWT
- CORS
- Multer
- dotenv

### Tích hợp dịch vụ

- GHN cho tính phí, tạo đơn và tracking vận chuyển.
- MoMo cho thanh toán QR / payment link.
- VNPay cho thanh toán trực tuyến.
- Google / Facebook OAuth cho đăng nhập xã hội.

## Kiến trúc

- `frontend/`: ứng dụng React/Vite cho người dùng và admin.
- `backend/`: API Express, xác thực, thanh toán, giao hàng, kết nối MySQL.
- `backend/database/`: file schema SQL cho CSDL.
- `frontend/src/api`: lớp gọi API từ UI.

## Chạy local

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Mặc định frontend chạy ở `http://localhost:5173`.

### Backend

```bash
cd backend
npm install
npm start
```

Mặc định backend chạy ở `http://localhost:3000`.

## Deploy / Host

Dự án đã chuẩn bị sẵn để deploy theo mô hình tách riêng frontend và backend:

- Frontend host trên Vercel.
- Backend host trên Render.
- Database host trên Railway MySQL.

### 1. Deploy backend lên Render

1. Tạo web service từ thư mục `backend/`.
2. Chọn Node.js, cài dependencies bằng `npm install`.
3. Set biến môi trường theo file `backend/.env.example`.
4. Đặt `PORT` theo biến môi trường của host nếu cần.
5. Đảm bảo `BACKEND_URL` và `FRONTEND_URL` trỏ đúng domain production.

### 2. Deploy frontend lên Vercel

1. Import thư mục `frontend/` vào Vercel.
2. Build command: `npm run build`.
3. Output directory: `dist`.
4. Cấu hình biến môi trường frontend theo file `frontend/.env.example`.
5. Cập nhật `VITE_API_BASE_URL`, `VITE_API_BASE`, `VITE_SHIPPING_API_BASE` về URL backend production.

### 3. Cấu hình database

1. Tạo MySQL database trên Railway.
2. Lấy connection string hoặc các thông số host/user/password.
3. Cập nhật `MYSQL_URL` hoặc nhóm biến `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE`.
4. Chạy file schema trong `backend/database/schema.sql` nếu cần khởi tạo dữ liệu.

### 4. Kiểm tra sau deploy

- Mở frontend trên domain production.
- Kiểm tra đăng nhập, thêm giỏ hàng và tạo đơn.
- Kiểm tra API shipping, payment và auth callback hoạt động đúng domain.

## Ghi chú biến môi trường

- Backend: xem `backend/.env.example`.
- Frontend: xem `frontend/.env.example`.

## Liên quan API shipping

- `GET /api/shipping/fee`
- `POST /api/shipping/order`
- `GET /api/shipping/tracking`

Các endpoint này được backend cung cấp để frontend gọi khi tính phí, tạo đơn và tra cứu vận chuyển.
