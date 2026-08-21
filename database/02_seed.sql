-- ============================================================
-- MEDICAL STORE SEED DATA
-- ============================================================

BEGIN;


-- ============================================================
-- USERS
-- ============================================================

INSERT INTO users (
    name,
    email,
    phone,
    password_hash,
    role
)
VALUES
(
    'Admin User',
    'admin@medicalstore.test',
    '9999999999',
    '$2b$12$DEMO_HASH_REPLACE_IN_APPLICATION',
    'ADMIN'
),
(
    'Rahul Sharma',
    'rahul@example.com',
    '9876543210',
    '$2b$12$DEMO_HASH_REPLACE_IN_APPLICATION',
    'CUSTOMER'
),
(
    'Priya Singh',
    'priya@example.com',
    '9876543211',
    '$2b$12$DEMO_HASH_REPLACE_IN_APPLICATION',
    'CUSTOMER'
);


-- ============================================================
-- CATEGORIES
-- ============================================================

INSERT INTO categories (
    name,
    slug,
    description
)
VALUES
(
    'Surgical & Wound Care',
    'surgical-wound-care',
    'Surgical and wound care products.'
),
(
    'Diagnostic & Monitoring',
    'diagnostic-monitoring',
    'Devices used for health monitoring and basic diagnostics.'
),
(
    'Home Healthcare',
    'home-healthcare',
    'Healthcare equipment designed for home use.'
),
(
    'Mobility & Support',
    'mobility-support',
    'Mobility aids and physical support products.'
);


-- ============================================================
-- SUBCATEGORIES
-- ============================================================

INSERT INTO categories (
    name,
    slug,
    description,
    parent_id
)
SELECT
    'Surgical Disposables',
    'surgical-disposables',
    'Disposable surgical and clinical supplies.',
    id
FROM categories
WHERE slug = 'surgical-wound-care';

INSERT INTO categories (
    name,
    slug,
    description,
    parent_id
)
SELECT
    'Surgical Instruments',
    'surgical-instruments',
    'Reusable and disposable surgical instruments.',
    id
FROM categories
WHERE slug = 'surgical-wound-care';

INSERT INTO categories (
    name,
    slug,
    description,
    parent_id
)
SELECT
    'Blood Pressure Monitors',
    'blood-pressure-monitors',
    'Blood pressure monitoring devices.',
    id
FROM categories
WHERE slug = 'diagnostic-monitoring';

INSERT INTO categories (
    name,
    slug,
    description,
    parent_id
)
SELECT
    'Pulse Oximeters',
    'pulse-oximeters',
    'Devices for measuring oxygen saturation and pulse rate.',
    id
FROM categories
WHERE slug = 'diagnostic-monitoring';

INSERT INTO categories (
    name,
    slug,
    description,
    parent_id
)
SELECT
    'Thermometers',
    'thermometers',
    'Digital temperature measurement devices.',
    id
FROM categories
WHERE slug = 'diagnostic-monitoring';

INSERT INTO categories (
    name,
    slug,
    description,
    parent_id
)
SELECT
    'Nebulizers',
    'nebulizers',
    'Nebulizer equipment for home healthcare.',
    id
FROM categories
WHERE slug = 'home-healthcare';

INSERT INTO categories (
    name,
    slug,
    description,
    parent_id
)
SELECT
    'Orthopedic Supports',
    'orthopedic-supports',
    'Supports and braces for mobility and physical support.',
    id
FROM categories
WHERE slug = 'mobility-support';

INSERT INTO categories (
    name,
    slug,
    description,
    parent_id
)
SELECT
    'Walking Aids',
    'walking-aids',
    'Walking sticks and related mobility aids.',
    id
FROM categories
WHERE slug = 'mobility-support';


-- ============================================================
-- BRANDS
-- ============================================================

INSERT INTO brands (
    name,
    description
)
VALUES
(
    'MedCare Example',
    'Example brand used for development and demonstration.'
),
(
    'HealthPro Example',
    'Example healthcare brand used for development.'
),
(
    'SurgiTech Example',
    'Example surgical equipment brand.'
),
(
    'HomeMed Example',
    'Example home healthcare brand.'
),
(
    'MoveWell Example',
    'Example mobility support brand.'
);


-- ============================================================
-- PRODUCTS
-- ============================================================

