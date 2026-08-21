Yes. Now we should make this concrete enough that you can **actually build the database, product forms, product pages, and admin panel from it**.

There are two things we need to accomplish:

1. Define the **product catalog data model** for the five product types.
2. Design the **customer and admin wireframes** around that model.

One important architectural decision: **do not create five completely separate product tables.** Keep one `products` table and use `product_type` + `product_specifications` for type-specific information. The application will enforce which specifications are required for each product type.

---

# Part 1 — Actual Product Catalog Data Model

## 1. The five product types

We'll use these exact types:

```text
SURGICAL_DISPOSABLE
SURGICAL_INSTRUMENT
DIAGNOSTIC_DEVICE
HOME_HEALTHCARE_DEVICE
MOBILITY_SUPPORT
```

Your product hierarchy becomes:

```text
PRODUCT
│
├── SURGICAL_DISPOSABLE
│   ├── Gloves
│   ├── Syringes
│   ├── Needles
│   ├── Gauze
│   ├── Bandages
│   └── Masks
│
├── SURGICAL_INSTRUMENT
│   ├── Forceps
│   ├── Scissors
│   ├── Scalpel Handles
│   └── Surgical Clamps
│
├── DIAGNOSTIC_DEVICE
│   ├── BP Monitor
│   ├── Pulse Oximeter
│   ├── Thermometer
│   └── Glucose Meter
│
├── HOME_HEALTHCARE_DEVICE
│   ├── Nebulizer
│   ├── Heating Pad
│   ├── Medical Scale
│   └── First Aid Equipment
│
└── MOBILITY_SUPPORT
    ├── Knee Support
    ├── Wrist Support
    ├── Back Support
    ├── Walking Stick
    └── Walker
```

---

# 2. Common fields for every product

Every product gets these fields regardless of type.

| Field             | Required    | Purpose                               |
| ----------------- | ----------- | ------------------------------------- |
| Product name      | Yes         | Display name                          |
| SKU               | Yes         | Unique inventory identifier           |
| Category          | Yes         | Product category                      |
| Brand             | Recommended | Manufacturer/brand                    |
| Short description | Yes         | Product card                          |
| Description       | Yes         | Full product information              |
| MRP               | Yes         | Maximum retail price where applicable |
| Selling price     | Yes         | Website price                         |
| Manufacturer      | Yes         | Manufacturer                          |
| Country of origin | Recommended | Product origin                        |
| Product type      | Yes         | One of five types                     |
| Status            | Yes         | Active/Draft/Inactive                 |
| Images            | Yes         | Product images                        |
| Specifications    | Depends     | Type-specific attributes              |
| Stock             | Yes         | Available inventory                   |

---

# 3. Surgical / Disposable Products

Examples:

* Surgical gloves
* Syringes
* Needles
* Gauze
* Bandages
* Surgical masks
* Disposable gowns

### Required fields

```text
Product Name
SKU
Category
Product Type
Brand
Manufacturer
Description
MRP
Selling Price
Material
Pack Quantity
Single Use
Sterile
Stock
```

### Optional fields

```text
Size
Latex Free
Color
Length
Width
Packaging Type
Country of Origin
Sterilization Method
Shelf Life
Storage Conditions
Regulatory Information
```

### Specifications

Example for surgical gloves:

```text
Material: Latex
Sterile: Yes
Single Use: Yes
Size: 7.5
Pack Quantity: 50 pairs
Color: White
Latex Free: No
```

### Batch

**Required:** Yes for products where batch/lot traceability is applicable.

```text
Batch Number
Manufacturing Date
Expiry Date
Quantity
```

### Expiry

**Required when applicable.**

For disposable/sterile products, the application should be able to mark:

```text
expiry_required = true
```

### Warranty

Usually:

```text
Not applicable
```

for disposable products.

### Images

Minimum recommended:

```text
1 Primary Image
2–4 Additional Images
```

---

# 4. Surgical Instruments

Examples:

* Surgical scissors
* Forceps
* Retractors
* Clamps
* Scalpel handles

### Required fields

```text
Product Name
SKU
Category
Product Type
Brand
Manufacturer
Description
MRP
Selling Price
Material
Instrument Type
Reusable / Disposable
Stock
```

### Optional

```text
Length
Size
Jaw Type
Handle Type
Finish
Sterilization Method
Autoclavable
Packaging
Country of Origin
Warranty
```

### Example

```text
Material: Stainless Steel
Instrument Type: Surgical Forceps
Reusable: Yes
Length: 16 cm
Autoclavable: Yes
Finish: Surgical Grade
```

### Batch

Recommended where applicable.

### Expiry

Usually:

```text
Not applicable
```

unless the specific product has an applicable shelf-life requirement.

### Warranty

Potentially applicable.

For example:

```text
Warranty: 1 Year
```

---

# 5. Diagnostic Devices

