-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1:3306
-- Thời gian đã tạo: Th4 21, 2026 lúc 02:27 PM
-- Phiên bản máy phục vụ: 8.0.42
-- Phiên bản PHP: 8.3.14

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `railway`
--

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `carts`
--

DROP TABLE IF EXISTS `carts`;
CREATE TABLE IF NOT EXISTS `carts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_ID` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `user_ID` (`user_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Đang đổ dữ liệu cho bảng `carts`
--

INSERT INTO `carts` (`id`, `user_ID`) VALUES
(1, 3),
(2, 4);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `cart_items`
--

DROP TABLE IF EXISTS `cart_items`;
CREATE TABLE IF NOT EXISTS `cart_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `cart_id` int NOT NULL,
  `product_ID` int NOT NULL,
  `quantity` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `cart_id` (`cart_id`),
  KEY `product_ID` (`product_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Đang đổ dữ liệu cho bảng `cart_items`
--

INSERT INTO `cart_items` (`id`, `cart_id`, `product_ID`, `quantity`) VALUES
(1, 1, 1, 2),
(2, 1, 5, 1),
(3, 2, 10, 1);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `categories`
--

DROP TABLE IF EXISTS `categories`;
CREATE TABLE IF NOT EXISTS `categories` (
  `category_ID` int NOT NULL AUTO_INCREMENT,
  `category_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `category_type` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`category_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `categories`
--

INSERT INTO `categories` (`category_ID`, `category_name`, `category_type`) VALUES
(1, 'Bút bi', 'Đồ dùng học tập'),
(2, 'Sách giáo khoa', 'Sách'),
(3, 'Vở kẻ ngang', 'Đồ dùng học tập'),
(4, 'Thiết bị học tập', 'Thiết bị'),
(5, 'Phụ kiện', 'Phụ kiện học tập'),
(6, 'Mỹ thuật', 'Đồ dùng mỹ thuật'),
(7, 'Mỹ thuật 2', 'Đồ dùng mỹ thuật');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `deliveries`
--

DROP TABLE IF EXISTS `deliveries`;
CREATE TABLE IF NOT EXISTS `deliveries` (
  `deliveries_ID` int NOT NULL AUTO_INCREMENT,
  `order_ID` int DEFAULT NULL,
  `delivery_date` date DEFAULT NULL,
  PRIMARY KEY (`deliveries_ID`),
  KEY `order_ID` (`order_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `deliveries`
--

INSERT INTO `deliveries` (`deliveries_ID`, `order_ID`, `delivery_date`) VALUES
(1, 1, '2026-04-01'),
(2, 2, '2026-04-02');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `payment`
--

DROP TABLE IF EXISTS `payment`;
CREATE TABLE IF NOT EXISTS `payment` (
  `payment_ID` int NOT NULL AUTO_INCREMENT,
  `order_ID` int DEFAULT NULL,
  `payment_date` date DEFAULT NULL,
  PRIMARY KEY (`payment_ID`),
  KEY `order_ID` (`order_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `payment`
--

INSERT INTO `payment` (`payment_ID`, `order_ID`, `payment_date`) VALUES
(1, 1, '2026-03-30'),
(2, 2, '2026-03-31');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `products`
--

DROP TABLE IF EXISTS `products`;
CREATE TABLE IF NOT EXISTS `products` (
  `product_ID` int NOT NULL AUTO_INCREMENT,
  `category_ID` int DEFAULT NULL,
  `seller_ID` int DEFAULT NULL,
  `product_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `product_image` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `description` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `price` double NOT NULL,
  `number` int NOT NULL,
  PRIMARY KEY (`product_ID`),
  KEY `category_ID` (`category_ID`),
  KEY `seller_ID` (`seller_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=43 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `products`
--

INSERT INTO `products` (`product_ID`, `category_ID`, `seller_ID`, `product_name`, `product_image`, `description`, `price`, `number`) VALUES
(1, 5, 2, 'Balo học sinh chống nước', 'uploads/products/balo.jpg', 'Sản phẩm Balo học sinh chống nước phù hợp cho học tập và làm việc hằng ngày.', 220000, 40),
(2, 1, 2, 'Bút bi Thiên Long TL-027 chính hãng', 'uploads/products/but-bi-thien-long-tl027.jpg', 'Sản phẩm Bút bi Thiên Long TL-027 chính hãng phù hợp cho học tập và làm việc hằng ngày.', 5000, 150),
(3, 1, 2, 'Bút chì gỗ 2B học sinh', 'uploads/products/but-chi-2b.png', 'Sản phẩm Bút chì gỗ 2B học sinh phù hợp cho học tập và làm việc hằng ngày.', 3000, 200),
(4, 1, 2, 'Bộ bút dạ quang 6 màu', 'uploads/products/but-da-quang-6-mau.jpg', 'Sản phẩm Bộ bút dạ quang 6 màu phù hợp cho học tập và làm việc hằng ngày.', 25000, 80),
(5, 6, 2, 'Bộ bút màu 24 cây', 'uploads/products/but-mau-24-cay.webp', 'Sản phẩm Bộ bút màu 24 cây phù hợp cho học tập và làm việc hằng ngày.', 55000, 65),
(6, 1, 2, 'Bút bi Thiên Long mực xanh', 'uploads/products/butbi_thienlong.jpg', 'Sản phẩm Bút bi Thiên Long mực xanh phù hợp cho học tập và làm việc hằng ngày.', 5000, 150),
(7, 1, 2, 'Bút chì gỗ HB/2B', 'uploads/products/butchigo.jpg', 'Sản phẩm Bút chì gỗ HB/2B phù hợp cho học tập và làm việc hằng ngày.', 3000, 180),
(8, 1, 2, 'Bút dạ quang học tập', 'uploads/products/butdaquang.jpg', 'Sản phẩm Bút dạ quang học tập phù hợp cho học tập và làm việc hằng ngày.', 22000, 90),
(9, 1, 2, 'Bút máy mực xanh ngòi êm', 'uploads/products/butmay.jpg', 'Sản phẩm Bút máy mực xanh ngòi êm phù hợp cho học tập và làm việc hằng ngày.', 45000, 50),
(10, 4, 2, 'Máy tính Casio fx-570VN Plus', 'uploads/products/casio_fx570vn.jpg', 'Sản phẩm Máy tính Casio fx-570VN Plus phù hợp cho học tập và làm việc hằng ngày.', 690000, 25),
(11, 4, 2, 'Compa kim loại chính xác', 'uploads/products/compa-kim-loai.jpg', 'Sản phẩm Compa kim loại chính xác phù hợp cho học tập và làm việc hằng ngày.', 35000, 60),
(12, 4, 2, 'Compa học sinh tiêu chuẩn', 'uploads/products/compa.jpg', 'Sản phẩm Compa học sinh tiêu chuẩn phù hợp cho học tập và làm việc hằng ngày.', 30000, 70),
(13, 4, 2, 'Giấy A4 70gsm 500 tờ', 'uploads/products/giay-a4-70gsm.png', 'Sản phẩm Giấy A4 70gsm 500 tờ phù hợp cho học tập và làm việc hằng ngày.', 85000, 40),
(14, 5, 2, 'Hộp bút canvas nhiều ngăn', 'uploads/products/hop-but-canvas.png', 'Sản phẩm Hộp bút canvas nhiều ngăn phù hợp cho học tập và làm việc hằng ngày.', 45000, 50),
(15, 4, 2, 'Kéo cắt văn phòng inox', 'uploads/products/keo-cat-van-phong.jpg', 'Sản phẩm Kéo cắt văn phòng inox phù hợp cho học tập và làm việc hằng ngày.', 12000, 75),
(16, 4, 2, 'Keo dán đa năng 40ml', 'uploads/products/keo-dan.jpg', 'Sản phẩm Keo dán đa năng 40ml phù hợp cho học tập và làm việc hằng ngày.', 18000, 100),
(17, 6, 2, 'Hộp màu sáp 12 màu', 'uploads/products/mausap.jpg', 'Sản phẩm Hộp màu sáp 12 màu phù hợp cho học tập và làm việc hằng ngày.', 55000, 80),
(18, 2, 2, 'Sách Địa lí lớp 10', 'uploads/products/sach_dia10.jpg', 'Sản phẩm Sách Địa lí lớp 10 phù hợp cho học tập và làm việc hằng ngày.', 28000, 60),
(19, 2, 2, 'Sách Hóa học lớp 10', 'uploads/products/sach_hoa10.jpg', 'Sản phẩm Sách Hóa học lớp 10 phù hợp cho học tập và làm việc hằng ngày.', 30000, 60),
(20, 2, 2, 'Sách Lịch sử lớp 10', 'uploads/products/sach_ls10.jpg', 'Sản phẩm Sách Lịch sử lớp 10 phù hợp cho học tập và làm việc hằng ngày.', 28000, 60),
(21, 2, 2, 'Sách Vật lý lớp 10', 'uploads/products/sach_ly10.jpg', 'Sản phẩm Sách Vật lý lớp 10 phù hợp cho học tập và làm việc hằng ngày.', 30000, 60),
(22, 2, 2, 'Sách Sinh học lớp 10', 'uploads/products/sach_sinh10.jpg', 'Sản phẩm Sách Sinh học lớp 10 phù hợp cho học tập và làm việc hằng ngày.', 30000, 60),
(23, 2, 2, 'Sách Tiếng Anh lớp 10', 'uploads/products/sach_ta10.jpg', 'Sản phẩm Sách Tiếng Anh lớp 10 phù hợp cho học tập và làm việc hằng ngày.', 32000, 60),
(24, 2, 2, 'Sách Toán lớp 10', 'uploads/products/sach_toan10.jpg', 'Sản phẩm Sách Toán lớp 10 phù hợp cho học tập và làm việc hằng ngày.', 30000, 65),
(25, 2, 2, 'Sách Ngữ văn lớp 10', 'uploads/products/sach_van10.jpg', 'Sản phẩm Sách Ngữ văn lớp 10 phù hợp cho học tập và làm việc hằng ngày.', 30000, 65),
(26, 5, 2, 'Tẩy chì mềm không bụi', 'uploads/products/taychi.jpg', 'Sản phẩm Tẩy chì mềm không bụi phù hợp cho học tập và làm việc hằng ngày.', 4000, 120),
(27, 4, 2, 'Thước kẻ nhựa 30cm trong suốt', 'uploads/products/thuoc-ke-30cm.jpg', 'Sản phẩm Thước kẻ nhựa 30cm trong suốt phù hợp cho học tập và làm việc hằng ngày.', 7000, 90),
(28, 4, 2, 'Thước kẻ nhựa 30cm học sinh', 'uploads/products/thuoc30cm.jpg', 'Sản phẩm Thước kẻ nhựa 30cm học sinh phù hợp cho học tập và làm việc hằng ngày.', 6500, 100),
(29, 3, 2, 'Vở kẻ ngang 200 trang bìa cứng', 'uploads/products/vo-ke-ngang-200-trang.jpg', 'Sản phẩm Vở kẻ ngang 200 trang bìa cứng phù hợp cho học tập và làm việc hằng ngày.', 15000, 100),
(30, 3, 2, 'Vở ô ly 96 trang giấy trắng', 'uploads/products/vo-o-ly-96-trang.jpg', 'Sản phẩm Vở ô ly 96 trang giấy trắng phù hợp cho học tập và làm việc hằng ngày.', 8000, 120),
(31, 3, 2, 'Vở kẻ ngang 200 trang loại phổ thông', 'uploads/products/vo_200trang.jpg', 'Sản phẩm Vở kẻ ngang 200 trang loại phổ thông phù hợp cho học tập và làm việc hằng ngày.', 14000, 110),
(32, 3, 2, 'Vở ô ly 100 trang loại dày', 'uploads/products/vo_oly.jpg', 'Sản phẩm Vở ô ly 100 trang loại dày phù hợp cho học tập và làm việc hằng ngày.', 9000, 115);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `product_images`
--

DROP TABLE IF EXISTS `product_images`;
CREATE TABLE IF NOT EXISTS `product_images` (
  `image_ID` int NOT NULL AUTO_INCREMENT,
  `product_ID` int NOT NULL,
  `image_path` varchar(255) NOT NULL,
  `is_primary` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`image_ID`),
  KEY `idx_product` (`product_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `reviews`
--

DROP TABLE IF EXISTS `reviews`;
CREATE TABLE IF NOT EXISTS `reviews` (
  `review_ID` int NOT NULL AUTO_INCREMENT,
  `user_ID` int DEFAULT NULL,
  `product_ID` int DEFAULT NULL,
  `rating` int DEFAULT NULL,
  `comment` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `review_date` date DEFAULT NULL,
  PRIMARY KEY (`review_ID`),
  KEY `user_ID` (`user_ID`),
  KEY `product_ID` (`product_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `reviews`
--

INSERT INTO `reviews` (`review_ID`, `user_ID`, `product_ID`, `rating`, `comment`, `review_date`) VALUES
(1, 3, 1, 5, 'Bút viết rất mượt, giá hợp lý.', '2026-03-31'),
(2, 3, 2, 4, 'Sách đầy đủ nội dung, giấy tốt.', '2026-03-31'),
(3, 3, 3, 3, 'Vở ổn nhưng giấy hơi mỏng.', '2026-03-31');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `shoppingorder`
--

DROP TABLE IF EXISTS `shoppingorder`;
CREATE TABLE IF NOT EXISTS `shoppingorder` (
  `order_ID` int NOT NULL AUTO_INCREMENT,
  `user_ID` int DEFAULT NULL,
  `order_date` date DEFAULT NULL,
  PRIMARY KEY (`order_ID`),
  KEY `user_ID` (`user_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `shoppingorder`
--

INSERT INTO `shoppingorder` (`order_ID`, `user_ID`, `order_date`) VALUES
(1, 3, '2026-03-30'),
(2, 3, '2026-03-31');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `user_ID` int NOT NULL AUTO_INCREMENT,
  `username` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `password` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `contact_add` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `address` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `role` enum('customer','seller','admin') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `otp` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `otp_expire` datetime DEFAULT NULL,
  `refresh_token` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `google_id` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `facebook_id` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_ID`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `users`
--

INSERT INTO `users` (`user_ID`, `username`, `password`, `name`, `contact_add`, `address`, `email`, `role`, `otp`, `otp_expire`, `refresh_token`, `google_id`, `facebook_id`, `created_at`) VALUES
(1, 'admin01', '123456', 'Nguyễn Văn Admin', '0123456789', 'Hà Nội', 'admin01@example.com', 'admin', NULL, NULL, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX0lEIjoxLCJpYXQiOjE3NzYwNDEzNzEsImV4cCI6MTc3NjY0NjE3MX0.Hu_Xa-92pK_MlXCb5BroxjTsKlgz_wAa29Y0dUHcSZg', NULL, NULL, '2026-04-04 22:19:57'),
(2, 'seller01', '123456', 'Trần Thị Seller', '0987654321', 'Hồ Chí Minh', 'seller01@example.com', 'seller', NULL, NULL, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX0lEIjoyLCJpYXQiOjE3NzYwNDE0MjYsImV4cCI6MTc3NjY0NjIyNn0.IWaxcvmgD2XHx6CikaARjqkAkeiPUJGTpnxezct0A7k', NULL, NULL, '2026-04-04 22:19:57'),
(3, 'user01', '123456', 'Lê Văn Customer', '0911223344', 'Đà Nẵng', 'user01@example.com', 'customer', NULL, NULL, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX0lEIjozLCJpYXQiOjE3NzYwNDE0MTUsImV4cCI6MTc3NjY0NjIxNX0.ZaGlGH75yDvSxLpOLu0wbvtgUSsOr_AGWetAqLXXD3o', NULL, NULL, '2026-04-04 22:19:57'),
(4, 'vmjocker6_gmail_com', NULL, 'Lâm Jocker', NULL, NULL, 'vmjocker6@gmail.com', 'customer', NULL, NULL, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX0lEIjo0LCJpYXQiOjE3NzU3OTkyNjAsImV4cCI6MTc3NjQwNDA2MH0.GNfwkqwcxjNiZNQr-FrmxYWp1XZzdtUKnUEqB1TVOqQ', '102861011431383690052', NULL, '2026-04-09 22:33:12'),
(5, 'ntdat_ntay_gmail_com', NULL, 'NGUYỄN TẤN ĐẠT', NULL, NULL, 'ntdat.ntay@gmail.com', 'customer', NULL, NULL, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX0lEIjo1LCJpYXQiOjE3NzU4MDAyOTUsImV4cCI6MTc3NjQwNTA5NX0.owerzKEsGSFraltzCxmJatBImH6GXvvvEb0XVNloxcE', '106795864689490968436', NULL, '2026-04-09 22:51:35'),
(6, 'facebook_122279385854076789', NULL, 'Bảo Châu', NULL, NULL, NULL, 'customer', NULL, NULL, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX0lEIjo2LCJpYXQiOjE3NzU4MDM1MTMsImV4cCI6MTc3NjQwODMxM30.jiaImIHUx8XHdP-kCWwnZwHmHR5tBWoqu9n2rMwpdIs', NULL, '122279385854076789', '2026-04-09 23:09:47');

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `carts`
--
ALTER TABLE `carts`
  ADD CONSTRAINT `carts_ibfk_1` FOREIGN KEY (`user_ID`) REFERENCES `users` (`user_ID`);

--
-- Các ràng buộc cho bảng `cart_items`
--
ALTER TABLE `cart_items`
  ADD CONSTRAINT `cart_items_ibfk_1` FOREIGN KEY (`cart_id`) REFERENCES `carts` (`id`),
  ADD CONSTRAINT `cart_items_ibfk_2` FOREIGN KEY (`product_ID`) REFERENCES `products` (`product_ID`);

--
-- Các ràng buộc cho bảng `deliveries`
--
ALTER TABLE `deliveries`
  ADD CONSTRAINT `deliveries_ibfk_1` FOREIGN KEY (`order_ID`) REFERENCES `shoppingorder` (`order_ID`);

--
-- Các ràng buộc cho bảng `payment`
--
ALTER TABLE `payment`
  ADD CONSTRAINT `payment_ibfk_1` FOREIGN KEY (`order_ID`) REFERENCES `shoppingorder` (`order_ID`);

--
-- Các ràng buộc cho bảng `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_ibfk_1` FOREIGN KEY (`category_ID`) REFERENCES `categories` (`category_ID`),
  ADD CONSTRAINT `products_ibfk_2` FOREIGN KEY (`seller_ID`) REFERENCES `users` (`user_ID`);

--
-- Các ràng buộc cho bảng `product_images`
--
ALTER TABLE `product_images`
  ADD CONSTRAINT `product_images_ibfk_1` FOREIGN KEY (`product_ID`) REFERENCES `products` (`product_ID`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`user_ID`) REFERENCES `users` (`user_ID`),
  ADD CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`product_ID`) REFERENCES `products` (`product_ID`);

--
-- Các ràng buộc cho bảng `shoppingorder`
--
ALTER TABLE `shoppingorder`
  ADD CONSTRAINT `shoppingorder_ibfk_1` FOREIGN KEY (`user_ID`) REFERENCES `users` (`user_ID`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
CREATE TABLE `order_details` (
  `order_detail_ID` int(11) NOT NULL,
  `order_ID` int(11) NOT NULL,
  `product_ID` int(11) NOT NULL,
  `quantity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
INSERT INTO `order_details` (`order_detail_ID`, `order_ID`, `product_ID`, `quantity`) VALUES
(10, 1, 2, 3),
(11, 2, 2, 3),
(12, 3, 1, 2);