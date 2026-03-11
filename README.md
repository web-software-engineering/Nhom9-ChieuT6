# Workspace Structure

Repository nay duoc tach thanh 2 thu muc chinh:

- `frontend/`: ung dung React + Vite + TypeScript + TailwindCSS hien co.
- `backend/`: thu muc placeholder cho backend se duoc phat trien sau.

## Chay frontend

```powershell
Set-Location frontend
npm install
npm run dev
```

## Build frontend

```powershell
Set-Location frontend
npm run build
```

## Backend

Backend chua duoc implement trong repository nay. Thu muc `backend/` duoc tao san de bo sung API sau.# Văn Phòng Phẩm Xanh - Website bán văn phòng phẩm có giao hàng

Website bán văn phòng phẩm trực tuyến với tích hợp quy trình giao hàng của Giao Hàng Nhanh (GHN).

## Công nghệ

- React 18
- Vite
- TypeScript
- TailwindCSS
- Lucide React (Icons)

## Tính năng

### 1. Trang chủ - Danh sách sản phẩm

- Hiển thị 12 sản phẩm văn phòng phẩm đa dạng
- Tìm kiếm sản phẩm theo tên
- Lọc theo danh mục: Bút viết, Vở và sổ, Dụng cụ học tập, Giấy in...
- Thêm vào giỏ hàng với 1 click
- Hiển thị giá, tồn kho, mô tả sản phẩm

### 2. Giỏ hàng

- Xem danh sách sản phẩm đã chọn
- Tăng/giảm số lượng
- Xóa sản phẩm khỏi giỏ
- Tính tổng tiền tạm tính
- Badge hiển thị số lượng sản phẩm trên header

### 3. Thanh toán & Giao hàng

- Form nhập thông tin người nhận
- Chọn địa chỉ giao hàng (Quận/Phường)
- Tự động tính phí vận chuyển dựa trên:
  - Trọng lượng tổng đơn hàng
  - Khoảng cách vận chuyển
- Hiển thị tổng đơn hàng (tiền hàng + phí ship)
- Đặt hàng và nhận mã đơn hàng (GHN + số)

### 4. Theo dõi đơn hàng

- Tra cứu đơn hàng bằng mã vận đơn
- Hiển thị timeline trạng thái vận chuyển:
  - Đơn hàng đã được tạo
  - Đã lấy hàng
  - Đang vận chuyển
  - Đang giao
  - Đã giao thành công

## Giao diện

- Responsive design (mobile, tablet, desktop)
- Card UI hiện đại với hover effects
- Animation loading khi submit form
- Gradient backgrounds
- Icons trực quan từ Lucide React
- Badge thông báo số lượng giỏ hàng
- Sticky header với navigation

## Cấu trúc project

```
src/
├── components/
│   ├── ProductCard.tsx          # Card hiển thị sản phẩm
│   ├── ProductList.tsx          # Danh sách sản phẩm với filter
│   ├── Cart.tsx                 # Giỏ hàng
│   ├── Navigation.tsx           # Navigation context & routing
│   ├── ShippingFeeForm.tsx      # Form tính phí (GHN)
│   ├── CreateOrderForm.tsx      # Form tạo đơn (GHN)
│   └── TrackingForm.tsx         # Form theo dõi (GHN)
├── pages/
│   ├── CheckoutPage.tsx         # Trang thanh toán
│   └── ShippingPage.tsx         # Trang GHN demo (legacy)
├── contexts/
│   └── CartContext.tsx          # Context quản lý giỏ hàng
├── data/
│   ├── stationeryData.ts        # Mock data sản phẩm văn phòng phẩm
│   └── mockData.ts              # Mock data GHN (districts, wards...)
├── services/
│   └── shippingService.ts     # Gọi backend shipping API + mock fallback
├── types/
│   └── shipping.ts            # Shared types cho request/response shipping
├── App.tsx                      # Root component với layout
├── main.tsx                     # Entry point
└── index.css                    # Global styles + Tailwind

```

