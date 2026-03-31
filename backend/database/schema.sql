CREATE DATABASE OnlineShoppingSystem;
GO
USE OnlineShoppingSystem;
GO

-- Bảng Users (gồm cả khách hàng, seller, admin)
CREATE TABLE Users (
    user_ID INT PRIMARY KEY IDENTITY(1,1),
    username NVARCHAR(100) UNIQUE,
    password NVARCHAR(100),
    name NVARCHAR(100),
    contact_add NVARCHAR(100),
    address NVARCHAR(255),
    email NVARCHAR(100),
    role NVARCHAR(20) CHECK (role IN ('customer','seller','admin'))
);

-- Bảng Categories
CREATE TABLE Categories (
    category_ID INT PRIMARY KEY IDENTITY(1,1),
    category_name NVARCHAR(100),
    category_type NVARCHAR(100)
);

-- Bảng Products
CREATE TABLE Products (
    product_ID INT PRIMARY KEY IDENTITY(1,1),
    category_ID INT,
    seller_ID INT,
    product_name NVARCHAR(100),
	product_image NVARCHAR(255),
    FOREIGN KEY (category_ID) REFERENCES Categories(category_ID),
    FOREIGN KEY (seller_ID) REFERENCES Users(user_ID)
);

-- Bảng Shopping Order
CREATE TABLE ShoppingOrder (
    order_ID INT PRIMARY KEY IDENTITY(1,1),
    user_ID INT,
    date DATE,
    FOREIGN KEY (user_ID) REFERENCES Users(user_ID)
);

-- Bảng Payment
CREATE TABLE Payment (
    payment_ID INT PRIMARY KEY IDENTITY(1,1),
    order_ID INT,
    date DATE,
    FOREIGN KEY (order_ID) REFERENCES ShoppingOrder(order_ID)
);

-- Bảng Deliveries
CREATE TABLE Deliveries (
    deliveries_ID INT PRIMARY KEY IDENTITY(1,1),
    order_ID INT,
    date DATE,
    FOREIGN KEY (order_ID) REFERENCES ShoppingOrder(order_ID)
);



-- bảng Reviews 
CREATE TABLE Reviews (
    review_ID INT PRIMARY KEY IDENTITY(1,1),
    user_ID INT,
    product_ID INT,
    rating INT CHECK (rating BETWEEN 1 AND 5), 
    comment NVARCHAR(MAX),
    review_date DATE,
    FOREIGN KEY (user_ID) REFERENCES Users(user_ID),
    FOREIGN KEY (product_ID) REFERENCES Products(product_ID)
);

-- Thêm Users (gom khách hàng, seller, admin)
INSERT INTO Users (username, password, name, contact_add, address, email, role)
VALUES 
('admin01', '123456', N'Nguyễn Văn Admin', '0123456789', N'Hà Nội', 'admin01@example.com', 'admin'),
('seller01', '123456', N'Trần Thị Seller', '0987654321', N'Hồ Chí Minh', 'seller01@example.com', 'seller'),
('user01', '123456', N'Lê Văn Customer', '0911223344', N'Đà Nẵng', 'user01@example.com', 'customer');

-- Thêm Categories
INSERT INTO Categories (category_name, category_type)
VALUES 
(N'Bút bi', N'Đồ dùng học tập'),
(N'Sách giáo khoa', N'Sách'),
(N'Vở kẻ ngang', N'Đồ dùng học tập');
(N'Thiết bị học tập', N'Thiết bị'),      
(N'Phụ kiện', N'Phụ kiện học tập'),      
(N'Mỹ thuật', N'Đồ dùng mỹ thuật');     

-- Thêm Products
INSERT INTO Products (category_ID, seller_ID, product_name, product_image)
VALUES 
(1, 2, N'Bút bi Thiên Long', 'frontend/src/assets/images/butbi_thienlong.jpg'),
(2, 2, N'Sách Toán lớp 10', 'frontend/src/assets/images/sach_toan10.jpg'),
(3, 2, N'Vở kẻ ngang 200 trang', 'frontend/src/assets/images/vo_200trang.jpg'),
(1, 2, N'Bút chì gỗ', 'frontend/src/assets/images/butchigo.jpg'),
(1, 2, N'Thước kẻ nhựa 30cm', 'frontend/src/assets/images/thuoc30cm.jpg'),
(1, 2, N'Compa học sinh', 'frontend/src/assets/images/compa.jpg'),
(1, 2, N'Tẩy chì', 'frontend/src/assets/images/taychi.jpg'),
(3, 2, N'Vở ô ly 100 trang', 'frontend/src/assets/images/vo_oly.jpg'),
(2, 2, N'Sách Văn lớp 10', 'frontend/src/assets/images/sach_van10.jpg'),
(2, 2, N'Sách Tiếng Anh lớp 10', 'frontend/src/assets/images/sach_ta10.jpg'),
(2, 2, N'Sách Lý lớp 10', 'frontend/src/assets/images/sach_ly10.jpg'),
(2, 2, N'Sách Hóa lớp 10', 'frontend/src/assets/images/sach_hoa10.jpg'),
(2, 2, N'Sách Sinh lớp 10', 'frontend/src/assets/images/sach_sinh10.jpg'),
(2, 2, N'Sách Lịch sử lớp 10', 'frontend/src/assets/images/sach_ls10.jpg'),
(2, 2, N'Sách Địa lý lớp 10', 'frontend/src/assets/images/sach_dia10.jpg'),
(4, 2, N'Máy tính Casio fx-570VN', 'frontend/src/assets/images/casio_fx570vn.jpg'),
(5, 2, N'Balo học sinh', 'frontend/src/assets/images/balo.jpg'),
(6, 2, N'Hộp màu sáp', 'frontend/src/assets/images/mausap.jpg'),
(1, 2, N'Bút dạ quang', 'frontend/src/assets/images/butdaquang.jpg'),
(1, 2, N'Bút máy mực xanh', 'frontend/src/assets/images/butmay.jpg');


-- Thêm Shopping Orders
INSERT INTO ShoppingOrder (user_ID, date)
VALUES 
(3, '2026-03-30'),
(3, '2026-03-31');

-- Thêm Payment
INSERT INTO Payment (order_ID, date)
VALUES 
(1, '2026-03-30'),
(2, '2026-03-31');

-- Thêm Deliveries
INSERT INTO Deliveries (order_ID, date)
VALUES 
(1, '2026-04-01'),
(2, '2026-04-02');

-- Thêm Reviews
INSERT INTO Reviews (user_ID, product_ID, rating, comment, review_date)
VALUES 
(3, 1, 5, N'Bút viết rất mượt, giá hợp lý.', '2026-03-31'),
(3, 2, 4, N'Sách đầy đủ nội dung, giấy tốt.', '2026-03-31'),
(3, 3, 3, N'Vở ổn nhưng giấy hơi mỏng.', '2026-03-31');
