-- ============================================================
-- PARADISE HOTEL MANAGEMENT SYSTEM (PHMS)
-- Master Relational Database Schema (MySQL 8.x Compatible)
-- ============================================================

DROP DATABASE IF EXISTS paradise_hotel;
CREATE DATABASE paradise_hotel CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE paradise_hotel;

-- 1. Users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    phone VARCHAR(20),
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'manager', 'receptionist', 'customer') DEFAULT 'customer',
    status ENUM('active','suspended','inactive') DEFAULT 'active',
    last_login TIMESTAMP NULL,
    last_active TIMESTAMP NULL,
    profile_image VARCHAR(255) DEFAULT NULL,
    address TEXT DEFAULT NULL,
    page VARCHAR(50) DEFAULT 'index',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Customers table
CREATE TABLE customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    country VARCHAR(100) DEFAULT 'Ethiopia',
    region VARCHAR(100),
    zone VARCHAR(100),
    wereda VARCHAR(100),
    kebele VARCHAR(100),
    id_card_image VARCHAR(255),
    id_card_back_image VARCHAR(255),
    fida_number VARCHAR(30),
    sex ENUM('Male', 'Female', 'Other'),
    age INT,
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Employees table
CREATE TABLE employees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    full_name VARCHAR(100) NOT NULL,
    position VARCHAR(50) NOT NULL,
    salary DECIMAL(10,2) DEFAULT NULL,
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(20),
    address TEXT,
    status ENUM('active', 'inactive', 'on_leave') DEFAULT 'active',
    hire_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. Rooms table
CREATE TABLE rooms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_number VARCHAR(20) UNIQUE NOT NULL,
    room_type ENUM('Single', 'Double', 'Twin', 'Suite', 'Family', 'Deluxe') NOT NULL,
    description TEXT,
    price_per_night DECIMAL(10,2) NOT NULL,
    capacity INT DEFAULT 2,
    status ENUM('available', 'booked', 'reserved', 'pending', 'maintenance') DEFAULT 'available',
    image VARCHAR(255) DEFAULT 'room-default.jpg',
    amenities TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Room reservations table
CREATE TABLE room_reservations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_id INT,
    customer_id INT,
    guest_name VARCHAR(100) NOT NULL,
    guest_phone VARCHAR(20),
    guest_email VARCHAR(100),
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    number_of_guests INT DEFAULT 1,
    total_price DECIMAL(10,2) NOT NULL,
    country VARCHAR(100),
    region VARCHAR(100),
    zone VARCHAR(100),
    wereda VARCHAR(100),
    kebele VARCHAR(100),
    id_card_image VARCHAR(255),
    id_card_back_image VARCHAR(255),
    fida_number VARCHAR(30),
    status ENUM('pending', 'approved', 'rejected', 'checked_in', 'checked_out', 'cancelled') DEFAULT 'pending',
    payment_status ENUM('pending', 'paid', 'failed') DEFAULT 'pending',
    payment_reference VARCHAR(100),
    rejection_reason VARCHAR(255),
    special_requests TEXT,
    is_read TINYINT(1) DEFAULT 0,
    reservation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES rooms(id),
    FOREIGN KEY (customer_id) REFERENCES customers(id)
);

-- 6. Desks table
CREATE TABLE desks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    desk_number VARCHAR(20) UNIQUE NOT NULL,
    capacity INT NOT NULL,
    location VARCHAR(100),
    status ENUM('available', 'booked', 'reserved', 'pending', 'maintenance') DEFAULT 'available',
    price DECIMAL(10,2) DEFAULT 0 COMMENT 'Hourly rate charged when desk is reserved without a food order',
    description TEXT,
    image VARCHAR(255) DEFAULT 'desk-default.jpg',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Desk reservations table
