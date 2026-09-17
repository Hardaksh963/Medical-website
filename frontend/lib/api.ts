import { Product, ProductDetail, ProductListResponse } from "./types";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    let message = `API request failed: ${response.status}`;

    try {
      const error = await response.json();

      if (error.detail) {
        message =
          typeof error.detail === "string"
            ? error.detail
            : JSON.stringify(error.detail);
      }
    } catch {
      // Keep default error message.
    }

    throw new Error(message);
  }

  return response.json();
}

export async function getProducts(params?: {
  page?: number;
  limit?: number;
  category_id?: string;
  product_type?: string;
  min_price?: number;
  max_price?: number;
}): Promise<Product[]> {
  const searchParams = new URLSearchParams();

  if (params?.page) {
    searchParams.set("page", String(params.page));
  }

  if (params?.limit) {
    searchParams.set("limit", String(params.limit));
  }

  if (params?.category_id) {
    searchParams.set("category_id", params.category_id);
  }

  if (params?.product_type) {
    searchParams.set("product_type", params.product_type);
  }

  if (params?.min_price !== undefined) {
    searchParams.set("min_price", String(params.min_price));
  }

  if (params?.max_price !== undefined) {
    searchParams.set("max_price", String(params.max_price));
  }

  const query = searchParams.toString();

  const response = await apiRequest<ProductListResponse>(
    `/products${query ? `?${query}` : ""}`
  );

  console.log("Products API response:", response);

  if (!response || !Array.isArray(response.items)) {
    console.error("Unexpected products response:", response);
    return [];
  }

  return response.items;
}

export async function getProduct(
  productId: string
): Promise<Product> {
  return apiRequest<Product>(`/products/${productId}`);
}

export async function getProductDetails(
  productId: string
): Promise<ProductDetail> {
  return apiRequest<ProductDetail>(
    `/products/${productId}/details`
  );
}