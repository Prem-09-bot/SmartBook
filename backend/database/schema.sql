
USE smartbook_db;

-- ==========================================
-- 1. USERS
-- Customers and administrators
-- ==========================================

CREATE TABLE IF NOT EXISTS users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role ENUM('customer', 'admin') NOT NULL DEFAULT 'customer',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;


-- ==========================================
-- 2. CATEGORIES
-- ==========================================

CREATE TABLE IF NOT EXISTS categories (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(120) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;


-- ==========================================
-- 3. BOOKS
-- ==========================================

CREATE TABLE IF NOT EXISTS books (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    slug VARCHAR(180) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(180) NOT NULL,
    category_id BIGINT UNSIGNED,
    price DECIMAL(10,2) NOT NULL,
    original_price DECIMAL(10,2),
    rating DECIMAL(3,2) NOT NULL DEFAULT 0,
    review_count INT UNSIGNED NOT NULL DEFAULT 0,
    badge VARCHAR(80),
    cover_color VARCHAR(20),
    cover_accent VARCHAR(20),
    cover_text VARCHAR(255),
    cover_image_url VARCHAR(500),
    description TEXT,
    pages INT UNSIGNED,
    language VARCHAR(80) DEFAULT 'English',
    isbn VARCHAR(20) UNIQUE,
    stock_quantity INT UNSIGNED NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_books_category
        FOREIGN KEY (category_id)
        REFERENCES categories(id)
        ON DELETE SET NULL,

    CONSTRAINT chk_book_price CHECK (price >= 0),
    CONSTRAINT chk_book_original_price
        CHECK (original_price IS NULL OR original_price >= price),
    CONSTRAINT chk_book_rating CHECK (rating BETWEEN 0 AND 5),

    INDEX idx_books_title (title),
    INDEX idx_books_author (author),
    INDEX idx_books_category (category_id),
    INDEX idx_books_active (is_active)
) ENGINE=InnoDB;


-- ==========================================
-- 4. ADDRESSES
-- ==========================================

CREATE TABLE IF NOT EXISTS addresses (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(15) NOT NULL,
    country VARCHAR(100) NOT NULL DEFAULT 'India',
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_addresses_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE,

    INDEX idx_addresses_user (user_id)
) ENGINE=InnoDB;


-- ==========================================
-- 5. CARTS
-- ==========================================

CREATE TABLE IF NOT EXISTS carts (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_carts_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
) ENGINE=InnoDB;


-- ==========================================
-- 6. CART ITEMS
-- ==========================================

CREATE TABLE IF NOT EXISTS cart_items (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    cart_id BIGINT UNSIGNED NOT NULL,
    book_id BIGINT UNSIGNED NOT NULL,
    quantity INT UNSIGNED NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_cart_items_cart
        FOREIGN KEY (cart_id) REFERENCES carts(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_cart_items_book
        FOREIGN KEY (book_id) REFERENCES books(id)
        ON DELETE CASCADE,

    CONSTRAINT uq_cart_book UNIQUE (cart_id, book_id),
    CONSTRAINT chk_cart_quantity CHECK (quantity > 0)
) ENGINE=InnoDB;


-- ==========================================
-- 7. WISHLISTS
-- ==========================================

CREATE TABLE IF NOT EXISTS wishlists (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_wishlists_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
) ENGINE=InnoDB;


-- ==========================================
-- 8. WISHLIST ITEMS
-- ==========================================

CREATE TABLE IF NOT EXISTS wishlist_items (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    wishlist_id BIGINT UNSIGNED NOT NULL,
    book_id BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_wishlist_items_wishlist
        FOREIGN KEY (wishlist_id) REFERENCES wishlists(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_wishlist_items_book
        FOREIGN KEY (book_id) REFERENCES books(id)
        ON DELETE CASCADE,

    CONSTRAINT uq_wishlist_book UNIQUE (wishlist_id, book_id)
) ENGINE=InnoDB;


-- ==========================================
-- 9. COUPONS
-- ==========================================

CREATE TABLE IF NOT EXISTS coupons (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    discount_type ENUM('percentage', 'fixed') NOT NULL,
    discount_value DECIMAL(10,2) NOT NULL,
    min_order DECIMAL(10,2) NOT NULL DEFAULT 0,
    max_discount DECIMAL(10,2),
    usage_limit INT UNSIGNED DEFAULT 0,
    used_count INT UNSIGNED NOT NULL DEFAULT 0,
    expiry_date DATETIME,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT chk_coupon_value CHECK (discount_value > 0),
    CONSTRAINT chk_coupon_min_order CHECK (min_order >= 0),

    INDEX idx_coupons_active (is_active),
    INDEX idx_coupons_expiry (expiry_date)
) ENGINE=InnoDB;


-- ==========================================
-- 10. ORDERS
-- ==========================================

CREATE TABLE IF NOT EXISTS orders (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_number VARCHAR(50) NOT NULL UNIQUE,
    user_id BIGINT UNSIGNED NOT NULL,
    address_id BIGINT UNSIGNED,
    coupon_id BIGINT UNSIGNED,

    subtotal DECIMAL(12,2) NOT NULL,
    discount DECIMAL(12,2) NOT NULL DEFAULT 0,
    shipping_charge DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(12,2) NOT NULL,

    payment_method ENUM('COD', 'UPI', 'CARD', 'NETBANKING')
        NOT NULL DEFAULT 'COD',

    payment_status ENUM('pending', 'paid', 'failed', 'refunded')
        NOT NULL DEFAULT 'pending',

    order_status ENUM(
        'pending',
        'processing',
        'shipped',
        'delivered',
        'cancelled'
    ) NOT NULL DEFAULT 'pending',

    shipping_name VARCHAR(150) NOT NULL,
    shipping_phone VARCHAR(20) NOT NULL,
    shipping_address TEXT NOT NULL,
    shipping_city VARCHAR(100) NOT NULL,
    shipping_state VARCHAR(100) NOT NULL,
    shipping_postal_code VARCHAR(15) NOT NULL,

    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_orders_user
        FOREIGN KEY (user_id) REFERENCES users(id),

    CONSTRAINT fk_orders_address
        FOREIGN KEY (address_id) REFERENCES addresses(id)
        ON DELETE SET NULL,

    CONSTRAINT fk_orders_coupon
        FOREIGN KEY (coupon_id) REFERENCES coupons(id)
        ON DELETE SET NULL,

    CONSTRAINT chk_order_amounts CHECK (
        subtotal >= 0 AND discount >= 0
        AND shipping_charge >= 0 AND total_amount >= 0
    ),

    INDEX idx_orders_user (user_id),
    INDEX idx_orders_status (order_status),
    INDEX idx_orders_created (created_at),
    INDEX idx_orders_payment (payment_status)
) ENGINE=InnoDB;


-- ==========================================
-- 11. ORDER ITEMS
-- ==========================================

CREATE TABLE IF NOT EXISTS order_items (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT UNSIGNED NOT NULL,
    book_id BIGINT UNSIGNED,
    book_title VARCHAR(255) NOT NULL,
    book_author VARCHAR(180),
    book_slug VARCHAR(180),
    quantity INT UNSIGNED NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_order_items_order
        FOREIGN KEY (order_id) REFERENCES orders(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_order_items_book
        FOREIGN KEY (book_id) REFERENCES books(id)
        ON DELETE SET NULL,

    CONSTRAINT chk_order_item_quantity CHECK (quantity > 0),
    CONSTRAINT chk_order_item_price CHECK (unit_price >= 0),

    INDEX idx_order_items_book (book_id)
) ENGINE=InnoDB;


-- ==========================================
-- 12. PAYMENTS
-- ==========================================

CREATE TABLE IF NOT EXISTS payments (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT UNSIGNED NOT NULL,
    payment_gateway VARCHAR(50),
    transaction_id VARCHAR(150) UNIQUE,
    gateway_order_id VARCHAR(150),
    amount DECIMAL(12,2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    status ENUM('pending', 'success', 'failed', 'refunded')
        NOT NULL DEFAULT 'pending',
    gateway_response JSON,
    paid_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_payments_order
        FOREIGN KEY (order_id) REFERENCES orders(id),

    CONSTRAINT chk_payment_amount CHECK (amount >= 0),

    INDEX idx_payments_order (order_id),
    INDEX idx_payments_status (status)
) ENGINE=InnoDB;


-- ==========================================
-- 13. COUPON USAGES
-- ==========================================

CREATE TABLE IF NOT EXISTS coupon_usages (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    coupon_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    order_id BIGINT UNSIGNED NOT NULL,
    discount_amount DECIMAL(10,2) NOT NULL,
    used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_coupon_usage_coupon
        FOREIGN KEY (coupon_id) REFERENCES coupons(id),

    CONSTRAINT fk_coupon_usage_user
        FOREIGN KEY (user_id) REFERENCES users(id),

    CONSTRAINT fk_coupon_usage_order
        FOREIGN KEY (order_id) REFERENCES orders(id),

    CONSTRAINT uq_coupon_order UNIQUE (coupon_id, order_id),

    INDEX idx_coupon_usage_user (user_id)
) ENGINE=InnoDB;


-- ==========================================
-- 14. REVIEWS
-- ==========================================

CREATE TABLE IF NOT EXISTS reviews (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    book_id BIGINT UNSIGNED NOT NULL,
    order_id BIGINT UNSIGNED,
    rating TINYINT UNSIGNED NOT NULL,
    title VARCHAR(180),
    comment TEXT,
    status ENUM('pending', 'approved', 'rejected')
        NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_reviews_user
        FOREIGN KEY (user_id) REFERENCES users(id),

    CONSTRAINT fk_reviews_book
        FOREIGN KEY (book_id) REFERENCES books(id),

    CONSTRAINT fk_reviews_order
        FOREIGN KEY (order_id) REFERENCES orders(id)
        ON DELETE SET NULL,

    CONSTRAINT chk_review_rating CHECK (rating BETWEEN 1 AND 5),

    CONSTRAINT uq_user_book_review UNIQUE (user_id, book_id),

    INDEX idx_reviews_book (book_id),
    INDEX idx_reviews_status (status)
) ENGINE=InnoDB;

