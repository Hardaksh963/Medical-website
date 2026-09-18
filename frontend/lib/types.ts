export interface ProductImage {
  id: string;
  image_url: string;
  is_primary: boolean;
  display_order: number;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  slug: string;

  short_description?: string | null;
  description?: string | null;

  mrp: number;
  selling_price: number;
  status: string;

  manufacturer?: string | null;
  country_of_origin?: string | null;

  is_disposable: boolean;
  is_sterile?: boolean | null;
  is_single_use?: boolean | null;

  expiry_required: boolean;
  batch_tracking_required: boolean;

  warranty_months?: number | null;
  reorder_level: number;
  weight_grams?: number | null;

  category_id: string | null;
  product_type: string;
  brand_id?: string | null;

  category?: {
    id: string;
    name: string;
  } | null;

  brand?: {
    id: string;
    name: string;
  } | null;

  images?: ProductImage[];
}

export interface Category {
  id: string;
  name: string;
}

export interface ProductRating {
  average: number;
  count: number;
}

export interface ProductInventory {
  available: boolean;
  quantity: number;
}

export interface ProductDetail extends Product {
  rating: ProductRating;
  inventory: ProductInventory;
}

export interface ProductListResponse {
  items: Product[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}