export interface Product {
  id: string;
  name: string;
  sku: string;
  slug: string;

  short_description: string | null;
  description: string | null;

  selling_price: number;
  status: string;

  category_id: string | null;
  brand_id: string | null;

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

export interface ProductImage {
  id: string;
  image_url: string;
  is_primary: boolean;
  display_order: number;
}

export interface ProductListResponse {
  items: Product[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}