Examples:

* Digital BP monitor
* Pulse oximeter
* Digital thermometer
* Glucose meter
* Stethoscope

### Required fields

```text
Product Name
SKU
Category
Product Type
Brand
Manufacturer
Description
MRP
Selling Price
Measurement Type
Power Source
Stock
```

### Optional specifications

```text
Measurement Range
Accuracy
Display Type
Memory
Battery Type
Battery Life
Connectivity
Dimensions
Weight
Operating Temperature
Warranty
Included Accessories
```

Example:

```text
Measurement Type: Blood Pressure
Measurement Range: 0–299 mmHg
Accuracy: ±3 mmHg
Display: LCD
Power: 4 × AA Batteries
Memory: 120 Readings
Warranty: 2 Years
```

### Batch

Usually product-dependent.

### Expiry

Usually not applicable to the device itself, although consumable components/accessories may have expiry requirements.

### Warranty

**Recommended/required for applicable electronic devices.**

---

# 6. Home Healthcare Devices

Examples:

* Nebulizer
* Heating pad
* Digital weighing scale
* Medical air mattress
* Home-care equipment

### Required

```text
Product Name
SKU
Category
Product Type
Brand
Manufacturer
Description
MRP
Selling Price
Product Function
Power Source
Stock
```

### Optional

```text
Power Consumption
Dimensions
Weight
Material
Operating Modes
Capacity
Noise Level
Accessories
Warranty
Country of Origin
```

Example:

```text
Product Function: Nebulization
Power Source: AC
Noise Level: <60 dB
Operating Modes: Continuous
Accessories: Mask + Mouthpiece + Tubing
Warranty: 1 Year
```

---

# 7. Mobility / Support Products

Examples:

* Knee support
* Wrist support
* Back support
* Walking stick
* Walker
* Wheelchair

### Required

```text
Product Name
SKU
Category
Product Type
Brand
Manufacturer
Description
MRP
Selling Price
Material
Stock
```

### Optional

```text
Size
Weight Capacity
Adjustability
Color
Dimensions
Folding
Frame Material
Support Type
Age Group
Warranty
```

Example:

```text
Support Type: Knee Support
Material: Neoprene
Size: Medium
Adjustable: Yes
Color: Black
Warranty: 6 Months
```

---

# 8. Product-type specification matrix

This is what I would actually use when building your **admin Add Product form**.

| Specification     |    Surgical Disposable    | Surgical Instrument |     Diagnostic Device     |      Home Healthcare      |          Mobility         |
| ----------------- | :-----------------------: | :-----------------: | :-----------------------: | :-----------------------: | :-----------------------: |
| Material          |          Required         |       Required      |          Optional         |          Optional         |          Required         |
| Sterile           | Required where applicable |       Optional      |             No            |             No            |             No            |
| Single Use        |          Required         |       Required      |             No            |             No            |             No            |
| Pack Quantity     |          Required         |       Optional      |          Optional         |          Optional         |          Optional         |
| Size              |          Optional         |       Optional      |          Optional         |          Optional         | Required where applicable |
| Measurement Range |             No            |          No         | Required where applicable |          Optional         |             No            |
| Accuracy          |             No            |          No         | Required where applicable |          Optional         |             No            |
| Power Source      |             No            |          No         |          Required         | Required where applicable |          Optional         |
| Battery           |             No            |          No         |          Optional         |          Optional         |          Optional         |
| Warranty          |         Usually no        |       Optional      | Required where applicable | Required where applicable |          Optional         |
| Expiry            |      Where applicable     |      Usually no     |         Usually no        |      Where applicable     |         Usually no        |
| Batch             |      Where applicable     |     Recommended     |     Product-dependent     |     Product-dependent     |     Product-dependent     |
| Weight Capacity   |             No            |          No         |          Optional         |          Optional         | Required where applicable |

This matrix becomes **validation logic** in your backend/admin panel.

---

# 9. Changes to our PostgreSQL schema

Our existing schema needs one important addition.

Add an enum:

```sql
CREATE TYPE product_type AS ENUM (
    'SURGICAL_DISPOSABLE',
    'SURGICAL_INSTRUMENT',
    'DIAGNOSTIC_DEVICE',
    'HOME_HEALTHCARE_DEVICE',
    'MOBILITY_SUPPORT'
);
```

Then change:

```sql
product_type VARCHAR(100)
```

to:

```sql
product_type product_type NOT NULL
```

So the product table becomes conceptually:

```text
products
────────────────────────────
id
name
slug
sku
category_id
brand_id
product_type
short_description
description
mrp
selling_price
manufacturer
country_of_origin
status
created_at
updated_at
```

---

# 10. Add product-level flags

I would also add these:

```sql
ALTER TABLE products
ADD COLUMN is_disposable BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN is_sterile BOOLEAN,
ADD COLUMN is_single_use BOOLEAN,
ADD COLUMN expiry_required BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN batch_tracking_required BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN warranty_months INTEGER;
```