CREATE TABLE desk_reservations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    desk_id INT,
    customer_id INT,
    guest_name VARCHAR(100) NOT NULL,
    guest_phone VARCHAR(20),
    guest_email VARCHAR(100),
    reservation_date DATE NOT NULL,
    time_slot ENUM('breakfast', 'lunch', 'dinner', 'any') NOT NULL,
    start_time DATETIME NULL,
    end_time DATETIME NULL,
    duration_hours DECIMAL(6,2) DEFAULT 0,
    is_free_with_food TINYINT(1) DEFAULT 0,
    amount DECIMAL(10,2) DEFAULT 0,
    party_size INT NOT NULL,
    status ENUM('pending', 'approved', 'rejected', 'completed', 'cancelled') DEFAULT 'pending',
    payment_status ENUM('pending', 'paid', 'failed') DEFAULT 'pending',
    payment_reference VARCHAR(100),
    rejection_reason VARCHAR(255),
    special_requests TEXT,
    is_read TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (desk_id) REFERENCES desks(id),
    FOREIGN KEY (customer_id) REFERENCES customers(id)
);

-- 8. Food menu table
CREATE TABLE food_menu (
    id INT AUTO_INCREMENT PRIMARY KEY,
    item_name VARCHAR(100) NOT NULL,
    category ENUM('Breakfast', 'Lunch', 'Dinner', 'Beverage', 'Dessert', 'Fast Food', 'Traditional Food', 'Main Course', 'Vegetarian', 'International', 'Appetizer') NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    availability ENUM('available', 'unavailable') DEFAULT 'available',
    image VARCHAR(255) DEFAULT 'food-default.jpg',
    is_special BOOLEAN DEFAULT FALSE,
    ingredients TEXT,
    preparation_time INT DEFAULT 15,
    is_hidden TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. Food orders table
CREATE TABLE food_orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT,
    order_type ENUM('room', 'desk', 'takeaway', 'delivery') NOT NULL,
    delivery_type ENUM('delivery','pickup') DEFAULT 'pickup',
    reference_id INT,
    desk_reservation_id INT NULL,
    is_free TINYINT(1) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'approved', 'preparing', 'ready', 'served', 'cancelled', 'delivered') DEFAULT 'pending',
    payment_status ENUM('pending', 'paid', 'failed') DEFAULT 'pending',
    payment_reference VARCHAR(100),
    rejection_reason VARCHAR(255),
    special_instructions TEXT,
    delivery_address TEXT,
    is_read TINYINT(1) DEFAULT 0,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (desk_reservation_id) REFERENCES desk_reservations(id)
);

-- 10. Food order items table
CREATE TABLE food_order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT,
    menu_id INT,
    quantity INT NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    special_instructions TEXT,
    FOREIGN KEY (order_id) REFERENCES food_orders(id) ON DELETE CASCADE,
    FOREIGN KEY (menu_id) REFERENCES food_menu(id)
);

-- 11. Comments & Feedback table
CREATE TABLE comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT,
    user_id INT DEFAULT NULL,
    username VARCHAR(50),
    first_name VARCHAR(50) DEFAULT NULL,
    last_name VARCHAR(50) DEFAULT NULL,
    job_title VARCHAR(100),
    photo VARCHAR(255),
    feedback TEXT NOT NULL,
    rating INT DEFAULT 5,
    type ENUM('feedback','report') DEFAULT 'feedback',
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id)
);

-- 12. Payments table
CREATE TABLE payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reference_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id INT,
    amount DECIMAL(10,2) NOT NULL,
    payment_type ENUM('room', 'desk', 'food') NOT NULL,
    payment_method VARCHAR(100) DEFAULT 'cbe_birr',
    account_number VARCHAR(50),
    account_name VARCHAR(100),
    transaction_id VARCHAR(100),
    receipt_image VARCHAR(255),
    reservation_type ENUM('room', 'desk', 'food'),
    reservation_id INT,
    status ENUM('pending', 'completed', 'failed', 'approved', 'verified', 'rejected', 'refunded') DEFAULT 'pending',
    rejection_reason VARCHAR(255),
    verified_by INT,
    verified_at TIMESTAMP NULL,
    notes TEXT,
    is_read TINYINT(1) DEFAULT 0,
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id)
);

