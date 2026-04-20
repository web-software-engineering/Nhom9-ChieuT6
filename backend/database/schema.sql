  SET NAMES utf8mb4;
  SET FOREIGN_KEY_CHECKS = 0;

  CREATE DATABASE IF NOT EXISTS `onlineshoppingsystem` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  CREATE DATABASE IF NOT EXISTS `railway` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  CREATE DATABASE IF NOT EXISTS `sys` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

  USE `onlineshoppingsystem`;

  CREATE TABLE IF NOT EXISTS `categories` (
    `category_ID` int NOT NULL AUTO_INCREMENT,
    `category_name` varchar(100) DEFAULT NULL,
    `category_type` varchar(100) DEFAULT NULL,
    PRIMARY KEY (`category_ID`)
  ) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

  CREATE TABLE IF NOT EXISTS `deliveries` (
    `deliveries_ID` int NOT NULL AUTO_INCREMENT,
    `order_ID` int DEFAULT NULL,
    `delivery_date` date DEFAULT NULL,
    PRIMARY KEY (`deliveries_ID`),
    KEY `order_ID` (`order_ID`),
    CONSTRAINT `deliveries_ibfk_1` FOREIGN KEY (`order_ID`) REFERENCES `shoppingorder` (`order_ID`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

  CREATE TABLE IF NOT EXISTS `payment` (
    `payment_ID` int NOT NULL AUTO_INCREMENT,
    `order_ID` int DEFAULT NULL,
    `payment_date` date DEFAULT NULL,
    PRIMARY KEY (`payment_ID`),
    KEY `order_ID` (`order_ID`),
    CONSTRAINT `payment_ibfk_1` FOREIGN KEY (`order_ID`) REFERENCES `shoppingorder` (`order_ID`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

  CREATE TABLE IF NOT EXISTS `product_images` (
    `image_ID` int NOT NULL AUTO_INCREMENT,
    `product_ID` int NOT NULL,
    `image_path` varchar(255) NOT NULL,
    `is_primary` tinyint(1) DEFAULT '0',
    `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`image_ID`),
    KEY `idx_product` (`product_ID`),
    CONSTRAINT `product_images_ibfk_1` FOREIGN KEY (`product_ID`) REFERENCES `products` (`product_ID`) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

  CREATE TABLE IF NOT EXISTS `products` (
    `product_ID` int NOT NULL AUTO_INCREMENT,
    `category_ID` int DEFAULT NULL,
    `seller_ID` int DEFAULT NULL,
    `product_name` varchar(255) NOT NULL,
    `product_image` varchar(255) DEFAULT NULL,
    `description` longtext,
    `price` double NOT NULL,
    `number` int NOT NULL,
    `import_date` date DEFAULT NULL,
    `view_count` int DEFAULT '0',
    `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`product_ID`),
    KEY `seller_ID` (`seller_ID`),
    KEY `idx_price` (`price`),
    KEY `idx_category` (`category_ID`),
    KEY `idx_views` (`view_count`),
    CONSTRAINT `products_ibfk_1` FOREIGN KEY (`category_ID`) REFERENCES `categories` (`category_ID`),
    CONSTRAINT `products_ibfk_2` FOREIGN KEY (`seller_ID`) REFERENCES `users` (`user_ID`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

  CREATE TABLE IF NOT EXISTS `reviews` (
    `review_ID` int NOT NULL AUTO_INCREMENT,
    `user_ID` int DEFAULT NULL,
    `product_ID` int DEFAULT NULL,
    `rating` int DEFAULT NULL,
    `comment` text,
    `review_date` date DEFAULT NULL,
    PRIMARY KEY (`review_ID`),
    KEY `user_ID` (`user_ID`),
    KEY `product_ID` (`product_ID`),
    CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`user_ID`) REFERENCES `users` (`user_ID`),
    CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`product_ID`) REFERENCES `products` (`product_ID`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

  CREATE TABLE IF NOT EXISTS `shoppingorder` (
    `order_ID` int NOT NULL AUTO_INCREMENT,
    `user_ID` int DEFAULT NULL,
    `order_date` date DEFAULT NULL,
    PRIMARY KEY (`order_ID`),
    KEY `user_ID` (`user_ID`),
    CONSTRAINT `shoppingorder_ibfk_1` FOREIGN KEY (`user_ID`) REFERENCES `users` (`user_ID`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

  CREATE TABLE IF NOT EXISTS `users` (
    `user_ID` int NOT NULL AUTO_INCREMENT,
    `username` varchar(100) DEFAULT NULL,
    `password` varchar(255) DEFAULT NULL,
    `name` varchar(100) DEFAULT NULL,
    `contact_add` varchar(100) DEFAULT NULL,
    `address` varchar(255) DEFAULT NULL,
    `email` varchar(100) DEFAULT NULL,
    `role` enum('customer','seller','admin') DEFAULT NULL,
    `otp` varchar(10) DEFAULT NULL,
    `otp_expire` datetime DEFAULT NULL,
    `refresh_token` text,
    `google_id` varchar(255) DEFAULT NULL,
    `facebook_id` varchar(255) DEFAULT NULL,
    `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`user_ID`),
    UNIQUE KEY `username` (`username`),
    UNIQUE KEY `unique_google` (`google_id`),
    UNIQUE KEY `unique_facebook` (`facebook_id`)
  ) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

  INSERT IGNORE INTO `categories` VALUES (1,'Bút bi','Đồ dùng học tập'),(2,'Sách giáo khoa','Sách'),(3,'Vở kẻ ngang','Đồ dùng học tập'),(4,'Thiết bị học tập','Thiết bị'),(5,'Phụ kiện','Phụ kiện học tập'),(6,'Mỹ thuật','Đồ dùng mỹ thuật'),(7,'Mỹ thuật 2','Đồ dùng mỹ thuật');
  INSERT IGNORE INTO `users` VALUES (1,'admin01','123456','Nguyễn Văn Admin','0123456789','Hà Nội','admin01@example.com','admin',NULL,NULL,NULL,NULL,NULL,'2026-04-10 05:38:14'),(2,'seller01','123456','Trần Thị Seller','0987654321','Hồ Chí Minh','seller01@example.com','seller',NULL,NULL,NULL,NULL,NULL,'2026-04-10 05:38:14'),(3,'user01','123456','Lê Văn Customer','0911223344','Đà Nẵng','user01@example.com','customer',NULL,NULL,NULL,NULL,NULL,'2026-04-10 05:38:14');
  INSERT IGNORE INTO `products` (`product_ID`,`category_ID`,`seller_ID`,`product_name`,`product_image`,`description`,`price`,`number`,`import_date`,`view_count`,`created_at`) VALUES
  (1,1,2,'Bút bi Thiên Long TL-027','uploads/products/but-bi-thien-long-tl027.jpg','Bút bi mực xanh, viết êm, phù hợp cho học sinh và văn phòng.',5000,150,'2026-04-01',120,'2026-04-10 05:38:14'),
  (2,1,2,'Bút chì 2B','uploads/products/but-chi-2b.png','Bút chì 2B dễ viết, dễ tẩy, dùng để ghi chú và phác thảo.',3000,200,'2026-04-01',95,'2026-04-10 05:38:14'),
  (3,3,2,'Vở kẻ ngang 200 trang','uploads/products/vo-ke-ngang-200-trang.jpg','Vở 200 trang giấy trắng, kẻ ngang rõ nét.',15000,100,'2026-04-02',78,'2026-04-10 05:38:14'),
  (4,4,2,'Compa kim loại','uploads/products/compa-kim-loai.jpg','Compa kim loại chắc chắn, độ chính xác cao.',35000,60,'2026-04-02',64,'2026-04-10 05:38:14'),
  (5,2,2,'Sách Toán lớp 10','uploads/products/sach_toan10.jpg','Sách giáo khoa Toán 10 theo chương trình mới.',30000,65,'2026-04-03',110,'2026-04-10 05:38:14'),
  (6,4,2,'Giấy A4 70gsm','uploads/products/giay-a4-70gsm.png','Giấy in A4 định lượng 70gsm, 500 tờ/ream.',85000,40,'2026-04-03',82,'2026-04-10 05:38:14'),
  (7,5,2,'Balo học sinh','uploads/products/balo.jpg','Balo chống nước, nhiều ngăn tiện dụng.',220000,40,'2026-04-04',58,'2026-04-10 05:38:14'),
  (8,6,2,'Bộ bút màu 24 cây','uploads/products/but-mau-24-cay.webp','Bộ 24 màu tươi sáng, phù hợp học vẽ.',55000,65,'2026-04-04',71,'2026-04-10 05:38:14');
  INSERT IGNORE INTO `product_images` (`image_ID`,`product_ID`,`image_path`,`is_primary`,`created_at`) VALUES
  (1,1,'uploads/products/but-bi-thien-long-tl027.jpg',1,'2026-04-10 05:38:14'),
  (2,2,'uploads/products/but-chi-2b.png',1,'2026-04-10 05:38:14'),
  (3,3,'uploads/products/vo-ke-ngang-200-trang.jpg',1,'2026-04-10 05:38:14'),
  (4,4,'uploads/products/compa-kim-loai.jpg',1,'2026-04-10 05:38:14'),
  (5,5,'uploads/products/sach_toan10.jpg',1,'2026-04-10 05:38:14'),
  (6,6,'uploads/products/giay-a4-70gsm.png',1,'2026-04-10 05:38:14'),
  (7,7,'uploads/products/balo.jpg',1,'2026-04-10 05:38:14'),
  (8,8,'uploads/products/but-mau-24-cay.webp',1,'2026-04-10 05:38:14');
  INSERT IGNORE INTO `shoppingorder` (`order_ID`,`user_ID`,`order_date`) VALUES
  (1,3,'2026-04-05'),
  (2,3,'2026-04-06'),
  (3,3,'2026-04-07');
  INSERT IGNORE INTO `payment` (`payment_ID`,`order_ID`,`payment_date`) VALUES
  (1,1,'2026-04-05'),
  (2,2,'2026-04-06'),
  (3,3,'2026-04-07');
  INSERT IGNORE INTO `deliveries` (`deliveries_ID`,`order_ID`,`delivery_date`) VALUES
  (1,1,'2026-04-06'),
  (2,2,'2026-04-07'),
  (3,3,'2026-04-08');
  INSERT IGNORE INTO `reviews` (`review_ID`,`user_ID`,`product_ID`,`rating`,`comment`,`review_date`) VALUES
  (1,3,1,5,'Bút viết êm, mực đều và không lem.','2026-04-06'),
  (2,3,5,4,'Sách in rõ ràng, nội dung đầy đủ.','2026-04-07'),
  (3,3,3,4,'Vở giấy tốt, viết không bị nhòe.','2026-04-08');

  UPDATE `products`
  SET `product_image` = CONCAT('uploads/products/', SUBSTRING_INDEX(`product_image`, '/', -1))
  WHERE `product_image` IS NOT NULL
    AND `product_image` NOT LIKE 'uploads/products/%';

  UPDATE `product_images`
  SET `image_path` = CONCAT('uploads/products/', SUBSTRING_INDEX(`image_path`, '/', -1))
  WHERE `image_path` IS NOT NULL
    AND `image_path` NOT LIKE 'uploads/products/%';

  USE `railway`;

  CREATE TABLE IF NOT EXISTS `cart_items` (
    `id` int NOT NULL AUTO_INCREMENT,
    `cart_id` int NOT NULL,
    `product_ID` int NOT NULL,
    `quantity` int NOT NULL,
    PRIMARY KEY (`id`),
    KEY `cart_id` (`cart_id`),
    KEY `product_ID` (`product_ID`),
    CONSTRAINT `cart_items_ibfk_1` FOREIGN KEY (`cart_id`) REFERENCES `carts` (`id`),
    CONSTRAINT `cart_items_ibfk_2` FOREIGN KEY (`product_ID`) REFERENCES `products` (`product_ID`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

  CREATE TABLE IF NOT EXISTS `carts` (
    `id` int NOT NULL AUTO_INCREMENT,
    `user_ID` int NOT NULL,
    PRIMARY KEY (`id`),
    KEY `user_ID` (`user_ID`),
    CONSTRAINT `carts_ibfk_1` FOREIGN KEY (`user_ID`) REFERENCES `users` (`user_ID`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

  CREATE TABLE IF NOT EXISTS `categories` (
    `category_ID` int NOT NULL AUTO_INCREMENT,
    `category_name` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
    `category_type` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
    PRIMARY KEY (`category_ID`)
  ) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

  CREATE TABLE IF NOT EXISTS `deliveries` (
    `deliveries_ID` int NOT NULL AUTO_INCREMENT,
    `order_ID` int DEFAULT NULL,
    `delivery_date` date DEFAULT NULL,
    PRIMARY KEY (`deliveries_ID`),
    KEY `order_ID` (`order_ID`),
    CONSTRAINT `deliveries_ibfk_1` FOREIGN KEY (`order_ID`) REFERENCES `shoppingorder` (`order_ID`)
  ) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

  CREATE TABLE IF NOT EXISTS `payment` (
    `payment_ID` int NOT NULL AUTO_INCREMENT,
    `order_ID` int DEFAULT NULL,
    `payment_date` date DEFAULT NULL,
    PRIMARY KEY (`payment_ID`),
    KEY `order_ID` (`order_ID`),
    CONSTRAINT `payment_ibfk_1` FOREIGN KEY (`order_ID`) REFERENCES `shoppingorder` (`order_ID`)
  ) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

  CREATE TABLE IF NOT EXISTS `products` (
    `product_ID` int NOT NULL AUTO_INCREMENT,
    `category_ID` int DEFAULT NULL,
    `seller_ID` int DEFAULT NULL,
    `product_name` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
    `product_image` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
    `description` longtext COLLATE utf8mb4_general_ci,
    `price` double NOT NULL,
    `number` int NOT NULL,
    PRIMARY KEY (`product_ID`),
    KEY `category_ID` (`category_ID`),
    KEY `seller_ID` (`seller_ID`),
    CONSTRAINT `products_ibfk_1` FOREIGN KEY (`category_ID`) REFERENCES `categories` (`category_ID`),
    CONSTRAINT `products_ibfk_2` FOREIGN KEY (`seller_ID`) REFERENCES `users` (`user_ID`)
  ) ENGINE=InnoDB AUTO_INCREMENT=43 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

  SET @has_description := (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'products'
      AND COLUMN_NAME = 'description'
  );

  SET @alter_products_sql := IF(
    @has_description = 0,
    'ALTER TABLE `products` ADD COLUMN `description` longtext COLLATE utf8mb4_general_ci AFTER `product_image`',
    'SELECT 1'
  );

  PREPARE alter_products_stmt FROM @alter_products_sql;
  EXECUTE alter_products_stmt;
  DEALLOCATE PREPARE alter_products_stmt;

  CREATE TABLE IF NOT EXISTS `reviews` (
    `review_ID` int NOT NULL AUTO_INCREMENT,
    `user_ID` int DEFAULT NULL,
    `product_ID` int DEFAULT NULL,
    `rating` int DEFAULT NULL,
    `comment` text COLLATE utf8mb4_general_ci,
    `review_date` date DEFAULT NULL,
    PRIMARY KEY (`review_ID`),
    KEY `user_ID` (`user_ID`),
    KEY `product_ID` (`product_ID`),
    CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`user_ID`) REFERENCES `users` (`user_ID`),
    CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`product_ID`) REFERENCES `products` (`product_ID`)
  ) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

  CREATE TABLE IF NOT EXISTS `shoppingorder` (
    `order_ID` int NOT NULL AUTO_INCREMENT,
    `user_ID` int DEFAULT NULL,
    `order_date` date DEFAULT NULL,
    PRIMARY KEY (`order_ID`),
    KEY `user_ID` (`user_ID`),
    CONSTRAINT `shoppingorder_ibfk_1` FOREIGN KEY (`user_ID`) REFERENCES `users` (`user_ID`)
  ) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

  CREATE TABLE IF NOT EXISTS `users` (
    `user_ID` int NOT NULL AUTO_INCREMENT,
    `username` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
    `password` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
    `name` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
    `contact_add` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
    `address` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
    `email` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
    `role` enum('customer','seller','admin') COLLATE utf8mb4_general_ci DEFAULT NULL,
    `otp` varchar(10) COLLATE utf8mb4_general_ci DEFAULT NULL,
    `otp_expire` datetime DEFAULT NULL,
    `refresh_token` text COLLATE utf8mb4_general_ci,
    `google_id` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
    `facebook_id` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
    `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`user_ID`),
    UNIQUE KEY `username` (`username`)
  ) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

  INSERT IGNORE INTO `categories` VALUES (1,'Bút bi','Đồ dùng học tập'),(2,'Sách giáo khoa','Sách'),(3,'Vở kẻ ngang','Đồ dùng học tập'),(4,'Thiết bị học tập','Thiết bị'),(5,'Phụ kiện','Phụ kiện học tập'),(6,'Mỹ thuật','Đồ dùng mỹ thuật'),(7,'Mỹ thuật 2','Đồ dùng mỹ thuật');
  INSERT IGNORE INTO `deliveries` VALUES (1,1,'2026-04-01'),(2,2,'2026-04-02');
  INSERT IGNORE INTO `payment` VALUES (1,1,'2026-03-30'),(2,2,'2026-03-31');
  INSERT IGNORE INTO `products` (`product_ID`,`category_ID`,`seller_ID`,`product_name`,`product_image`,`description`,`price`,`number`) VALUES
  (1,5,2,'Balo học sinh chống nước','uploads/products/balo.jpg',NULL,220000,40),
  (2,1,2,'Bút bi Thiên Long TL-027 chính hãng','uploads/products/but-bi-thien-long-tl027.jpg',NULL,5000,150),
  (3,1,2,'Bút chì gỗ 2B học sinh','uploads/products/but-chi-2b.png',NULL,3000,200),
  (4,1,2,'Bộ bút dạ quang 6 màu','uploads/products/but-da-quang-6-mau.jpg',NULL,25000,80),
  (5,6,2,'Bộ bút màu 24 cây','uploads/products/but-mau-24-cay.webp',NULL,55000,65),
  (6,1,2,'Bút bi Thiên Long mực xanh','uploads/products/butbi_thienlong.jpg',NULL,5000,150),
  (7,1,2,'Bút chì gỗ HB/2B','uploads/products/butchigo.jpg',NULL,3000,180),
  (8,1,2,'Bút dạ quang học tập','uploads/products/butdaquang.jpg',NULL,22000,90),
  (9,1,2,'Bút máy mực xanh ngòi êm','uploads/products/butmay.jpg',NULL,45000,50),
  (10,4,2,'Máy tính Casio fx-570VN Plus','uploads/products/casio_fx570vn.jpg',NULL,690000,25),
  (11,4,2,'Compa kim loại chính xác','uploads/products/compa-kim-loai.jpg',NULL,35000,60),
  (12,4,2,'Compa học sinh tiêu chuẩn','uploads/products/compa.jpg',NULL,30000,70),
  (13,4,2,'Giấy A4 70gsm 500 tờ','uploads/products/giay-a4-70gsm.png',NULL,85000,40),
  (14,5,2,'Hộp bút canvas nhiều ngăn','uploads/products/hop-but-canvas.png',NULL,45000,50),
  (15,4,2,'Kéo cắt văn phòng inox','uploads/products/keo-cat-van-phong.jpg',NULL,12000,75),
  (16,4,2,'Keo dán đa năng 40ml','uploads/products/keo-dan.jpg',NULL,18000,100),
  (17,6,2,'Hộp màu sáp 12 màu','uploads/products/mausap.jpg',NULL,55000,80),
  (18,2,2,'Sách Địa lí lớp 10','uploads/products/sach_dia10.jpg',NULL,28000,60),
  (19,2,2,'Sách Hóa học lớp 10','uploads/products/sach_hoa10.jpg',NULL,30000,60),
  (20,2,2,'Sách Lịch sử lớp 10','uploads/products/sach_ls10.jpg',NULL,28000,60),
  (21,2,2,'Sách Vật lý lớp 10','uploads/products/sach_ly10.jpg',NULL,30000,60),
  (22,2,2,'Sách Sinh học lớp 10','uploads/products/sach_sinh10.jpg',NULL,30000,60),
  (23,2,2,'Sách Tiếng Anh lớp 10','uploads/products/sach_ta10.jpg',NULL,32000,60),
  (24,2,2,'Sách Toán lớp 10','uploads/products/sach_toan10.jpg',NULL,30000,65),
  (25,2,2,'Sách Ngữ văn lớp 10','uploads/products/sach_van10.jpg',NULL,30000,65),
  (26,5,2,'Tẩy chì mềm không bụi','uploads/products/taychi.jpg',NULL,4000,120),
  (27,4,2,'Thước kẻ nhựa 30cm trong suốt','uploads/products/thuoc-ke-30cm.jpg',NULL,7000,90),
  (28,4,2,'Thước kẻ nhựa 30cm học sinh','uploads/products/thuoc30cm.jpg',NULL,6500,100),
  (29,3,2,'Vở kẻ ngang 200 trang bìa cứng','uploads/products/vo-ke-ngang-200-trang.jpg',NULL,15000,100),
  (30,3,2,'Vở ô ly 96 trang giấy trắng','uploads/products/vo-o-ly-96-trang.jpg',NULL,8000,120),
  (31,3,2,'Vở kẻ ngang 200 trang loại phổ thông','uploads/products/vo_200trang.jpg',NULL,14000,110),
  (32,3,2,'Vở ô ly 100 trang loại dày','uploads/products/vo_oly.jpg',NULL,9000,115);

  UPDATE `products`
  SET `description` = CONCAT('Sản phẩm ', `product_name`, ' phù hợp cho học tập và làm việc hằng ngày.')
  WHERE `description` IS NULL OR TRIM(`description`) = '';

  INSERT IGNORE INTO `reviews` VALUES (1,3,1,5,'Bút viết rất mượt, giá hợp lý.','2026-03-31'),(2,3,2,4,'Sách đầy đủ nội dung, giấy tốt.','2026-03-31'),(3,3,3,3,'Vở ổn nhưng giấy hơi mỏng.','2026-03-31');
  INSERT IGNORE INTO `shoppingorder` VALUES (1,3,'2026-03-30'),(2,3,'2026-03-31');
  INSERT IGNORE INTO `users` VALUES (1,'admin01','123456','Nguyễn Văn Admin','0123456789','Hà Nội','admin01@example.com','admin',NULL,NULL,NULL,NULL,NULL,'2026-04-05 05:19:57'),(2,'seller01','123456','Trần Thị Seller','0987654321','Hồ Chí Minh','seller01@example.com','seller',NULL,NULL,NULL,NULL,NULL,'2026-04-05 05:19:57'),(3,'user01','123456','Lê Văn Customer','0911223344','Đà Nẵng','user01@example.com','customer',NULL,NULL,NULL,NULL,NULL,'2026-04-05 05:19:57'),(4,'vmjocker6_gmail_com',NULL,'Lâm Jocker',NULL,NULL,'vmjocker6@gmail.com','customer',NULL,NULL,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX0lEIjo0LCJpYXQiOjE3NzU3OTkyNjAsImV4cCI6MTc3NjQwNDA2MH0.GNfwkqwcxjNiZNQr-FrmxYWp1XZzdtUKnUEqB1TVOqQ','102861011431383690052',NULL,'2026-04-10 05:33:12'),(5,'ntdat_ntay_gmail_com',NULL,'NGUYỄN TẤN ĐẠT',NULL,NULL,'ntdat.ntay@gmail.com','customer',NULL,NULL,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX0lEIjo1LCJpYXQiOjE3NzU4MDAyOTUsImV4cCI6MTc3NjQwNTA5NX0.owerzKEsGSFraltzCxmJatBImH6GXvvvEb0XVNloxcE','106795864689490968436',NULL,'2026-04-10 05:51:35'),(6,'facebook_122279385854076789',NULL,'Bảo Châu',NULL,NULL,NULL,'customer',NULL,NULL,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX0lEIjo2LCJpYXQiOjE3NzU4MDM1MTMsImV4cCI6MTc3NjQwODMxM30.jiaImIHUx8XHdP-kCWwnZwHmHR5tBWoqu9n2rMwpdIs',NULL,'122279385854076789','2026-04-10 06:09:47');
  INSERT IGNORE INTO `carts` (`id`,`user_ID`) VALUES
  (1,3),
  (2,4);
  INSERT IGNORE INTO `cart_items` (`id`,`cart_id`,`product_ID`,`quantity`) VALUES
  (1,1,1,2),
  (2,1,5,1),
  (3,2,10,1);

  USE `sys`;

  CREATE TABLE IF NOT EXISTS `sys_config` (
    `variable` varchar(128) NOT NULL,
    `value` varchar(128) DEFAULT NULL,
    `set_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `set_by` varchar(128) DEFAULT NULL,
    PRIMARY KEY (`variable`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

  INSERT IGNORE INTO `sys_config` VALUES ('diagnostics.allow_i_s_tables','OFF','2026-03-31 14:50:01',NULL),('diagnostics.include_raw','OFF','2026-03-31 14:50:01',NULL),('ps_thread_trx_info.max_length','65535','2026-03-31 14:50:01',NULL),('statement_performance_analyzer.limit','100','2026-03-31 14:50:01',NULL),('statement_performance_analyzer.view',NULL,'2026-03-31 14:50:01',NULL),('statement_truncate_len','64','2026-03-31 14:50:01',NULL);

  SET FOREIGN_KEY_CHECKS = 1;