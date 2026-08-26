from datetime import date, datetime, timezone
from decimal import Decimal
from uuid import uuid4

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.core.security import get_password_hash

from app.models.user import User
from app.models.category import Category
from app.models.brand import Brand
from app.models.product import Product
from app.models.batch import ProductBatch
from app.models.inventory import InventoryMovement


def get_or_create(session, model, **filters):
    """
    Return an existing record if found.
    Otherwise create and return a new one.
    """
    statement = select(model).filter_by(**filters)
    result = session.execute(statement).scalar_one_or_none()

    if result:
        return result

    obj = model(**filters)
    session.add(obj)
    session.flush()

    return obj


def seed_users(session):
    print("Creating users...")

    admin = get_or_create(
        session,
        User,
        email="admin@medicalstore.com",
    )

    admin.name = "Medical Store Admin"
    admin.phone = "9876543210"
    admin.password_hash = get_password_hash("Admin@12345")
    admin.role = "ADMIN"
    admin.is_active = True

    customers = []

    customer_data = [
        ("Rahul Sharma", "rahul@example.com", "9876543211"),
        ("Priya Singh", "priya@example.com", "9876543212"),
        ("Aman Kumar", "aman@example.com", "9876543213"),
    ]

    for name, email, phone in customer_data:
        customer = get_or_create(
            session,
            User,
            email=email,
        )

        customer.name = name
        customer.phone = phone
        customer.password_hash = get_password_hash("Customer@123")
        customer.role = "CUSTOMER"
        customer.is_active = True

        customers.append(customer)

    print("Users created.")

    return admin, customers


def seed_categories(session):
    print("Creating categories...")

    categories = {}

    main_categories = [
        ("Surgical & Disposable", "surgical-disposable"),
        ("Surgical Instruments", "surgical-instruments"),
        ("Diagnostic Devices", "diagnostic-devices"),
        ("Home Healthcare", "home-healthcare"),
        ("Mobility & Support", "mobility-support"),
    ]

    for name, slug in main_categories:
        categories[name] = get_or_create(
            session,
            Category,
            slug=slug,
        )

        categories[name].name = name
        categories[name].is_active = True

    # Subcategories
    subcategories = [
        (
            "Gloves & Protective",
            "gloves-protective",
            "Surgical & Disposable",
        ),
        (
            "Syringes",
            "syringes",
            "Surgical & Disposable",
        ),
        (
            "Masks",
            "masks",
            "Surgical & Disposable",
        ),
        (
            "Blood Pressure",
            "blood-pressure",
            "Diagnostic Devices",
        ),
        (
            "Diabetes Care",
            "diabetes-care",
            "Diagnostic Devices",
        ),
        (
            "Respiratory Care",
            "respiratory-care",
            "Home Healthcare",
        ),
        (
            "Walking Aids",
            "walking-aids",
            "Mobility & Support",
        ),
    ]

    for name, slug, parent_name in subcategories:
        category = get_or_create(
            session,
            Category,
            slug=slug,
        )

        category.name = name
        category.parent_id = categories[parent_name].id
        category.is_active = True

    print("Categories created.")

    return categories


def seed_brands(session):
    print("Creating brands...")

    brand_names = [
        "Dr. Morepen",
        "Omron",
        "Accu-Chek",
        "Romsons",
        "Beurer",
        "3M",
        "Vissco",
    ]

    brands = {}

    for name in brand_names:
        brand = get_or_create(
            session,
            Brand,
            name=name,
        )

        brand.description = f"{name} medical products"
        brand.is_active = True

        brands[name] = brand

    print("Brands created.")

    return brands