-- 13. Refund Requests table
CREATE TABLE refund_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    reservation_type ENUM('room', 'desk', 'food') NOT NULL,
    reservation_id INT NOT NULL,
    original_amount DECIMAL(10,2) NOT NULL,
    penalty_percentage DECIMAL(5,2) NOT NULL,
    penalty_amount DECIMAL(10,2) NOT NULL,
    refund_amount DECIMAL(10,2) NOT NULL,
    reason TEXT NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    rejection_reason VARCHAR(255),
    processed_by INT,
    processed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id)
);

-- 14. Audit Logs table
CREATE TABLE audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    user_role VARCHAR(50),
    action VARCHAR(100) NOT NULL,
    target_type VARCHAR(50),
    target_id INT,
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 15. Notifications table
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    type VARCHAR(50),
    title VARCHAR(150),
    message TEXT,
    link VARCHAR(255),
    is_read TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 16. Discounts table
CREATE TABLE discounts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    discount_percentage DECIMAL(5,2) NOT NULL,
    discount_type ENUM('food','room','desk','all') NOT NULL,
    target_category VARCHAR(100) DEFAULT NULL,
    target_item_id INT NULL,
    target_item_name VARCHAR(150) NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    start_time TIME DEFAULT '00:00:00',
    end_time TIME DEFAULT '23:59:59',
    is_active TINYINT(1) DEFAULT 1,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- 17. Delete approval requests table
CREATE TABLE delete_approval_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    target_user_id INT NOT NULL,
    requested_by INT NOT NULL,
    reason TEXT,
    status ENUM('pending','approved','rejected') DEFAULT 'pending',
    processed_by INT DEFAULT NULL,
    processed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (target_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (requested_by) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (processed_by) REFERENCES users(id) ON DELETE SET NULL
);

-- 18. Customer reports table (customer -> manager)
CREATE TABLE customer_reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NULL,
    user_id INT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'open',
    manager_response TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 19. Bank accounts table (hotel & customer digital accounts)
CREATE TABLE bank_accounts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    owner_type ENUM('hotel', 'customer') NOT NULL,
    customer_id INT NULL,
    bank_name VARCHAR(100) NOT NULL,
    bank_code VARCHAR(50) NULL,
    account_number VARCHAR(50) NOT NULL,
    account_username VARCHAR(100) NOT NULL,
    account_holder_name VARCHAR(150) NOT NULL,
    balance DECIMAL(14,2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(10) DEFAULT 'ETB',
    is_active TINYINT(1) DEFAULT 1,
    is_primary TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_account_number_bank (bank_name, account_number),
    UNIQUE KEY uq_account_username (account_username),
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
);

-- 20. Account transactions table
CREATE TABLE account_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    from_account_id INT NOT NULL,
    to_account_id INT NOT NULL,
    amount DECIMAL(14,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'ETB',
    transaction_type ENUM('payment', 'refund', 'deposit', 'withdrawal', 'transfer') NOT NULL,
    reference_type ENUM('room', 'desk', 'food', 'refund', 'other') NULL,
    reference_id INT NULL,
    description TEXT,
    status ENUM('completed', 'failed', 'reversed') DEFAULT 'completed',
    initiated_by INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (from_account_id) REFERENCES bank_accounts(id),
    FOREIGN KEY (to_account_id) REFERENCES bank_accounts(id)
);

-- 21. Password resets table
CREATE TABLE password_resets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(255) NOT NULL,
    expires_at DATETIME NOT NULL,
    used TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 22. Email verifications table
CREATE TABLE email_verifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    otp VARCHAR(128) NOT NULL,
    purpose VARCHAR(40) NOT NULL DEFAULT 'register',
    payload TEXT NULL,
    expires_at DATETIME NOT NULL,
    used TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX (email),
    INDEX (purpose)
);

-- ============================================================
-- SEED DATA (Users, Rooms, Desks, Food Menu, Hotel Accounts)
-- ============================================================