## Cài đặt và chạy

### Cài đặt dependencies

```bash
npm install
```

### Chạy development server

```bash
npm run dev
```

Mở trình duyệt và truy cập: `http://localhost:5173`

### Build production

```bash
npm run build
```

### Cấu hình shipping API

Frontend được chuẩn bị để chỉ gọi backend endpoint, không gọi GHN trực tiếp từ UI.

Các endpoint dự kiến:

- `GET /api/shipping/fee`
- `POST /api/shipping/order`
- `GET /api/shipping/tracking`

Khi backend chưa sẵn sàng, app dùng mock response thông qua `src/services/shippingService.ts`.

Bạn có thể cấu hình nhanh bằng `.env.example`:

```bash
VITE_USE_MOCK_SHIPPING_API=true
VITE_SHIPPING_API_BASE=/api/shipping
```

Khi backend hoàn tất, chỉ cần chuyển `VITE_USE_MOCK_SHIPPING_API=false`.

### Preview production build

```bash
npm run preview
```

## Mock Data

### Sản phẩm

- **12 sản phẩm** văn phòng phẩm đa dạng:
  - Bút viết (bi, chì, màu, dạ quang)
  - Vở và sổ các loại
  - Dụng cụ học tập (thước, compa)
  - Dụng cụ văn phòng (kéo, keo dán)
  - Túi và hộp
  - Giấy in A4

### Dữ liệu GHN

- **16 quận/huyện** tại TP.HCM
- **Phường/xã** tương ứng
- **Tính phí ship** dựa trên trọng lượng & khoảng cách
- **Tracking** với 5 trạng thái vận chuyển

## Luồng sử dụng

### Mua hàng cơ bản:

1. **Trang chủ**: Duyệt sản phẩm, tìm kiếm, lọc theo danh mục
2. **Thêm vào giỏ**: Click "Thêm vào giỏ" trên sản phẩm
3. **Xem giỏ hàng**: Click icon giỏ hàng ở header
4. **Điều chỉnh**: Tăng/giảm số lượng hoặc xóa sản phẩm
5. **Thanh toán**: Click "Tiến hành thanh toán"
6. **Nhập thông tin**: Điền thông tin người nhận & địa chỉ
7. **Tính phí ship**: Hệ thống tự động tính phí vận chuyển
8. **Đặt hàng**: Xác nhận và nhận mã đơn hàng
9. **Theo dõi**: Dùng mã đơn hàng để tra cứu trạng thái

## 🌟 Điểm nổi bật

### UX/UI

- **Shopping cart** với Context API
- **Real-time updates** số lượng giỏ hàng
- **Multi-step checkout** flow
- **Success screens** với animation
- **Loading states** với spinner
- **Responsive navigation** với sticky header
- **Product search** và category filter

### Code Quality

- **TypeScript** cho type safety
- **React Context** cho state management
- **Component-based** architecture
- **Separation of concerns** (data, components, pages, contexts)
- **Reusable components**

## Lưu ý

- Đây là demo frontend, không có backend thật
- Tất cả dữ liệu đều là mock data
- API calls được simulate bằng `setTimeout`
- Dữ liệu giỏ hàng lưu trong memory (mất khi refresh)
- Mã vận đơn được generate ngẫu nhiên
- Product images sử dụng emoji

## Tích hợp GHN

Website tích hợp đầy đủ workflow của Giao Hàng Nhanh:

1. **Frontend gọi backend shipping service** - Không gọi GHN API trực tiếp trong React components
2. **Tính phí vận chuyển** - Thông qua endpoint backend hoặc mock fallback
3. **Tạo đơn vận chuyển** - Gửi request tới backend hoặc mock fallback
4. **Theo dõi đơn hàng** - Tra cứu qua service layer với loading/error states rõ ràng