Now your system can distinguish:

```text
Surgical Gloves
is_disposable = true
is_sterile = true
is_single_use = true
expiry_required = true
batch_tracking_required = true
warranty_months = NULL
```

versus:

```text
BP Monitor
is_disposable = false
is_sterile = false
is_single_use = false
expiry_required = false
batch_tracking_required = false
warranty_months = 24
```

That's a much cleaner model.

---

# 11. Add stock thresholds

Your earlier database design had inventory transactions, but we should also know **when to warn the admin**.

Add:

```sql
ALTER TABLE products
ADD COLUMN reorder_level INTEGER NOT NULL DEFAULT 5;
```

Then the admin can see:

```text
BP Monitor
Current Stock: 8
Reorder Level: 10

⚠ LOW STOCK
```

---

# 12. Add product weight

This will become useful for shipping calculations.

```sql
ALTER TABLE products
ADD COLUMN weight_grams INTEGER;
```

Potentially later:

```text
length_mm
width_mm
height_mm
```

But don't add shipping dimensions until you actually need them.

---

# 13. Realistic sample catalog

Let's create **15 sample products**.

I deliberately recommend using **generic/example brands in the development database**, rather than pretending a real manufacturer's product specifications are yours.

### Surgical / disposable

1. Sterile Surgical Gloves
2. Disposable Examination Gloves
3. Sterile Gauze Swabs
4. Disposable Surgical Masks

### Surgical instruments

5. Stainless Steel Surgical Forceps
6. Surgical Scissors
7. Scalpel Handle

### Diagnostic devices

8. Digital Blood Pressure Monitor
9. Fingertip Pulse Oximeter
10. Digital Thermometer
11. Blood Glucose Meter

### Home healthcare

12. Compressor Nebulizer
13. Digital Medical Weighing Scale

### Mobility/support

14. Adjustable Knee Support
15. Folding Walking Stick

---

# 14. Example product data

### 1. Sterile Surgical Gloves

```text
Product Type: SURGICAL_DISPOSABLE

Category: Surgical Gloves

SKU: SG-001

Brand: MedCare Example

Material: Latex
Sterile: Yes
Single Use: Yes
Size: 7.5
Pack Quantity: 50 pairs
Expiry: Yes
Batch Tracking: Yes
Warranty: N/A
```

### 2. Examination Gloves

```text
Product Type: SURGICAL_DISPOSABLE

Material: Nitrile
Sterile: No
Single Use: Yes
Size: Medium
Pack Quantity: 100
Latex Free: Yes
```

### 3. Sterile Gauze Swabs

```text
Product Type: SURGICAL_DISPOSABLE

Material: Cotton
Sterile: Yes
Single Use: Yes
Size: 10 × 10 cm
Pack Quantity: 100
Expiry: Yes
```

### 4. Surgical Masks

```text
Product Type: SURGICAL_DISPOSABLE

Material: Non-woven fabric
Single Use: Yes
Pack Quantity: 50
Latex Free: Yes
```

### 5. Surgical Forceps

```text
Product Type: SURGICAL_INSTRUMENT

Material: Stainless Steel
Reusable: Yes
Length: 16 cm
Autoclavable: Yes
Warranty: 12 months
```

### 6. Surgical Scissors

```text
Product Type: SURGICAL_INSTRUMENT

Material: Stainless Steel
Reusable: Yes
Length: 14 cm
Type: Straight
Autoclavable: Yes
```

### 7. Scalpel Handle

```text
Product Type: SURGICAL_INSTRUMENT

Material: Stainless Steel
Reusable: Yes
Handle Type: No. 3
Autoclavable: Yes
```

### 8. Digital BP Monitor

```text
Product Type: DIAGNOSTIC_DEVICE

Measurement: Blood Pressure
Range: 0–299 mmHg
Accuracy: ±3 mmHg
Display: LCD
Power: 4 × AA
Memory: 120 readings
Warranty: 24 months
```

### 9. Pulse Oximeter

```text
Product Type: DIAGNOSTIC_DEVICE

Measurement: SpO2 + Pulse Rate
Display: LED
Power: 2 × AAA
Weight: 55 g
Warranty: 12 months
```

### 10. Digital Thermometer

```text
Product Type: DIAGNOSTIC_DEVICE

Measurement: Body Temperature
Range: 32–42°C
Display: LCD
Power: Button Cell
Auto Shutoff: Yes
Warranty: 12 months
```

### 11. Blood Glucose Meter

```text
Product Type: DIAGNOSTIC_DEVICE

Measurement: Blood Glucose
Sample Type: Capillary Blood
Display: LCD
Memory: 300 readings
Power: Battery
Warranty: 12 months
```

### 12. Compressor Nebulizer

