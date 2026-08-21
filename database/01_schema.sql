-- ============================================================
-- MEDICAL STORE DATABASE
-- SCHEMA V1
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;


-- ============================================================
-- ENUM TYPES
-- ============================================================

CREATE TYPE user_role AS ENUM (
    'CUSTOMER',
    'ADMIN'
);

CREATE TYPE product_status AS ENUM (
    'ACTIVE',
    'INACTIVE',
    'DRAFT'
);

CREATE TYPE product_type AS ENUM (
    'SURGICAL_DISPOSABLE',
    'SURGICAL_INSTRUMENT',
    'DIAGNOSTIC_DEVICE',
    'HOME_HEALTHCARE_DEVICE',
    'MOBILITY_SUPPORT'
);

CREATE TYPE order_status AS ENUM (
    'PENDING',
    'CONFIRMED',
    'PROCESSING',
    'PACKED',
    'SHIPPED',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'CANCELLED',
    'RETURNED',
    'REFUNDED'
);

CREATE TYPE payment_status AS ENUM (
    'PENDING',
    'SUCCESS',
    'FAILED',
    'REFUNDED'
);

CREATE TYPE payment_method AS ENUM (
    'COD',
    'UPI',
    'CARD',
    'NET_BANKING'
);

CREATE TYPE review_status AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED'
);

CREATE TYPE complaint_priority AS ENUM (
    'LOW',
    'MEDIUM',
    'HIGH',
    'URGENT'
);

CREATE TYPE complaint_status AS ENUM (
    'OPEN',
    'IN_PROGRESS',
    'WAITING_FOR_CUSTOMER',
    'RESOLVED',
    'CLOSED'
);

CREATE TYPE inventory_transaction_type AS ENUM (
    'STOCK_IN',
    'STOCK_OUT',
    'ORDER',
    'RETURN',
    'DAMAGED',
    'EXPIRED',
    'ADJUSTMENT'
);


-- ============================================================
-- USERS
-- ============================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(100) NOT NULL,

    email VARCHAR(255) NOT NULL UNIQUE,

    phone VARCHAR(20),

    password_hash TEXT NOT NULL,

    role user_role NOT NULL DEFAULT 'CUSTOMER',

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- ADDRESSES
-- ============================================================

CREATE TABLE addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL,

    name VARCHAR(100) NOT NULL,

    phone VARCHAR(20) NOT NULL,

    address_line1 VARCHAR(255) NOT NULL,

    address_line2 VARCHAR(255),

    city VARCHAR(100) NOT NULL,

    state VARCHAR(100) NOT NULL,

    pincode VARCHAR(10) NOT NULL,

    address_type VARCHAR(20) NOT NULL DEFAULT 'HOME',

    is_default BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_address_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);


-- ============================================================
-- CATEGORIES
-- ============================================================

CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(100) NOT NULL,

    slug VARCHAR(120) NOT NULL UNIQUE,

    description TEXT,

    parent_id UUID,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_category_parent
        FOREIGN KEY (parent_id)
        REFERENCES categories(id)
        ON DELETE SET NULL
);


-- ============================================================
-- BRANDS
-- ============================================================

CREATE TABLE brands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(150) NOT NULL UNIQUE,

    description TEXT,

    logo_url TEXT,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- PRODUCTS
-- ============================================================

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(255) NOT NULL,

    slug VARCHAR(280) NOT NULL UNIQUE,

    sku VARCHAR(100) NOT NULL UNIQUE,

    category_id UUID NOT NULL,

    brand_id UUID,

    product_type product_type NOT NULL,

    short_description VARCHAR(500),

    description TEXT,

    mrp NUMERIC(12,2) NOT NULL,

    selling_price NUMERIC(12,2) NOT NULL,

    manufacturer VARCHAR(255),

    country_of_origin VARCHAR(100),

    is_disposable BOOLEAN NOT NULL DEFAULT FALSE,

    is_sterile BOOLEAN,

    is_single_use BOOLEAN,

    expiry_required BOOLEAN NOT NULL DEFAULT FALSE,

    batch_tracking_required BOOLEAN NOT NULL DEFAULT FALSE,

    warranty_months INTEGER,

    reorder_level INTEGER NOT NULL DEFAULT 5,

    weight_grams INTEGER,

    status product_status NOT NULL DEFAULT 'DRAFT',

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_product_category
        FOREIGN KEY (category_id)
        REFERENCES categories(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_product_brand
        FOREIGN KEY (brand_id)
        REFERENCES brands(id)
        ON DELETE SET NULL,

    CONSTRAINT check_product_mrp
        CHECK (mrp >= 0),

    CONSTRAINT check_product_price
        CHECK (selling_price >= 0),

    CONSTRAINT check_product_price_mrp
        CHECK (selling_price <= mrp),

    CONSTRAINT check_warranty
        CHECK (
            warranty_months IS NULL
            OR warranty_months >= 0
        ),

    CONSTRAINT check_reorder_level
        CHECK (reorder_level >= 0),

    CONSTRAINT check_weight
        CHECK (
            weight_grams IS NULL
            OR weight_grams > 0
        )
);