-- 1
INSERT INTO products (
    name, slug, sku,
    category_id, brand_id, product_type,
    short_description, description,
    mrp, selling_price,
    manufacturer, country_of_origin,
    is_disposable, is_sterile, is_single_use,
    expiry_required, batch_tracking_required,
    warranty_months, reorder_level, weight_grams,
    status
)
SELECT
    'Sterile Surgical Gloves',
    'sterile-surgical-gloves',
    'SG-001',
    c.id,
    b.id,
    'SURGICAL_DISPOSABLE',
    'Sterile single-use surgical gloves.',
    'Development sample product representing sterile disposable surgical gloves.',
    850.00,
    699.00,
    'MedCare Example',
    'India',
    TRUE,
    TRUE,
    TRUE,
    TRUE,
    TRUE,
    NULL,
    20,
    700,
    'ACTIVE'
FROM categories c, brands b
WHERE c.slug = 'surgical-disposables'
AND b.name = 'MedCare Example';


-- 2
INSERT INTO products (
    name, slug, sku,
    category_id, brand_id, product_type,
    short_description, description,
    mrp, selling_price,
    manufacturer, country_of_origin,
    is_disposable, is_sterile, is_single_use,
    expiry_required, batch_tracking_required,
    warranty_months, reorder_level, weight_grams,
    status
)
SELECT
    'Disposable Examination Gloves',
    'disposable-examination-gloves',
    'EG-001',
    c.id,
    b.id,
    'SURGICAL_DISPOSABLE',
    'Disposable nitrile examination gloves.',
    'Development sample product representing disposable nitrile examination gloves.',
    550.00,
    449.00,
    'HealthPro Example',
    'India',
    TRUE,
    FALSE,
    TRUE,
    TRUE,
    TRUE,
    NULL,
    30,
    650,
    'ACTIVE'
FROM categories c, brands b
WHERE c.slug = 'surgical-disposables'
AND b.name = 'HealthPro Example';


-- 3
INSERT INTO products (
    name, slug, sku,
    category_id, brand_id, product_type,
    short_description, description,
    mrp, selling_price,
    manufacturer, country_of_origin,
    is_disposable, is_sterile, is_single_use,
    expiry_required, batch_tracking_required,
    reorder_level, weight_grams,
    status
)
SELECT
    'Sterile Gauze Swabs',
    'sterile-gauze-swabs',
    'GS-001',
    c.id,
    b.id,
    'SURGICAL_DISPOSABLE',
    'Sterile disposable gauze swabs.',
    'Development sample product representing sterile gauze swabs.',
    350.00,
    299.00,
    'MedCare Example',
    'India',
    TRUE,
    TRUE,
    TRUE,
    TRUE,
    TRUE,
    25,
    500,
    'ACTIVE'
FROM categories c, brands b
WHERE c.slug = 'surgical-disposables'
AND b.name = 'MedCare Example';


-- 4
INSERT INTO products (
    name, slug, sku,
    category_id, brand_id, product_type,
    short_description, description,
    mrp, selling_price,
    manufacturer, country_of_origin,
    is_disposable, is_sterile, is_single_use,
    expiry_required, batch_tracking_required,
    reorder_level, weight_grams,
    status
)
SELECT
    'Disposable Surgical Masks',
    'disposable-surgical-masks',
    'SM-001',
    c.id,
    b.id,
    'SURGICAL_DISPOSABLE',
    'Disposable non-woven surgical masks.',
    'Development sample product representing disposable surgical masks.',
    300.00,
    249.00,
    'HealthPro Example',
    'India',
    TRUE,
    FALSE,
    TRUE,
    TRUE,
    TRUE,
    30,
    450,
    'ACTIVE'
FROM categories c, brands b
WHERE c.slug = 'surgical-disposables'
AND b.name = 'HealthPro Example';


-- 5
INSERT INTO products (
    name, slug, sku,
    category_id, brand_id, product_type,
    short_description, description,
    mrp, selling_price,
    manufacturer, country_of_origin,
    is_disposable, is_sterile,
    expiry_required, batch_tracking_required,
    warranty_months, reorder_level, weight_grams,
    status
)
SELECT
    'Stainless Steel Surgical Forceps',
    'stainless-steel-surgical-forceps',
    'SF-001',
    c.id,
    b.id,
    'SURGICAL_INSTRUMENT',
    'Reusable stainless steel surgical forceps.',
    'Development sample reusable surgical instrument.',
    1200.00,
    999.00,
    'SurgiTech Example',
    'India',
    FALSE,
    FALSE,
    FALSE,
    TRUE,
    12,
    10,
    120,
    'ACTIVE'
