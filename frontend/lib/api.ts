import { Category, Product, ProductDetail } from "./types";

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
      "ngrok-skip-browser-warning": "true",
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

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get("content-type");

  if (!contentType?.includes("application/json")) {
    return undefined as T;
  }

  return response.json();
}

export async function getProducts(params?: {
  page?: number;
  limit?: number;
  search?: string;
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
  
  if (params?.search) {
    searchParams.set("search", params.search);
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

  return apiRequest<Product[]>(
    `/products${query ? `?${query}` : ""}`
  );
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

export async function getCategories(): Promise<Category[]> {
  return apiRequest<Category[]>("/categories");
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export async function login(
  email: string,
  password: string
): Promise<LoginResponse> {
  return apiRequest<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
    }),
  });
}

export async function register(
  data: RegisterData
): Promise<LoginResponse> {
  return apiRequest<LoginResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export async function getCurrentUser(
  token: string
): Promise<CurrentUser> {
  return apiRequest<CurrentUser>("/auth/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export interface CartItem {
  item_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface Cart {
  cart_id: string;
  items: CartItem[];
  total_items: number;
  total_amount: number;
}

function getAuthToken(): string {
  const token = localStorage.getItem("access_token");

  if (!token) {
    throw new Error("Please login to continue.");
  }

  return token;
}

export async function getCart(): Promise<Cart> {
  const token = getAuthToken();

  return apiRequest<Cart>("/cart", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function addToCart(
  productId: string,
  quantity: number = 1
): Promise<CartItem> {
  const token = getAuthToken();

  return apiRequest<CartItem>(
    `/cart/items?product_id=${encodeURIComponent(
      productId
    )}&quantity=${quantity}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
}

export async function updateCartItem(
  itemId: string,
  quantity: number
): Promise<CartItem> {
  const token = getAuthToken();

  return apiRequest<CartItem>(
    `/cart/items/${encodeURIComponent(
      itemId
    )}?quantity=${quantity}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
}

export async function removeCartItem(itemId: string): Promise<void> {
  const token = getAuthToken();

  await apiRequest(`/cart/items/${itemId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function clearCart(): Promise<void> {
  const token = getAuthToken();

  await apiRequest("/cart", {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export interface CheckoutResponse {
  message: string;
  order_id: string;
  order_number: string;
  total: number;
}

export async function checkout(): Promise<CheckoutResponse> {
  const token = getAuthToken();

  return apiRequest<CheckoutResponse>("/orders/checkout", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface Order {
  id: string;
  order_number: string;
  user_id?: string;
  status: string;
  subtotal: number;
  shipping_cost: number;
  total_amount: number;
  created_at: string;
  items?: OrderItem[];
}

export async function getOrders(): Promise<Order[]> {
  const token = getAuthToken();

  return apiRequest<Order[]>("/orders", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function getOrder(orderId: string): Promise<Order> {
  const token = getAuthToken();

  return apiRequest<Order>(
    `/orders/${encodeURIComponent(orderId)}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
}

export interface CancelOrderResponse {
  message: string;
  order_id: string;
  order_number: string;
  status: string;
}

export async function cancelOrder(
  orderId: string
): Promise<CancelOrderResponse> {
  const token = getAuthToken();

  return apiRequest<CancelOrderResponse>(
    `/orders/${encodeURIComponent(orderId)}/cancel`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
}

export interface WishlistProduct {
  id: string;
  name: string;
  slug: string;
  selling_price: string;
  status: string;
}

export interface WishlistItem {
  id: string;
  product_id: string;
  created_at: string;
  product: WishlistProduct;
}

export async function getWishlist(): Promise<WishlistItem[]> {
  const token = getAuthToken();

  return apiRequest<WishlistItem[]>("/wishlist", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function addToWishlist(
  productId: string
): Promise<WishlistItem> {
  const token = getAuthToken();

  return apiRequest<WishlistItem>("/wishlist", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      product_id: productId,
    }),
  });
}

export async function checkWishlist(
  productId: string
): Promise<{ product_id: string; wishlisted: boolean }> {
  const token = getAuthToken();

  return apiRequest<{ product_id: string; wishlisted: boolean }>(
    `/wishlist/check/${encodeURIComponent(productId)}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
}

export async function removeFromWishlist(
  productId: string
): Promise<void> {
  const token = getAuthToken();

  await apiRequest(
    `/wishlist/${encodeURIComponent(productId)}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
}

export interface Complaint {
  id: string;
  user_id: string;
  order_id: string;
  subject: string;
  description: string;
  status: string;
  admin_response: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateComplaintData {
  subject: string;
  description: string;
  order_id: string;
}

export async function getComplaints(): Promise<Complaint[]> {
  const token = getAuthToken();

  return apiRequest<Complaint[]>("/complaints", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function getComplaint(
  complaintId: string
): Promise<Complaint> {
  const token = getAuthToken();

  return apiRequest<Complaint>(
    `/complaints/${encodeURIComponent(complaintId)}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
}

export async function createComplaint(
  data: CreateComplaintData
): Promise<Complaint> {
  const token = getAuthToken();

  return apiRequest<Complaint>("/complaints", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
}