-- ============================================================
-- PRODUCT IMAGES
-- ============================================================

CREATE TABLE product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    product_id UUID NOT NULL,

    image_url TEXT NOT NULL,

    is_primary BOOLEAN NOT NULL DEFAULT FALSE,

    display_order INTEGER NOT NULL DEFAULT 0,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_product_image_product
        FOREIGN KEY (product_id)
        REFERENCES products(id)
        ON DELETE CASCADE
);


-- ============================================================
-- PRODUCT SPECIFICATIONS
-- ============================================================

CREATE TABLE product_specifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    product_id UUID NOT NULL,

    specification_name VARCHAR(150) NOT NULL,

    specification_value TEXT NOT NULL,

    display_order INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT fk_specification_product
        FOREIGN KEY (product_id)
        REFERENCES products(id)
        ON DELETE CASCADE
);


-- ============================================================
-- PRODUCT BATCHES
-- ============================================================

CREATE TABLE product_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    product_id UUID NOT NULL,

    batch_number VARCHAR(100) NOT NULL,

    quantity INTEGER NOT NULL DEFAULT 0,

    manufacturing_date DATE,

    expiry_date DATE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_batch_product
        FOREIGN KEY (product_id)
        REFERENCES products(id)
        ON DELETE CASCADE,

    CONSTRAINT check_batch_quantity
        CHECK (quantity >= 0),

    CONSTRAINT check_batch_dates
        CHECK (
            expiry_date IS NULL
            OR manufacturing_date IS NULL
            OR expiry_date >= manufacturing_date
        ),

    CONSTRAINT unique_product_batch
        UNIQUE (product_id, batch_number)
);


-- ============================================================
-- INVENTORY TRANSACTIONS
-- ============================================================

CREATE TABLE inventory_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    product_id UUID NOT NULL,

    batch_id UUID,

    transaction_type inventory_transaction_type NOT NULL,

    quantity INTEGER NOT NULL,

    quantity_before INTEGER NOT NULL,

    quantity_after INTEGER NOT NULL,

    reference_type VARCHAR(50),

    reference_id UUID,

    created_by UUID,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_inventory_product
        FOREIGN KEY (product_id)
        REFERENCES products(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_inventory_batch
        FOREIGN KEY (batch_id)
        REFERENCES product_batches(id)
        ON DELETE SET NULL,

    CONSTRAINT fk_inventory_user
        FOREIGN KEY (created_by)
        REFERENCES users(id)
        ON DELETE SET NULL,

    CONSTRAINT check_inventory_quantity
        CHECK (quantity > 0),

    CONSTRAINT check_inventory_before
        CHECK (quantity_before >= 0),

    CONSTRAINT check_inventory_after
        CHECK (quantity_after >= 0)
);


-- ============================================================
-- ORDERS
-- ============================================================

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL,

    address_id UUID NOT NULL,

    subtotal NUMERIC(12,2) NOT NULL,

    discount NUMERIC(12,2) NOT NULL DEFAULT 0,

    shipping_fee NUMERIC(12,2) NOT NULL DEFAULT 0,

    tax NUMERIC(12,2) NOT NULL DEFAULT 0,

    total NUMERIC(12,2) NOT NULL,

    status order_status NOT NULL DEFAULT 'PENDING',

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_order_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_order_address
        FOREIGN KEY (address_id)
        REFERENCES addresses(id)
        ON DELETE RESTRICT,

    CONSTRAINT check_order_subtotal
        CHECK (subtotal >= 0),

    CONSTRAINT check_order_discount
        CHECK (discount >= 0),

    CONSTRAINT check_order_shipping
        CHECK (shipping_fee >= 0),

    CONSTRAINT check_order_tax
        CHECK (tax >= 0),

    CONSTRAINT check_order_total
        CHECK (total >= 0)
);


-- ============================================================
-- ORDER ITEMS
-- ============================================================

CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    order_id UUID NOT NULL,

    product_id UUID NOT NULL,

    batch_id UUID,

    quantity INTEGER NOT NULL,

    unit_price NUMERIC(12,2) NOT NULL,

    total_price NUMERIC(12,2) NOT NULL,

    CONSTRAINT fk_order_item_order
        FOREIGN KEY (order_id)
        REFERENCES orders(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_order_item_product
        FOREIGN KEY (product_id)
        REFERENCES products(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_order_item_batch
        FOREIGN KEY (batch_id)
        REFERENCES product_batches(id)
        ON DELETE SET NULL,

    CONSTRAINT check_order_item_quantity
        CHECK (quantity > 0),

    CONSTRAINT check_order_item_price
        CHECK (unit_price >= 0),

    CONSTRAINT check_order_item_total
        CHECK (total_price >= 0)
);


-- ============================================================
-- PAYMENTS
-- ============================================================

CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    order_id UUID NOT NULL UNIQUE,

    payment_method payment_method NOT NULL,

    transaction_id VARCHAR(255),

    amount NUMERIC(12,2) NOT NULL,

    status payment_status NOT NULL DEFAULT 'PENDING',

    paid_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_payment_order
        FOREIGN KEY (order_id)
        REFERENCES orders(id)
        ON DELETE CASCADE,

    CONSTRAINT check_payment_amount
        CHECK (amount >= 0)
);


-- ============================================================
-- ORDER STATUS HISTORY
-- ============================================================

CREATE TABLE order_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    order_id UUID NOT NULL,

    status order_status NOT NULL,

    note TEXT,

    changed_by UUID,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_status_order
        FOREIGN KEY (order_id)
        REFERENCES orders(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_status_user
        FOREIGN KEY (changed_by)
        REFERENCES users(id)
        ON DELETE SET NULL
);


-- ============================================================
-- REVIEWS
-- ============================================================

CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    product_id UUID NOT NULL,

    user_id UUID NOT NULL,

    order_id UUID NOT NULL,

    rating INTEGER NOT NULL,

    review TEXT,

    verified_purchase BOOLEAN NOT NULL DEFAULT TRUE,

    status review_status NOT NULL DEFAULT 'PENDING',

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_review_product
        FOREIGN KEY (product_id)
        REFERENCES products(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_review_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_review_order
        FOREIGN KEY (order_id)
        REFERENCES orders(id)
        ON DELETE CASCADE,

    CONSTRAINT check_review_rating
        CHECK (rating BETWEEN 1 AND 5),

    CONSTRAINT unique_user_product_review
        UNIQUE (user_id, product_id)
);


-- ============================================================
-- COMPLAINTS
-- ============================================================

CREATE TABLE complaints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL,

    order_id UUID,

    subject VARCHAR(255) NOT NULL,

    description TEXT NOT NULL,

    priority complaint_priority NOT NULL DEFAULT 'MEDIUM',

    status complaint_status NOT NULL DEFAULT 'OPEN',

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_complaint_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_complaint_order
        FOREIGN KEY (order_id)
        REFERENCES orders(id)
        ON DELETE SET NULL
);


-- ============================================================
-- WISHLISTS
-- ============================================================

CREATE TABLE wishlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL,

    product_id UUID NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_wishlist_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_wishlist_product
        FOREIGN KEY (product_id)
        REFERENCES products(id)
        ON DELETE CASCADE,

    CONSTRAINT unique_user_product_wishlist
        UNIQUE (user_id, product_id)
);


-- ============================================================
-- NOTIFICATIONS
-- ============================================================

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL,

    title VARCHAR(255) NOT NULL,

    message TEXT NOT NULL,

    type VARCHAR(50),

    is_read BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_notification_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);


-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_products_category
    ON products(category_id);

CREATE INDEX idx_products_brand
    ON products(brand_id);

CREATE INDEX idx_products_type
    ON products(product_type);

CREATE INDEX idx_products_status
    ON products(status);

CREATE INDEX idx_products_name
    ON products(name);

CREATE INDEX idx_product_batches_product
    ON product_batches(product_id);

CREATE INDEX idx_product_batches_expiry
    ON product_batches(expiry_date);

CREATE INDEX idx_inventory_product
    ON inventory_transactions(product_id);

CREATE INDEX idx_inventory_batch
    ON inventory_transactions(batch_id);

CREATE INDEX idx_orders_user
    ON orders(user_id);

CREATE INDEX idx_orders_status
    ON orders(status);

CREATE INDEX idx_orders_created_at
    ON orders(created_at);

CREATE INDEX idx_order_items_order
    ON order_items(order_id);

CREATE INDEX idx_reviews_product
    ON reviews(product_id);

CREATE INDEX idx_complaints_user
    ON complaints(user_id);

CREATE INDEX idx_complaints_status
    ON complaints(status);

CREATE INDEX idx_notifications_user
    ON notifications(user_id);

CREATE INDEX idx_notifications_unread
    ON notifications(user_id, is_read);


-- ============================================================
-- FULL TEXT SEARCH
-- ============================================================

CREATE INDEX idx_products_search
ON products
USING GIN (
    to_tsvector(
        'english',
        coalesce(name, '') || ' ' ||
        coalesce(short_description, '') || ' ' ||
        coalesce(description, '')
    )
);