-- Verified default users (Passwords: admin123, manager123, reception123, customer123)
INSERT INTO users (id, username, email, first_name, last_name, phone, password, role, status, page) VALUES
(1, 'admin', 'admin@paradisehotel.com', 'Admin', 'User', '0911000001', '$2a$10$M85NFtreAzab4Ug0E2w96u8tM0nF22NiLgH6lo4jVOLdXj1NQwNKG', 'admin', 'active', 'admin'),
(2, 'manager', 'manager@paradisehotel.com', 'Manager', 'User', '0911000002', '$2a$10$JWH4N5fUDnXECnMUJ8oJVuRPDo.UN1Owx1sqHCrLuP7hgkVDuTSLu', 'manager', 'active', 'manager'),
(3, 'receptionist', 'receptionist@paradisehotel.com', 'Reception', 'Staff', '0911000003', '$2a$10$r30fioU5lsJNDzuFrBwBdurU9IuwRqsiTXZlwhdMmeyC3oHMGagPO', 'receptionist', 'active', 'receptionist'),
(4, 'customer1', 'customer1@example.com', 'Abebe', 'Kebede', '0911000004', '$2a$10$0hqBYJ4QQO4.MeWyqbt11.pUa1b1ogg.5MFIecPnMUzNSQDmR5idi', 'customer', 'active', 'index'),
(5, 'customer2', 'customer2@example.com', 'Sara', 'Alemu', '0911000005', '$2a$10$DmBtPub0F0B3cy9S8ktweeV.n0QkrbYyQqLar0hScYvKuVLB3Xz6y', 'customer', 'active', 'index');

-- Seed customers
INSERT INTO customers (id, user_id, first_name, last_name, email, phone, address, country, region, zone, wereda, kebele, sex, age) VALUES
(1, 4, 'Abebe', 'Kebede', 'customer1@example.com', '0911000004', 'Addis Ababa, Bole', 'Ethiopia', 'Addis Ababa', 'Bole', 'Wereda 03', 'Kebele 05', 'Male', 29),
(2, 5, 'Sara', 'Alemu', 'customer2@example.com', '0911000005', 'Debre Markos, Central', 'Ethiopia', 'Amhara', 'East Gojjam', 'Debre Markos', 'Kebele 02', 'Female', 26);

-- Seed employees
INSERT INTO employees (user_id, full_name, position, salary, email, phone, address, status) VALUES
(1, 'Admin User', 'System Administrator', 25000.00, 'admin@paradisehotel.com', '0911000001', 'Debre Markos', 'active'),
(2, 'Manager User', 'General Operations Manager', 20000.00, 'manager@paradisehotel.com', '0911000002', 'Debre Markos', 'active'),
(3, 'Reception Staff', 'Front Desk Receptionist', 12000.00, 'receptionist@paradisehotel.com', '0911000003', 'Debre Markos', 'active');

-- Seed rooms (ETB)
INSERT INTO rooms (room_number, room_type, description, price_per_night, capacity, status, amenities) VALUES
('101', 'Single', 'Comfortable single room with city view', 1500.00, 1, 'available', 'WiFi, TV, AC, Mini Bar'),
('102', 'Single', 'Single room with beautiful garden view', 1600.00, 1, 'available', 'WiFi, TV, AC, Garden View'),
('201', 'Double', 'Spacious double room with private balcony', 2500.00, 2, 'available', 'WiFi, TV, AC, Balcony, Bathtub'),
('202', 'Double', 'Double room with stunning mountain view', 2700.00, 2, 'available', 'WiFi, TV, AC, Mountain View'),
('301', 'Suite', 'Luxury suite with separate living room and Jacuzzi', 4500.00, 4, 'available', 'WiFi, TV, AC, Living Room, Jacuzzi'),
('302', 'Twin', 'Twin bed room with two single beds', 2200.00, 2, 'available', 'WiFi, TV, AC, Twin Beds'),
('303', 'Family', 'Family room with 2 interconnected bedrooms', 4000.00, 5, 'available', 'WiFi, TV, AC, Interconnected, Mini Bar'),
('304', 'Deluxe', 'Deluxe room with panoramic views and king bed', 3500.00, 3, 'available', 'WiFi, TV, AC, Panoramic View, Bathtub');

-- Seed desks
INSERT INTO desks (desk_number, capacity, location, status, price, description) VALUES
('D01', 4, 'Main Hall - Window Section', 'available', 50.00, 'Near window with great natural light'),
('D02', 2, 'Main Hall - Center Section', 'available', 40.00, 'Cozy dining table for two in center'),
('D03', 6, 'Terrace - Outdoor Area', 'available', 70.00, 'Fresh air outdoor terrace seating'),
('D04', 4, 'VIP Lounge', 'available', 100.00, 'VIP section with premium table service'),
('D05', 8, 'Main Hall - Family Corner', 'available', 90.00, 'Large table for groups and meetings');