FROM categories c, brands b
WHERE c.slug = 'surgical-instruments'
AND b.name = 'SurgiTech Example';


-- 6
INSERT INTO products (
    name, slug, sku,
    category_id, brand_id, product_type,
    short_description, description,
    mrp, selling_price,
    manufacturer, country_of_origin,
    warranty_months, reorder_level, weight_grams,
    status
)
SELECT
    'Surgical Scissors',
    'surgical-scissors',
    'SS-001',
    c.id,
    b.id,
    'SURGICAL_INSTRUMENT',
    'Reusable stainless steel surgical scissors.',
    'Development sample reusable surgical scissors.',
    1400.00,
    1150.00,
    'SurgiTech Example',
    'India',
    12,
    10,
    150,
    'ACTIVE'
FROM categories c, brands b
WHERE c.slug = 'surgical-instruments'
AND b.name = 'SurgiTech Example';


-- 7
INSERT INTO products (
    name, slug, sku,
    category_id, brand_id, product_type,
    short_description, description,
    mrp, selling_price,
    manufacturer, country_of_origin,
    warranty_months, reorder_level, weight_grams,
    status
)
SELECT
    'Stainless Steel Scalpel Handle',
    'stainless-steel-scalpel-handle',
    'SH-001',
    c.id,
    b.id,
    'SURGICAL_INSTRUMENT',
    'Reusable stainless steel scalpel handle.',
    'Development sample reusable surgical scalpel handle.',
    900.00,
    749.00,
    'SurgiTech Example',
    'India',
    12,
    10,
    90,
    'ACTIVE'
FROM categories c, brands b
WHERE c.slug = 'surgical-instruments'
AND b.name = 'SurgiTech Example';


-- 8
INSERT INTO products (
    name, slug, sku,
    category_id, brand_id, product_type,
    short_description, description,
    mrp, selling_price,
    manufacturer, country_of_origin,
    warranty_months, reorder_level, weight_grams,
    status
)
SELECT
    'Digital Blood Pressure Monitor',
    'digital-blood-pressure-monitor',
    'BP-001',
    c.id,
    b.id,
    'DIAGNOSTIC_DEVICE',
    'Automatic digital blood pressure monitor.',
    'Development sample digital blood pressure monitoring device.',
    2499.00,
    1999.00,
    'HealthPro Example',
    'India',
    24,
    10,
    450,
    'ACTIVE'
FROM categories c, brands b
WHERE c.slug = 'blood-pressure-monitors'
AND b.name = 'HealthPro Example';


-- 9
INSERT INTO products (
    name, slug, sku,
    category_id, brand_id, product_type,
    short_description, description,
    mrp, selling_price,
    manufacturer, country_of_origin,
    warranty_months, reorder_level, weight_grams,
    status
)
SELECT
    'Fingertip Pulse Oximeter',
    'fingertip-pulse-oximeter',
    'OX-001',
    c.id,
    b.id,
    'DIAGNOSTIC_DEVICE',
    'Portable fingertip pulse oximeter.',
    'Development sample pulse oximeter for oxygen saturation and pulse-rate measurement.',
    1199.00,
    899.00,
    'HealthPro Example',
    'India',
    12,
    10,
    55,
    'ACTIVE'
FROM categories c, brands b
WHERE c.slug = 'pulse-oximeters'
AND b.name = 'HealthPro Example';


-- 10
INSERT INTO products (
    name, slug, sku,
    category_id, brand_id, product_type,
    short_description, description,
    mrp, selling_price,
    manufacturer, country_of_origin,
    warranty_months, reorder_level, weight_grams,
    status
)
SELECT
    'Digital Thermometer',
    'digital-thermometer',
    'TH-001',
    c.id,
    b.id,
    'DIAGNOSTIC_DEVICE',
    'Digital body temperature thermometer.',
    'Development sample digital thermometer.',
    399.00,
    299.00,
    'HealthPro Example',
    'India',
    12,
    20,
    35,
    'ACTIVE'
