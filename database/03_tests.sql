SELECT
    p.name,
    pb.batch_number,
    it.transaction_type,
    it.quantity,
    it.quantity_before,
    it.quantity_after
FROM inventory_transactions it
JOIN products p
    ON it.product_id = p.id
JOIN product_batches pb
    ON it.batch_id = pb.id
ORDER BY p.name;