```text
Product Type: HOME_HEALTHCARE_DEVICE

Function: Nebulization
Power: AC
Noise Level: <60 dB
Accessories: Mask, Mouthpiece, Tubing
Warranty: 12 months
```

### 13. Digital Medical Scale

```text
Product Type: HOME_HEALTHCARE_DEVICE

Capacity: 180 kg
Display: LCD
Power: Battery
Auto Shutoff: Yes
Warranty: 12 months
```

### 14. Adjustable Knee Support

```text
Product Type: MOBILITY_SUPPORT

Material: Neoprene
Size: Medium
Adjustable: Yes
Color: Black
Support Type: Knee
```

### 15. Folding Walking Stick

```text
Product Type: MOBILITY_SUPPORT

Material: Aluminium
Height: Adjustable
Weight Capacity: 100 kg
Folding: Yes
Handle Type: Ergonomic
```

---

# 15. Sample SQL

Once you have inserted your categories and brands, products can be inserted like this:

```sql
INSERT INTO products (
    name,
    slug,
    sku,
    category_id,
    brand_id,
    product_type,
    short_description,
    description,
    mrp,
    selling_price,
    manufacturer,
    country_of_origin,
    is_disposable,
    is_sterile,
    is_single_use,
    expiry_required,
    batch_tracking_required,
    warranty_months,
    reorder_level,
    status
)
VALUES (
    'Sterile Surgical Gloves',
    'sterile-surgical-gloves',
    'SG-001',
    '<CATEGORY_UUID>',
    '<BRAND_UUID>',
    'SURGICAL_DISPOSABLE',
    'Sterile single-use surgical gloves.',
    'Sterile disposable surgical gloves designed for appropriate clinical and surgical applications.',
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
    'ACTIVE'
);
```

Then specifications:

```sql
INSERT INTO product_specifications (
    product_id,
    specification_name,
    specification_value
)
VALUES
(
    '<PRODUCT_UUID>',
    'Material',
    'Latex'
),
(
    '<PRODUCT_UUID>',
    'Size',
    '7.5'
),
(
    '<PRODUCT_UUID>',
    'Pack Quantity',
    '50 pairs'
),
(
    '<PRODUCT_UUID>',
    'Sterile',
    'Yes'
),
(
    '<PRODUCT_UUID>',
    'Single Use',
    'Yes'
);
```

And inventory:

```sql
INSERT INTO product_batches (
    product_id,
    batch_number,
    quantity,
    manufacturing_date,
    expiry_date
)
VALUES (
    '<PRODUCT_UUID>',
    'SG-DEMO-001',
    100,
    '2026-01-15',
    '2028-01-15'
);
```

For your actual implementation, we'll eventually automate this through the **admin Add Product API**, so you won't manually write SQL for every product.

---

# Part 2 — Customer Wireframes

Now we can design the UI because we actually know what the product data looks like.

These are **low-fidelity wireframes**, not visual designs.

---

## 16. Customer navigation

I recommend this navigation:

```text
┌─────────────────────────────────────────────────────────────┐
│ LOGO        Search medical products...       👤 Account 🛒 │
├─────────────────────────────────────────────────────────────┤
│ Home │ Products │ Categories │ Offers │ About │ Contact    │
└─────────────────────────────────────────────────────────────┘
```

On desktop, the sidebar can be used for categories/filtering rather than wasting the main navigation on too many links.

---

# 17. Customer Home

```text
┌─────────────────────────────────────────────────────────────┐
│ LOGO        Search products...              Account  Cart   │
├─────────────────────────────────────────────────────────────┤
│ Home | Products | Categories | Offers | Support             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│              QUALITY HEALTHCARE PRODUCTS                    │
│                                                             │
│       Surgical Supplies & Everyday Medical Devices          │
│                                                             │
│          [ Search for a product... 🔍 ]                     │
│                                                             │
│                [ Browse Products ]                          │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ Categories                                                   │
│                                                             │
│ [Surgical] [Diagnostic] [Home Care] [Mobility] [Protection] │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ Featured Products                                            │
│                                                             │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐         │
│ │  IMAGE   │ │  IMAGE   │ │  IMAGE   │ │  IMAGE   │         │
│ │          │ │          │ │          │ │          │         │
│ │ Product  │ │ Product  │ │ Product  │ │ Product  │         │
│ │ ★ 4.5    │ │ ★ 4.8    │ │ ★ 4.2    │ │ ★ 4.7    │         │
│ │ ₹699     │ │ ₹999     │ │ ₹399     │ │ ₹799     │         │
│ │[Add Cart]│ │[Add Cart]│ │[Add Cart]│ │[Add Cart]│         │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘         │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ Why Choose Us?                                               │
│                                                             │
│ ✓ Quality Products   ✓ Secure Payments   ✓ Support          │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ Customer Reviews                                             │
├─────────────────────────────────────────────────────────────┤
│ Footer                                                       │
└─────────────────────────────────────────────────────────────┘
```