def seed_products(session, categories, brands):
    print("Creating products...")

    products_data = [
        {
            "name": "Latex Surgical Gloves",
            "slug": "latex-surgical-gloves",
            "sku": "GLV-LTX-001",
            "category": "Gloves & Protective",
            "brand": "Romsons",
            "product_type": "SURGICAL_DISPOSABLE",
            "short_description": "Sterile disposable latex surgical gloves.",
            "description": "High-quality sterile latex surgical gloves suitable for medical procedures.",
            "mrp": "450.00",
            "selling_price": "399.00",
            "manufacturer": "Romsons",
            "country_of_origin": "India",
            "is_disposable": True,
            "is_sterile": True,
            "is_single_use": True,
            "expiry_required": True,
            "batch_tracking_required": True,
            "warranty_months": None,
            "reorder_level": 100,
            "weight_grams": 8,
        },
        {
            "name": "Disposable Face Mask",
            "slug": "disposable-face-mask",
            "sku": "MSK-DSP-001",
            "category": "Masks",
            "brand": "3M",
            "product_type": "SURGICAL_DISPOSABLE",
            "short_description": "Three-layer disposable medical face mask.",
            "description": "Three-layer disposable mask designed for medical and everyday protection.",
            "mrp": "250.00",
            "selling_price": "199.00",
            "manufacturer": "3M",
            "country_of_origin": "India",
            "is_disposable": True,
            "is_sterile": False,
            "is_single_use": True,
            "expiry_required": True,
            "batch_tracking_required": True,
            "warranty_months": None,
            "reorder_level": 200,
            "weight_grams": 5,
        },
        {
            "name": "Disposable Syringe 5ml",
            "slug": "disposable-syringe-5ml",
            "sku": "SYR-5ML-001",
            "category": "Syringes",
            "brand": "Romsons",
            "product_type": "SURGICAL_DISPOSABLE",
            "short_description": "Sterile 5ml disposable syringe.",
            "description": "Single-use sterile syringe suitable for medical injections.",
            "mrp": "15.00",
            "selling_price": "12.00",
            "manufacturer": "Romsons",
            "country_of_origin": "India",
            "is_disposable": True,
            "is_sterile": True,
            "is_single_use": True,
            "expiry_required": True,
            "batch_tracking_required": True,
            "warranty_months": None,
            "reorder_level": 500,
            "weight_grams": 12,
        },
        {
            "name": "Surgical Scissors",
            "slug": "surgical-scissors",
            "sku": "INS-SCI-001",
            "category": "Surgical Instruments",
            "brand": "Romsons",
            "product_type": "SURGICAL_INSTRUMENT",
            "short_description": "Stainless steel surgical scissors.",
            "description": "Reusable stainless steel scissors designed for surgical procedures.",
            "mrp": "850.00",
            "selling_price": "749.00",
            "manufacturer": "Romsons",
            "country_of_origin": "India",
            "is_disposable": False,
            "is_sterile": False,
            "is_single_use": False,
            "expiry_required": False,
            "batch_tracking_required": True,
            "warranty_months": 12,
            "reorder_level": 20,
            "weight_grams": 120,
        },
        {
            "name": "Digital Blood Pressure Monitor",
            "slug": "digital-blood-pressure-monitor",
            "sku": "BP-OMR-001",
            "category": "Blood Pressure",
            "brand": "Omron",
            "product_type": "DIAGNOSTIC_DEVICE",
            "short_description": "Automatic digital blood pressure monitor.",
            "description": "Easy-to-use automatic blood pressure monitor for home healthcare.",
            "mrp": "2999.00",
            "selling_price": "2499.00",
            "manufacturer": "Omron",
            "country_of_origin": "Japan",
            "is_disposable": False,
            "is_sterile": False,
            "is_single_use": False,
            "expiry_required": False,
            "batch_tracking_required": True,
            "warranty_months": 36,
            "reorder_level": 10,
            "weight_grams": 350,
        },
        {
            "name": "Pulse Oximeter",
            "slug": "pulse-oximeter",
            "sku": "OXI-MRP-001",
            "category": "Diagnostic Devices",
            "brand": "Dr. Morepen",
            "product_type": "DIAGNOSTIC_DEVICE",
            "short_description": "Portable fingertip pulse oximeter.",
            "description": "Compact device for measuring blood oxygen saturation and pulse rate.",
            "mrp": "1499.00",
            "selling_price": "999.00",
            "manufacturer": "Dr. Morepen",
            "country_of_origin": "India",
            "is_disposable": False,
            "is_sterile": False,
            "is_single_use": False,
            "expiry_required": False,
            "batch_tracking_required": True,
            "warranty_months": 12,
            "reorder_level": 15,
            "weight_grams": 50,
        },
        {
            "name": "Digital Thermometer",
            "slug": "digital-thermometer",
            "sku": "THM-MRP-001",
            "category": "Diagnostic Devices",
            "brand": "Dr. Morepen",
            "product_type": "DIAGNOSTIC_DEVICE",
            "short_description": "Fast digital clinical thermometer.",
            "description": "Digital thermometer suitable for household temperature measurement.",
            "mrp": "299.00",
            "selling_price": "199.00",
            "manufacturer": "Dr. Morepen",
            "country_of_origin": "India",
            "is_disposable": False,
            "is_sterile": False,
            "is_single_use": False,
            "expiry_required": False,
            "batch_tracking_required": True,
            "warranty_months": 6,
            "reorder_level": 25,
            "weight_grams": 30,
        },
        {
            "name": "Glucometer Kit",
            "slug": "glucometer-kit",
            "sku": "GLU-ACC-001",
            "category": "Diabetes Care",
            "brand": "Accu-Chek",
            "product_type": "DIAGNOSTIC_DEVICE",
            "short_description": "Blood glucose monitoring kit.",
            "description": "Complete blood glucose monitoring system for home diabetes management.",
            "mrp": "1999.00",
            "selling_price": "1599.00",
            "manufacturer": "Accu-Chek",
            "country_of_origin": "Germany",
            "is_disposable": False,
            "is_sterile": False,
            "is_single_use": False,
            "expiry_required": False,
            "batch_tracking_required": True,
            "warranty_months": 24,
            "reorder_level": 15,
            "weight_grams": 250,
        },
        {
            "name": "Nebulizer Machine",
            "slug": "nebulizer-machine",
            "sku": "NEB-OMR-001",
            "category": "Respiratory Care",
            "brand": "Omron",
            "product_type": "HOME_HEALTHCARE_DEVICE",
            "short_description": "Compact compressor nebulizer.",
            "description": "Home nebulizer designed to deliver medication through inhalation.",
            "mrp": "3499.00",
            "selling_price": "2899.00",
            "manufacturer": "Omron",
            "country_of_origin": "Japan",
            "is_disposable": False,
            "is_sterile": False,
            "is_single_use": False,
            "expiry_required": False,
            "batch_tracking_required": True,
            "warranty_months": 24,
            "reorder_level": 10,
            "weight_grams": 1200,
        },
        {
            "name": "Electric Heating Pad",
            "slug": "electric-heating-pad",
            "sku": "HEAT-BEU-001",
            "category": "Home Healthcare",
            "brand": "Beurer",
            "product_type": "HOME_HEALTHCARE_DEVICE",
            "short_description": "Electric heating pad for pain relief.",
            "description": "Reusable heating pad designed for comfortable home use.",
            "mrp": "1799.00",
            "selling_price": "1399.00",
            "manufacturer": "Beurer",
            "country_of_origin": "Germany",
            "is_disposable": False,
            "is_sterile": False,
            "is_single_use": False,
            "expiry_required": False,
            "batch_tracking_required": True,
            "warranty_months": 12,
            "reorder_level": 10,
            "weight_grams": 500,
        },
        {
            "name": "Walking Stick",
            "slug": "walking-stick",
            "sku": "WST-VIS-001",
            "category": "Walking Aids",
            "brand": "Vissco",
            "product_type": "MOBILITY_SUPPORT",
            "short_description": "Adjustable aluminium walking stick.",
            "description": "Lightweight adjustable walking stick with comfortable grip.",
            "mrp": "699.00",
            "selling_price": "549.00",
            "manufacturer": "Vissco",
            "country_of_origin": "India",
            "is_disposable": False,
            "is_sterile": False,
            "is_single_use": False,
            "expiry_required": False,
            "batch_tracking_required": True,
            "warranty_months": 6,
            "reorder_level": 10,
            "weight_grams": 350,
        },
        {
            "name": "Folding Walker",
            "slug": "folding-walker",
            "sku": "WAL-VIS-001",
            "category": "Mobility & Support",
            "brand": "Vissco",
            "product_type": "MOBILITY_SUPPORT",
            "short_description": "Lightweight folding walking frame.",
            "description": "Stable and adjustable walker for mobility support.",
            "mrp": "2499.00",
            "selling_price": "2099.00",
            "manufacturer": "Vissco",
            "country_of_origin": "India",
            "is_disposable": False,
            "is_sterile": False,
            "is_single_use": False,
            "expiry_required": False,
            "batch_tracking_required": True,
            "warranty_months": 12,
            "reorder_level": 5,
            "weight_grams": 2200,
        },
        {
            "name": "Wheelchair",
            "slug": "wheelchair",
            "sku": "WHL-VIS-001",
            "category": "Mobility & Support",
            "brand": "Vissco",
            "product_type": "MOBILITY_SUPPORT",
            "short_description": "Foldable manual wheelchair.",
            "description": "Durable foldable wheelchair designed for comfortable mobility.",
            "mrp": "9999.00",
            "selling_price": "8499.00",
            "manufacturer": "Vissco",
            "country_of_origin": "India",
            "is_disposable": False,
            "is_sterile": False,
            "is_single_use": False,
            "expiry_required": False,
            "batch_tracking_required": True,
            "warranty_months": 24,
            "reorder_level": 3,
            "weight_grams": 14000,
        },
        {
            "name": "Infrared Forehead Thermometer",
            "slug": "infrared-forehead-thermometer",
            "sku": "THM-BEU-002",
            "category": "Diagnostic Devices",
            "brand": "Beurer",
            "product_type": "DIAGNOSTIC_DEVICE",
            "short_description": "Non-contact infrared thermometer.",
            "description": "Fast non-contact temperature measurement for adults and children.",
            "mrp": "2299.00",
            "selling_price": "1799.00",
            "manufacturer": "Beurer",
            "country_of_origin": "Germany",
            "is_disposable": False,
            "is_sterile": False,
            "is_single_use": False,
            "expiry_required": False,
            "batch_tracking_required": True,
            "warranty_months": 12,
            "reorder_level": 10,
            "weight_grams": 100,
        },
        {
            "name": "First Aid Kit",
            "slug": "first-aid-kit",
            "sku": "FAK-3M-001",
            "category": "Surgical & Disposable",
            "brand": "3M",
            "product_type": "SURGICAL_DISPOSABLE",
            "short_description": "Compact first aid medical kit.",
            "description": "Essential first aid supplies packed in a portable medical kit.",
            "mrp": "1299.00",
            "selling_price": "999.00",
            "manufacturer": "3M",
            "country_of_origin": "India",
            "is_disposable": True,
            "is_sterile": True,
            "is_single_use": True,
            "expiry_required": True,
            "batch_tracking_required": True,
            "warranty_months": None,
            "reorder_level": 20,
            "weight_grams": 600,
        },
    ]

    products = []

    for data in products_data:
        product = get_or_create(
            session,
            Product,
            sku=data["sku"],
        )

        product.name = data["name"]
        product.slug = data["slug"]
        product.category_id = find_category_id(
            categories,
            data["category"],
        )
        product.brand_id = brands[data["brand"]].id

        product.product_type = data["product_type"]
        product.short_description = data["short_description"]
        product.description = data["description"]

        product.mrp = Decimal(data["mrp"])
        product.selling_price = Decimal(data["selling_price"])

        product.manufacturer = data["manufacturer"]
        product.country_of_origin = data["country_of_origin"]

        product.is_disposable = data["is_disposable"]
        product.is_sterile = data["is_sterile"]
        product.is_single_use = data["is_single_use"]

        product.expiry_required = data["expiry_required"]
        product.batch_tracking_required = data["batch_tracking_required"]

        product.warranty_months = data["warranty_months"]
        product.reorder_level = data["reorder_level"]
        product.weight_grams = data["weight_grams"]

        product.status = "ACTIVE"

        products.append(product)

    session.flush()

    print(f"{len(products)} products created.")

    return products


