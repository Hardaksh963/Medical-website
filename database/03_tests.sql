SELECT COUNT(*) AS total_products
FROM products;

SELECT
    product_type,
    COUNT(*) AS product_count
FROM products
GROUP BY product_type
ORDER BY product_type;

SELECT
    p.name,
    p.sku,
    p.product_type,
    c.name AS category
FROM products p
JOIN categories c
    ON p.category_id = c.id
ORDER BY p.product_type, p.name;

SELECT
    p.name,
    p.sku,
    b.name AS brand
FROM products p
LEFT JOIN brands b
    ON p.brand_id = b.id
ORDER BY p.name;

SELECT
    p.name,
    p.sku,
    COUNT(ps.id) AS specification_count
FROM products p
LEFT JOIN product_specifications ps
    ON p.id = ps.product_id
GROUP BY p.id, p.name, p.sku
ORDER BY p.name;

SELECT
    p.name,
    p.sku,
    COALESCE(SUM(pb.quantity), 0) AS stock
FROM products p
LEFT JOIN product_batches pb
    ON p.id = pb.product_id
GROUP BY p.id, p.name, p.sku
ORDER BY p.name;

SELECT
    p.name,
    p.sku,
    COALESCE(SUM(pb.quantity), 0) AS stock
FROM products p
LEFT JOIN product_batches pb
    ON p.id = pb.product_id
GROUP BY p.id, p.name, p.sku
ORDER BY p.name;

SELECT COUNT(*) AS orphan_products
FROM products p
LEFT JOIN categories c
    ON p.category_id = c.id
WHERE c.id IS NULL;

SELECT COUNT(*) AS orphan_specifications
FROM product_specifications ps
LEFT JOIN products p
    ON ps.product_id = p.id
WHERE p.id IS NULL;

SELECT COUNT(*) AS orphan_batches
FROM product_batches pb
LEFT JOIN products p
    ON pb.product_id = p.id
WHERE p.id IS NULL;

SELECT
    p.name,
    SUM(pb.quantity) AS batch_stock,
    COALESCE(
        (
            SELECT it.quantity_after
            FROM inventory_transactions it
            WHERE it.product_id = p.id
            ORDER BY it.created_at DESC
            LIMIT 1
        ),
        0
    ) AS transaction_stock
FROM products p
LEFT JOIN product_batches pb
    ON pb.product_id = p.id
GROUP BY p.id, p.name
ORDER BY p.name;

SELECT
    name,
    mrp,
    selling_price
FROM products
WHERE selling_price > mrp;

SELECT
    sku,
    COUNT(*)
FROM products
GROUP BY sku
HAVING COUNT(*) > 1;

SELECT
    slug,
    COUNT(*)
FROM products
GROUP BY slug
HAVING COUNT(*) > 1;

SELECT
    p.name,
    pb.batch_number,
    pb.manufacturing_date,
    pb.expiry_date
FROM products p
JOIN product_batches pb
    ON p.id = pb.product_id
WHERE p.expiry_required = TRUE
AND pb.expiry_date IS NULL;