FROM categories c, brands b
WHERE c.slug = 'thermometers'
AND b.name = 'HealthPro Example';


-- 11
INSERT INTO products (
    name, slug, sku,
    category_id, brand_id, product_type,
    short_description, description,
    mrp, selling_price,
    manufacturer, country_of_origin,
    warranty_months, reorder_level, weight_grams,
    status
)
SELECT
    'Blood Glucose Meter',
    'blood-glucose-meter',
    'GM-001',
    c.id,
    b.id,
    'DIAGNOSTIC_DEVICE',
    'Portable blood glucose monitoring device.',
    'Development sample blood glucose meter.',
    1499.00,
    1199.00,
    'HealthPro Example',
    'India',
    12,
    10,
    70,
    'ACTIVE'
FROM categories c, brands b
WHERE c.slug = 'diagnostic-monitoring'
AND b.name = 'HealthPro Example';


-- 12
INSERT INTO products (
    name, slug, sku,
    category_id, brand_id, product_type,
    short_description, description,
    mrp, selling_price,
    manufacturer, country_of_origin,
    warranty_months, reorder_level, weight_grams,
    status
)
SELECT
    'Compressor Nebulizer',
    'compressor-nebulizer',
    'NB-001',
    c.id,
    b.id,
    'HOME_HEALTHCARE_DEVICE',
    'Home-use compressor nebulizer.',
    'Development sample compressor nebulizer for home healthcare.',
    1999.00,
    1599.00,
    'HomeMed Example',
    'India',
    12,
    10,
    1300,
    'ACTIVE'
FROM categories c, brands b
WHERE c.slug = 'nebulizers'
AND b.name = 'HomeMed Example';


-- 13
INSERT INTO products (
    name, slug, sku,
    category_id, brand_id, product_type,
    short_description, description,
    mrp, selling_price,
    manufacturer, country_of_origin,
    warranty_months, reorder_level, weight_grams,
    status
)
SELECT
    'Digital Medical Weighing Scale',
    'digital-medical-weighing-scale',
    'WS-001',
    c.id,
    b.id,
    'HOME_HEALTHCARE_DEVICE',
    'Digital weighing scale for home health monitoring.',
    'Development sample digital weighing scale.',
    1799.00,
    1399.00,
    'HomeMed Example',
    'India',
    12,
    10,
    1800,
    'ACTIVE'
FROM categories c, brands b
WHERE c.slug = 'home-healthcare'
AND b.name = 'HomeMed Example';


-- 14
INSERT INTO products (
    name, slug, sku,
    category_id, brand_id, product_type,
    short_description, description,
    mrp, selling_price,
    manufacturer, country_of_origin,
    warranty_months, reorder_level, weight_grams,
    status
)
SELECT
    'Adjustable Knee Support',
    'adjustable-knee-support',
    'KS-001',
    c.id,
    b.id,
    'MOBILITY_SUPPORT',
    'Adjustable knee support brace.',
    'Development sample adjustable knee support.',
    999.00,
    799.00,
    'MoveWell Example',
    'India',
    6,
    15,
    180,
    'ACTIVE'
FROM categories c, brands b
WHERE c.slug = 'orthopedic-supports'
AND b.name = 'MoveWell Example';


-- 15
INSERT INTO products (
    name, slug, sku,
    category_id, brand_id, product_type,
    short_description, description,
    mrp, selling_price,
    manufacturer, country_of_origin,
    warranty_months, reorder_level, weight_grams,
    status
)
SELECT
    'Folding Walking Stick',
    'folding-walking-stick',
    'WS-002',
    c.id,
    b.id,
    'MOBILITY_SUPPORT',
    'Adjustable folding walking stick.',
    'Development sample folding walking stick with adjustable height.',
    899.00,
    699.00,
    'MoveWell Example',
    'India',
    6,
    10,
    350,
    'ACTIVE'
FROM categories c, brands b
WHERE c.slug = 'walking-aids'
AND b.name = 'MoveWell Example';


-- ============================================================
-- PRODUCT SPECIFICATIONS
-- ============================================================

-- Surgical gloves
INSERT INTO product_specifications
(product_id, specification_name, specification_value)
SELECT id, 'Material', 'Latex'
FROM products WHERE sku = 'SG-001';