---

# 18. Customer Products Page

This is where your categories and filters become important.

```text
┌─────────────────────────────────────────────────────────────┐
│ LOGO       Search medical products...          Account Cart │
├─────────────────────────────────────────────────────────────┤
│ Home / Products                                              │
├───────────────┬─────────────────────────────────────────────┤
│ FILTERS       │ Surgical & Medical Products                │
│               │                                             │
│ Category      │ Sort: [Relevance ▼]                         │
│ □ Surgical    │                                             │
│ □ Diagnostic  │ ┌────────┐ ┌────────┐ ┌────────┐            │
│ □ Home Care   │ │ IMAGE  │ │ IMAGE  │ │ IMAGE  │            │
│ □ Mobility    │ │Product │ │Product │ │Product │            │
│               │ │₹699    │ │₹999    │ │₹499    │            │
│ Price         │ │★★★★☆   │ │★★★★★   │ │★★★★☆   │            │
│ ₹___ - ₹___   │ │[Cart]  │ │[Cart]  │ │[Cart]  │            │
│               │ └────────┘ └────────┘ └────────┘            │
│ Rating        │                                             │
│ ○ 4+          │ ┌────────┐ ┌────────┐ ┌────────┐            │
│ ○ 3+          │ │ IMAGE  │ │ IMAGE  │ │ IMAGE  │            │
│               │ │Product │ │Product │ │Product │            │
│ Availability  │ │₹899    │ │₹1,299  │ │₹599    │            │
│ □ In Stock    │ │★★★★☆   │ │★★★★★   │ │★★★★☆   │            │
│               │ │[Cart]  │ │[Cart]  │ │[Cart]  │            │
│ Brand         │ └────────┘ └────────┘ └────────┘            │
│ □ Brand A     │                                             │
│ □ Brand B     │                 1  2  3  4  →               │
└───────────────┴─────────────────────────────────────────────┘
```

---

# 19. Product Details Page

This is one of the most important screens.

```text
┌─────────────────────────────────────────────────────────────┐
│ LOGO        Search...                         Account  Cart │
├─────────────────────────────────────────────────────────────┤
│ Home / Diagnostic / BP Monitors                             │
├──────────────────────┬──────────────────────────────────────┤
│                      │ DIGITAL BLOOD PRESSURE MONITOR       │
│                      │                                      │
│      PRODUCT         │ ★★★★★  4.7 (126 Reviews)            │
│       IMAGE          │                                      │
│                      │ ₹1,999                               │
│                      │ MRP ₹2,499                            │
│                      │                                      │
│   [small] [small]    │ ✓ In Stock                           │
│   [small] [small]    │                                      │
│                      │ Quantity: [-] 1 [+]                  │
│                      │                                      │
│                      │ [ Add to Cart ] [ Buy Now ]           │
│                      │                                      │
│                      │ ♡ Add to Wishlist                    │
├──────────────────────┴──────────────────────────────────────┤
│                                                             │
│ Description | Specifications | Reviews | Questions         │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ Specifications                                              │
│                                                             │
│ Measurement Range    │ 0–299 mmHg                            │
│ Accuracy             │ ±3 mmHg                               │
│ Display              │ LCD                                   │
│ Power                │ 4 × AA batteries                     │
│ Memory               │ 120 readings                          │
│ Warranty             │ 2 Years                               │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ Customer Reviews                                             │
│                                                             │
│ ★★★★★  Verified Purchase                                   │
│ "Product arrived..."                                        │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ Related Products                                            │
└─────────────────────────────────────────────────────────────┘
```

---

# 20. Cart

```text
┌─────────────────────────────────────────────────────────────┐
│                         YOUR CART                            │
├─────────────────────────────────────────────────────────────┤
│ Product             Price       Qty       Total              │
│                                                             │
│ BP Monitor          ₹1,999      [- 1 +]   ₹1,999             │
│ Pulse Oximeter      ₹899        [- 2 +]   ₹1,798             │
│                                                             │
├───────────────────────────────────────────┬─────────────────┤
│                                           │ Summary         │
│                                           │                 │
│                                           │ Subtotal ₹3797  │
│                                           │ Discount ₹200   │
│                                           │ Shipping ₹50    │
│                                           │                 │
│                                           │ Total ₹3647     │
│                                           │                 │
│                                           │ [Checkout]      │
└───────────────────────────────────────────┴─────────────────┘
```

---

# 21. Login

Because you explicitly require login before ordering:

```text
┌──────────────────────────────────────────┐
│              MEDICAL STORE               │
│                                          │
│              Welcome Back                │
│                                          │
│ Email                                    │
│ [________________________]               │
│                                          │
│ Password                                 │
│ [________________________]               │
│                                          │
│              Forgot Password?            │
│                                          │
│              [ LOGIN ]                   │
│                                          │
│ Don't have an account?                   │
│              Register                    │
└──────────────────────────────────────────┘
```