-- Seed food menu
INSERT INTO food_menu (item_name, category, description, price, availability, is_special) VALUES
('Ethiopian Traditional Breakfast', 'Breakfast', 'Chechebsa with honey, scrambled eggs and Ethiopian coffee', 250.00, 'available', 1),
('Continental Breakfast', 'Breakfast', 'Toasted bread, butter, jam, eggs, fresh juice and tea', 300.00, 'available', 0),
('Doro Wat Special', 'Traditional Food', 'Traditional slow-cooked spicy chicken stew with boiled egg and injera', 350.00, 'available', 1),
('Special Kitfo', 'Traditional Food', 'Minced tender beef seasoned with spiced butter (niter kibbeh) and mitmita', 400.00, 'available', 1),
('Fasting Vegetarian Platter (Beyaynetu)', 'Traditional Food', 'Assortment of shiro, lentils, cabbage, and spinach served on injera', 280.00, 'available', 0),
('Beef Tibs', 'Lunch', 'Tender sautéed beef cubes with rosemary, onions, and jalapenos', 380.00, 'available', 0),
('Spaghetti Bolognese', 'Dinner', 'Classic Italian pasta with slow-simmered minced meat sauce', 300.00, 'available', 0),
('Club Sandwich with Fries', 'Fast Food', 'Triple-decker sandwich with chicken, egg, cheese, and french fries', 260.00, 'available', 0),
('Classic Cheeseburger', 'Fast Food', 'Juicy grilled beef patty with cheddar cheese and crispy fries', 290.00, 'available', 0),
('Fresh Fruit Salad', 'Dessert', 'Seasonal Ethiopian fruits served with sweet cream', 150.00, 'available', 0),
('Fanta Orange', 'Beverage', 'Chilled orange soda (330ml)', 50.00, 'available', 0),
('Coca Cola', 'Beverage', 'Chilled classic Coca Cola (330ml)', 50.00, 'available', 0),
('Bottled Mineral Water', 'Beverage', 'Highland natural spring water (1L)', 35.00, 'available', 0),
('Authentic Jebena Buna', 'Beverage', 'Clay pot brewed Ethiopian highland coffee', 45.00, 'available', 1);

-- Seed bank accounts (Hotel CBE, Telebirr, BOA & Demo Customer Accounts)
INSERT INTO bank_accounts (owner_type, customer_id, bank_name, bank_code, account_number, account_username, account_holder_name, balance, is_primary) VALUES
('hotel', NULL, 'Commercial Bank of Ethiopia', 'CBE', '1000532238122', 'paradise_cbe', 'Paradise Hotel', 1000000.00, 1),
('hotel', NULL, 'Telebirr', 'TELEBIRR', '0920439009', 'paradise_telebirr', 'Paradise Hotel', 500000.00, 0),
('hotel', NULL, 'Bank of Abyssinia', 'BOA', '2000123456789', 'paradise_boa', 'Paradise Hotel', 250000.00, 0),
('customer', 1, 'Commercial Bank of Ethiopia', 'CBE', '1000987654321', 'Abebe Kebede', 'Abebe Kebede', 25000.00, 1),
('customer', 2, 'Telebirr', 'TELEBIRR', '0911000005', 'Sara Alemu', 'Sara Alemu', 18000.00, 1);

-- 23. Contact & Concierge messages table
CREATE TABLE IF NOT EXISTS contact_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(50) NULL,
    subject VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    category VARCHAR(50) DEFAULT 'general',
    status ENUM('pending', 'replied', 'archived') DEFAULT 'pending',
    user_id INT NULL,
    staff_reply TEXT NULL,
    replied_by INT NULL,
    replied_by_name VARCHAR(100) NULL,
    replied_by_role VARCHAR(50) NULL,
    replied_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (replied_by) REFERENCES users(id) ON DELETE SET NULL
);