INSERT INTO product_specifications
SELECT gen_random_uuid(), id, 'Size', '7.5', 2
FROM products WHERE sku = 'SG-001';

INSERT INTO product_specifications
SELECT gen_random_uuid(), id, 'Pack Quantity', '50 pairs', 3
FROM products WHERE sku = 'SG-001';

INSERT INTO product_specifications
SELECT gen_random_uuid(), id, 'Sterile', 'Yes', 4
FROM products WHERE sku = 'SG-001';


-- Examination gloves
INSERT INTO product_specifications
SELECT gen_random_uuid(), id, 'Material', 'Nitrile', 1
FROM products WHERE sku = 'EG-001';

INSERT INTO product_specifications
SELECT gen_random_uuid(), id, 'Size', 'Medium', 2
FROM products WHERE sku = 'EG-001';

INSERT INTO product_specifications
SELECT gen_random_uuid(), id, 'Latex Free', 'Yes', 3
FROM products WHERE sku = 'EG-001';

INSERT INTO product_specifications
SELECT gen_random_uuid(), id, 'Pack Quantity', '100 pieces', 4
FROM products WHERE sku = 'EG-001';


-- Gauze
INSERT INTO product_specifications
SELECT gen_random_uuid(), id, 'Material', 'Cotton', 1
FROM products WHERE sku = 'GS-001';

INSERT INTO product_specifications
SELECT gen_random_uuid(), id, 'Size', '10 x 10 cm', 2
FROM products WHERE sku = 'GS-001';

INSERT INTO product_specifications
SELECT gen_random_uuid(), id, 'Pack Quantity', '100 pieces', 3
FROM products WHERE sku = 'GS-001';


-- Masks
INSERT INTO product_specifications
SELECT gen_random_uuid(), id, 'Material', 'Non-woven fabric', 1
FROM products WHERE sku = 'SM-001';

INSERT INTO product_specifications
SELECT gen_random_uuid(), id, 'Pack Quantity', '50 pieces', 2
FROM products WHERE sku = 'SM-001';


-- Forceps
INSERT INTO product_specifications
SELECT gen_random_uuid(), id, 'Material', 'Stainless Steel', 1
FROM products WHERE sku = 'SF-001';

INSERT INTO product_specifications
SELECT gen_random_uuid(), id, 'Length', '16 cm', 2
FROM products WHERE sku = 'SF-001';

INSERT INTO product_specifications
SELECT gen_random_uuid(), id, 'Reusable', 'Yes', 3
FROM products WHERE sku = 'SF-001';

INSERT INTO product_specifications
SELECT gen_random_uuid(), id, 'Autoclavable', 'Yes', 4
FROM products WHERE sku = 'SF-001';


-- Scissors
INSERT INTO product_specifications
SELECT gen_random_uuid(), id, 'Material', 'Stainless Steel', 1
FROM products WHERE sku = 'SS-001';

INSERT INTO product_specifications
SELECT gen_random_uuid(), id, 'Length', '14 cm', 2
FROM products WHERE sku = 'SS-001';

INSERT INTO product_specifications
SELECT gen_random_uuid(), id, 'Type', 'Straight', 3
FROM products WHERE sku = 'SS-001';

INSERT INTO product_specifications
SELECT gen_random_uuid(), id, 'Autoclavable', 'Yes', 4
FROM products WHERE sku = 'SS-001';


-- Scalpel handle
INSERT INTO product_specifications
SELECT gen_random_uuid(), id, 'Material', 'Stainless Steel', 1
FROM products WHERE sku = 'SH-001';

INSERT INTO product_specifications
SELECT gen_random_uuid(), id, 'Handle Type', 'No. 3', 2
FROM products WHERE sku = 'SH-001';

INSERT INTO product_specifications
SELECT gen_random_uuid(), id, 'Autoclavable', 'Yes', 3
FROM products WHERE sku = 'SH-001';


-- BP monitor
INSERT INTO product_specifications
SELECT gen_random_uuid(), id, 'Measurement Range', '0-299 mmHg', 1
FROM products WHERE sku = 'BP-001';

INSERT INTO product_specifications
SELECT gen_random_uuid(), id, 'Accuracy', '±3 mmHg', 2
FROM products WHERE sku = 'BP-001';