If an anonymous user clicks **Buy Now**, send them here and then return them to checkout after authentication.

---

# 22. Customer Account

```text
┌─────────────────────────────────────────────────────────────┐
│ MY ACCOUNT                                                   │
├────────────────────┬────────────────────────────────────────┤
│ Profile            │ Personal Information                   │
│ Orders             │                                        │
│ Addresses          │ Name: __________________                │
│ Wishlist           │ Email: _________________                │
│ Reviews            │ Phone: _________________                │
│ Complaints         │                                        │
│ Notifications      │ [Save Changes]                          │
│ Security           │                                        │
│ Logout             │                                        │
└────────────────────┴────────────────────────────────────────┘
```

---

# 23. Customer Orders

```text
┌─────────────────────────────────────────────────────────────┐
│ MY ORDERS                                                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ #MED-10291                              ₹2,898              │
│ 20 Aug 2026                                                  │
│                                                             │
│ ✓ Confirmed → ✓ Packed → ✓ Shipped → ○ Delivered            │
│                                                             │
│                         [View Order]                         │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ #MED-10285                              ₹1,299              │
│ 18 Aug 2026                                                  │
│                                                             │
│ ✓ Delivered                                                 │
│                                                             │
│                  [View] [Write Review]                       │
└─────────────────────────────────────────────────────────────┘
```

---

# Part 3 — Admin Wireframes

This is where your application becomes significantly more interesting.

---

# 24. Admin sidebar

I recommend this exact structure:

```text
┌──────────────────┐
│ MEDICAL ADMIN    │
├──────────────────┤
│                  │
│ Dashboard        │
│                  │
│ PRODUCTS         │
│   All Products   │
│   Add Product    │
│   Categories     │
│   Brands         │
│                  │
│ INVENTORY        │
│   Stock          │
│   Low Stock      │
│   Batches        │
│   Expiring       │
│   Transactions   │
│                  │
│ ORDERS           │
│   All Orders     │
│   Pending        │
│   Processing     │
│   Shipped        │
│   Delivered      │
│                  │
│ CUSTOMERS        │
│                  │
│ REVIEWS          │
│                  │
│ COMPLAINTS       │
│                  │
│ ANALYTICS        │
│                  │
│ SETTINGS         │
│                  │
│ Logout           │
└──────────────────┘
```

Notice that I added:

**Expiring**

This is particularly useful for your product domain.

---

# 25. Admin Dashboard

```text
┌──────────────────┬──────────────────────────────────────────┐
│ SIDEBAR          │ DASHBOARD                                │
│                  │                                          │
│ Dashboard        │ ┌─────────┐ ┌─────────┐ ┌─────────┐     │
│ Products         │ │ Revenue │ │ Orders  │ │Customers│     │
│ Inventory        │ │ ₹82,450 │ │   128   │ │   540   │     │
│ Orders           │ └─────────┘ └─────────┘ └─────────┘     │
│ Customers        │                                          │
│ Reviews          │ ┌─────────┐ ┌─────────┐                  │
│ Complaints       │ │Low Stock│ │Complaints│                 │
│ Analytics        │ │    7    │ │    4    │                  │
│                  │ └─────────┘ └─────────┘                  │
│                  │                                          │
│                  │ Sales Overview                            │
│                  │ ┌────────────────────────────────────┐   │
│                  │ │                 📈                   │   │
│                  │ │       sales chart                  │   │
│                  │ │                                    │   │
│                  │ └────────────────────────────────────┘   │
│                  │                                          │
│                  │ Top Products       Low Stock              │
│                  │ ┌─────────────┐    ┌───────────────┐    │
│                  │ │ BP Monitor  │    │ Gloves   4    │    │
│                  │ │ Oximeter    │    │ Gauze    3    │    │
│                  │ │ Thermometer │    │ Syringe  2    │    │
│                  │ └─────────────┘    └───────────────┘    │
└──────────────────┴──────────────────────────────────────────┘
```

---

# 26. Admin Product List

```text
┌──────────────────┬──────────────────────────────────────────┐
│ SIDEBAR          │ PRODUCTS                                 │
│                  │                                          │
│ Products         │ [ + Add Product ]                        │
│                  │                                          │
│                  │ Search: [________________] 🔍            │
│                  │                                          │
│                  │ Category [All ▼]  Status [All ▼]          │
│                  │                                          │
│                  │ ┌─────────────────────────────────────┐  │
│                  │ │ Product │ SKU │ Stock │ Price │     │  │
│                  │ ├─────────────────────────────────────┤  │
│                  │ │ BP Monitor │ BP01 │ 25 │ ₹1999 │    │  │
│                  │ │ Gloves │ SG01 │ 4 ⚠ │ ₹699 │        │  │
│                  │ │ Oximeter │ OX01 │ 32 │ ₹899 │       │  │
│                  │ └─────────────────────────────────────┘  │
│                  │                                          │
│                  │ [Edit] [View] [Deactivate]               │
└──────────────────┴──────────────────────────────────────────┘
```