def find_category_id(categories, name):
    """
    Find a category by name from the category dictionary.
    """
    for key, category in categories.items():
        if key == name:
            return category.id

    # Search through subcategories
    for category in categories.values():
        if category.name == name:
            return category.id

    raise ValueError(f"Category not found: {name}")


def seed_batches_and_inventory(session, products):
    print("Creating product batches and inventory...")

    for index, product in enumerate(products, start=1):

        # Don't duplicate batches if the seed is run again.
        existing_batch = session.execute(
            select(ProductBatch).where(
                ProductBatch.product_id == product.id,
                ProductBatch.batch_number == f"BATCH-{index:04d}-2026",
            )
        ).scalar_one_or_none()

        if existing_batch:
            continue

        quantity = 100

        # More stock for fast-moving disposable products
        if product.is_disposable:
            quantity = 500

        batch = ProductBatch(
            id=uuid4(),
            product_id=product.id,
            batch_number=f"BATCH-{index:04d}-2026",
            quantity=quantity,
            manufacturing_date=date(2026, 1, 15),
            expiry_date=(
                date(2029, 1, 15)
                if product.expiry_required
                else None
            ),
            is_active=True,
            created_at=datetime.now(timezone.utc),
        )

        session.add(batch)
        session.flush()

        movement = InventoryMovement(
            id=uuid4(),
            product_id=product.id,
            batch_id=batch.id,
            quantity=quantity,
            movement_type="STOCK_IN",
            reason="Initial inventory",
            created_at=datetime.now(timezone.utc),
        )

        session.add(movement)

    session.flush()

    print("Batches and inventory created.")


def seed_database():
    print("=" * 60)
    print("MEDICAL STORE DATABASE SEED")
    print("=" * 60)

    session: Session = SessionLocal()

    try:
        seed_users(session)

        categories = seed_categories(session)

        brands = seed_brands(session)

        products = seed_products(
            session,
            categories,
            brands,
        )

        seed_batches_and_inventory(
            session,
            products,
        )

        session.commit()

        print()
        print("=" * 60)
        print("DATABASE SEED COMPLETED SUCCESSFULLY")
        print("=" * 60)

    except Exception as error:
        session.rollback()

        print()
        print("=" * 60)
        print("SEED FAILED")
        print("=" * 60)
        print(error)

        raise

    finally:
        session.close()


if __name__ == "__main__":
    seed_database()