INSERT INTO product_specifications
SELECT gen_random_uuid(), id, 'Display', 'LCD', 3
FROM products WHERE sku = 'BP-001';

INSERT INTO product_specifications
SELECT gen_random_uuid(), id, 'Power Source', '4 x AA Batteries', 4
FROM products WHERE sku = 'BP-001';

INSERT INTO product_specifications
SELECT gen_random_uuid(), id, 'Memory', '120 readings', 5
FROM products WHERE sku = 'BP-001';


-- Pulse oximeter
INSERT INTO product_specifications
SELECT gen_random_uuid(), id, 'Measurement', 'SpO2 and Pulse Rate', 1
FROM products WHERE sku = 'OX-001';

INSERT INTO product_specifications
SELECT gen_random_uuid(), id, 'Display', 'LED', 2
FROM products WHERE sku = 'OX-001';

INSERT INTO product_specifications
SELECT gen_random_uuid(), id, 'Power Source', '2 x AAA Batteries', 3
FROM products WHERE sku = 'OX-001';


-- Thermometer
INSERT INTO product_specifications
SELECT gen_random_uuid(), id, 'Measurement', 'Body Temperature', 1
FROM products WHERE sku = 'TH-001';

INSERT INTO product_specifications
SELECT gen_random_uuid(), id, 'Range', '32-42°C', 2
FROM products WHERE sku = 'TH-001';

INSERT INTO product_specifications
SELECT gen_random_uuid(), id, 'Display', 'LCD', 3
FROM products WHERE sku = 'TH-001';


-- Glucose meter
INSERT INTO product_specifications
SELECT gen_random_uuid(), id, 'Measurement', 'Blood Glucose', 1
FROM products WHERE sku = 'GM-001';

INSERT INTO product_specifications
SELECT gen_random_uuid(), id, 'Sample Type', 'Capillary Blood', 2
FROM products WHERE sku = 'GM-001';

INSERT INTO product_specifications
SELECT gen_random_uuid(), id, 'Memory', '300 readings', 3
FROM products WHERE sku = 'GM-001';


-- Nebulizer
INSERT INTO product_specifications
SELECT gen_random_uuid(), id, 'Function', 'Nebulization', 1
FROM products WHERE sku = 'NB-001';

INSERT INTO product_specifications
SELECT gen_random_uuid(), id, 'Power Source', 'AC', 2
FROM products WHERE sku = 'NB-001';

INSERT INTO product_specifications
SELECT gen_random_uuid(), id, 'Noise Level', '<60 dB', 3
FROM products WHERE sku = 'NB-001';

INSERT INTO product_specifications
SELECT gen_random_uuid(), id, 'Accessories', 'Mask, Mouthpiece, Tubing', 4
FROM products WHERE sku = 'NB-001';


-- Medical scale
INSERT INTO product_specifications
SELECT gen_random_uuid(), id, 'Capacity', '180 kg', 1
FROM products WHERE sku = 'WS-001';

INSERT INTO product_specifications
SELECT gen_random_uuid(), id, 'Display', 'LCD', 2
FROM products WHERE sku = 'WS-001';

INSERT INTO product_specifications
SELECT gen_random_uuid(), id, 'Power Source', 'Battery', 3
FROM products WHERE sku = 'WS-001';


-- Knee support
INSERT INTO product_specifications
SELECT gen_random_uuid(), id, 'Material', 'Neoprene', 1
FROM products WHERE sku = 'KS-001';

INSERT INTO product_specifications
SELECT gen_random_uuid(), id, 'Size', 'Medium', 2
FROM products WHERE sku = 'KS-001';

INSERT INTO product_specifications
SELECT gen_random_uuid(), id, 'Adjustable', 'Yes', 3
FROM products WHERE sku = 'KS-001';

INSERT INTO product_specifications
SELECT gen_random_uuid(), id, 'Support Type', 'Knee Support', 4
FROM products WHERE sku = 'KS-001';


-- Walking stick
INSERT INTO product_specifications
SELECT gen_random_uuid(), id, 'Material', 'Aluminium', 1
FROM products WHERE sku = 'WS-002';

INSERT INTO product_specifications
SELECT gen_random_uuid(), id, 'Height', 'Adjustable', 2
FROM products WHERE sku = 'WS-002';