---

# 27. Admin Add Product

This is where our product-type model becomes extremely important.

```text
┌─────────────────────────────────────────────────────────────┐
│ ADD PRODUCT                                                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ BASIC INFORMATION                                            │
│                                                             │
│ Product Name *                                               │
│ [____________________________________________]               │
│                                                             │
│ SKU *                    Product Type *                      │
│ [____________]           [Diagnostic Device ▼]              │
│                                                             │
│ Category *                Brand                              │
│ [____________]            [____________]                     │
│                                                             │
│ Short Description                                           │
│ [____________________________________________]               │
│                                                             │
│ Description                                                   │
│ [____________________________________________]               │
│ [____________________________________________]               │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ PRICING                                                      │
│                                                             │
│ MRP *                     Selling Price *                    │
│ [₹__________]             [₹__________]                      │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ PRODUCT SPECIFICATIONS                                       │
│                                                             │
│ Measurement Range *     [________________]                   │
│ Accuracy *              [________________]                   │
│ Display Type            [________________]                   │
│ Power Source *          [________________]                   │
│ Warranty                [____] months                        │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ INVENTORY                                                     │
│                                                             │
│ Initial Stock *         [________]                            │
│ Reorder Level *        [________]                            │
│ Batch Tracking         [✓]                                  │
│ Expiry Required        [ ]                                  │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ IMAGES                                                       │
│                                                             │
│ [ Upload Primary Image ]                                     │
│ [ + Add Images ]                                             │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                    [Save Draft] [Publish Product]            │
└─────────────────────────────────────────────────────────────┘
```

The critical part:

### If Product Type = Diagnostic Device

Show:

```text
Measurement Range
Accuracy
Power Source
Display
Memory
Warranty
```

### If Product Type = Surgical Disposable

Instead show:

```text
Material
Sterile
Single Use
Size
Pack Quantity
Latex Free
Expiry
Batch
```

### If Product Type = Mobility Support

Show:

```text
Material
Size
Adjustable
Weight Capacity
Support Type
Warranty
```

This gives you a **dynamic product form** instead of a massive form containing irrelevant fields.

---

# 28. Admin Inventory

```text
┌──────────────────┬──────────────────────────────────────────┐
│ SIDEBAR          │ INVENTORY                                │
│                  │                                          │
│ Inventory        │ Search [________________]                │
│                  │                                          │
│                  │ [All] [Low Stock] [Out of Stock]         │
│                  │                                          │
│                  │ Product       Stock  Reorder  Status     │
│                  │ ───────────────────────────────────────  │
│                  │ BP Monitor     25       10     ✓ Good     │
│                  │ Gloves          4       20     ⚠ Low      │
│                  │ Gauze           0       20     ✕ Out      │
│                  │ Oximeter       32       10     ✓ Good     │
│                  │                                          │
│                  │ [Manage Stock]                           │
└──────────────────┴──────────────────────────────────────────┘
```

---

# 29. Admin Batch Management

This is particularly important for your surgical products.

```text
┌─────────────────────────────────────────────────────────────┐
│ PRODUCT: STERILE SURGICAL GLOVES                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Current Stock: 175                                          │
│                                                             │
│ BATCHES                                                     │
│                                                             │
│ Batch       Manufactured    Expiry       Quantity  Status   │
│ ─────────────────────────────────────────────────────────── │
│ SG001       15-01-2026      15-01-2028      100     ✓       │
│ SG002       10-03-2026      10-03-2028       75     ✓       │
│ SG003       05-06-2025      05-06-2026        0     Expired │
│                                                             │
│ [+ Add Batch]                                               │
└─────────────────────────────────────────────────────────────┘
```

This is one of the features that will make your project feel like a **real medical inventory platform**, rather than a generic e-commerce CRUD application.

---

# 30. Admin Orders

```text
┌──────────────────┬──────────────────────────────────────────┐
│ SIDEBAR          │ ORDERS                                   │
│                  │                                          │
│ Orders           │ Search [____________]                    │
│                  │                                          │
│                  │ Status [All ▼]                           │
│                  │                                          │
│ Order     Customer      Amount      Status       Date       │
│ ──────────────────────────────────────────────────────────  │
│ #10291    Rahul        ₹2,898       Shipped      20 Aug     │
│ #10290    Aman         ₹699         Processing   20 Aug     │
│ #10289    Neha         ₹1,299       Delivered    19 Aug     │
│                                                             │
│ [View Order]                                                │
└──────────────────┴──────────────────────────────────────────┘
```

---

# 31. Admin Order Details

```text
┌─────────────────────────────────────────────────────────────┐
│ ORDER #MED-10291                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Customer: Rahul Singh                                       │
│ Email: customer@example.com                                 │
│                                                             │
│ Status: [ SHIPPED ▼ ]                                       │
│                                                             │
│ PRODUCTS                                                     │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ BP Monitor          ×1       ₹1,999                     │ │
│ │ Pulse Oximeter      ×1       ₹899                       │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ Address                                                      │
│ [Customer shipping address]                                 │
│                                                             │
│ Payment                                                      │
│ Status: Paid                                                 │
│ Method: UPI                                                 │
│                                                             │
│ ORDER HISTORY                                                │
│ ✓ Order placed                                              │
│ ✓ Confirmed                                                  │
│ ✓ Packed                                                    │
│ ✓ Shipped                                                   │
│                                                             │
│ [Update Status]                                              │
└─────────────────────────────────────────────────────────────┘
```

---

# 32. Admin Complaints

```text
┌──────────────────┬──────────────────────────────────────────┐
│ SIDEBAR          │ COMPLAINTS                               │
│                  │                                          │
│ Complaints       │ [Open] [In Progress] [Resolved]          │
│                  │                                          │
│ ID      Order     Issue            Priority    Status       │
│ ──────────────────────────────────────────────────────────  │
│ #C101   #10291    Damaged Product  HIGH        Open         │
│ #C100   #10285    Wrong Item       MEDIUM      Processing   │
│ #C099   #10280    Delivery Issue   LOW         Resolved     │
│                                                             │
│ [View Complaint]                                             │
└──────────────────┴──────────────────────────────────────────┘
```

---

# 33. Admin Reviews

```text
┌──────────────────┬──────────────────────────────────────────┐
│ SIDEBAR          │ REVIEWS                                  │
│                  │                                          │
│ Reviews          │ [Pending] [Approved] [Reported]           │
│                  │                                          │
│ Product: BP Monitor                                           │
│ Customer: Rahul                                              │
│ Rating: ★★★★★                                                │
│                                                             │
│ "Very easy to use..."                                        │
│                                                             │
│ Verified Purchase ✓                                         │
│                                                             │
│ [Approve] [Reject] [Report]                                 │
└──────────────────┴──────────────────────────────────────────┘
```

---

# 34. Final application flow

Now our architecture is becoming very clear.

```text
                         WEBSITE
                            │
              ┌─────────────┴─────────────┐
              │                           │
          CUSTOMER                      ADMIN
              │                           │
        ┌─────┼─────┐               ┌─────┼──────┐
        │     │     │               │     │      │
      Browse Search Cart          Products Stock Orders
        │     │     │               │     │      │
        └─────┼─────┘               │     │      │
              │                     │     │      │
           Checkout                 └─────┼──────┘
              │                           │
            Order                         │
              │                           │
              └──────────┬────────────────┘
                         │
                    PostgreSQL
                         │
        ┌────────────────┼─────────────────┐
        │                │                 │
     Products         Inventory          Orders
        │                │                 │
     Reviews          Batches          Payments
        │                │                 │
    Categories      Transactions     Order History
```

---

# 35. What we have now

We have moved past vague planning.

You now have:

### Product model

```text
5 product types
```

### Product-specific requirements

```text
Surgical disposable
Surgical instruments
Diagnostic devices
Home healthcare
Mobility/support
```

### Inventory model

```text
Product
 ↓
Batch
 ↓
Inventory Transactions
```

### Customer interface

```text
Home
Products
Search
Categories
Product Details
Cart
Checkout
Account
Orders
Reviews
Complaints
Wishlist
```

### Admin interface

```text
Dashboard
Products
Categories
Brands
Inventory
Batches
Expiring Products
Orders
Customers
Reviews
Complaints
Analytics
Settings
```

---

## The next technical step

At this point, **we should stop designing screens and turn this into the actual project foundation**.

The next sequence I recommend is:

```text
1. Create PostgreSQL database
       ↓
2. Create schema/migrations
       ↓
3. Insert categories + subcategories
       ↓
4. Insert brands
       ↓
5. Insert 15 sample products
       ↓
6. Insert product specifications
       ↓
7. Insert batches + inventory
       ↓
8. Verify relationships with SQL queries
       ↓
9. Design API endpoints
       ↓
10. Start FastAPI backend
```

And one thing I'd change from the earlier plan: **don't manually create the 15 products directly in PostgreSQL as your final workflow.** Use seed data only to test the database. The real system should eventually let the admin create these products through the dynamic **Add Product** form we designed above.

The strongest next step is therefore **Step 1–8: create the complete PostgreSQL database + seed it with the 15 products and test the relationships**. After that, we can design the **FastAPI backend/API architecture** around a database we know actually works.