INSERT INTO product_specifications
SELECT gen_random_uuid(), id, 'Weight Capacity', '100 kg', 3
FROM products WHERE sku = 'WS-002';

INSERT INTO product_specifications
SELECT gen_random_uuid(), id, 'Folding', 'Yes', 4
FROM products WHERE sku = 'WS-002';

INSERT INTO product_specifications
SELECT gen_random_uuid(), id, 'Handle Type', 'Ergonomic', 5
FROM products WHERE sku = 'WS-002';


-- ============================================================
-- BATCHES
-- ============================================================

-- Disposable products
INSERT INTO product_batches (
    product_id,
    batch_number,
    quantity,
    manufacturing_date,
    expiry_date
)
SELECT id, 'SG-DEMO-001', 100, '2026-01-15', '2028-01-15'
FROM products WHERE sku = 'SG-001';

INSERT INTO product_batches (
    product_id,
    batch_number,
    quantity,
    manufacturing_date,
    expiry_date
)
SELECT id, 'EG-DEMO-001', 150, '2026-02-01', '2028-02-01'
FROM products WHERE sku = 'EG-001';

INSERT INTO product_batches (
    product_id,
    batch_number,
    quantity,
    manufacturing_date,
    expiry_date
)
SELECT id, 'GS-DEMO-001', 80, '2026-02-15', '2028-02-15'
FROM products WHERE sku = 'GS-001';

INSERT INTO product_batches (
    product_id,
    batch_number,
    quantity,
    manufacturing_date,
    expiry_date
)
SELECT id, 'SM-DEMO-001', 200, '2026-03-01', '2028-03-01'
FROM products WHERE sku = 'SM-001';


-- Instruments
INSERT INTO product_batches (
    product_id,
    batch_number,
    quantity
)
SELECT id, 'SF-DEMO-001', 30
FROM products WHERE sku = 'SF-001';

INSERT INTO product_batches (
    product_id,
    batch_number,
    quantity
)
SELECT id, 'SS-DEMO-001', 25
FROM products WHERE sku = 'SS-001';

INSERT INTO product_batches (
    product_id,
    batch_number,
    quantity
)
SELECT id, 'SH-DEMO-001', 40
FROM products WHERE sku = 'SH-001';


-- Diagnostic devices
INSERT INTO product_batches (
    product_id,
    batch_number,
    quantity
)
SELECT id, 'BP-DEMO-001', 25
FROM products WHERE sku = 'BP-001';

INSERT INTO product_batches (
    product_id,
    batch_number,
    quantity
)
SELECT id, 'OX-DEMO-001', 40
FROM products WHERE sku = 'OX-001';

INSERT INTO product_batches (
    product_id,
    batch_number,
    quantity
)
SELECT id, 'TH-DEMO-001', 60
FROM products WHERE sku = 'TH-001';

INSERT INTO product_batches (
    product_id,
    batch_number,
    quantity
)
SELECT id, 'GM-DEMO-001', 35
FROM products WHERE sku = 'GM-001';


-- Home healthcare
INSERT INTO product_batches (
    product_id,
    batch_number,
    quantity
)
SELECT id, 'NB-DEMO-001', 20
FROM products WHERE sku = 'NB-001';

INSERT INTO product_batches (
    product_id,
    batch_number,
    quantity
)
SELECT id, 'WS-DEMO-001', 15
FROM products WHERE sku = 'WS-001';


-- Mobility
INSERT INTO product_batches (
    product_id,
    batch_number,
    quantity
)
SELECT id, 'KS-DEMO-001', 25
FROM products WHERE sku = 'KS-001';

INSERT INTO product_batches (
    product_id,
    batch_number,
    quantity
)
SELECT id, 'WA-DEMO-001', 30
FROM products WHERE sku = 'WS-002';


-- ============================================================
-- INVENTORY TRANSACTIONS
-- ============================================================

INSERT INTO inventory_transactions (
    product_id,
    batch_id,
    transaction_type,
    quantity,
    quantity_before,
    quantity_after,
    reference_type
)
SELECT
    p.id,
    b.id,
    'STOCK_IN',
    b.quantity,
    0,
    b.quantity,
    'INITIAL_SEED'
FROM products p
JOIN product_batches b
    ON b.product_id = p.id;


COMMIT;