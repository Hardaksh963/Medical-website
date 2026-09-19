import { Category, Product, ProductDetail } from "./types";
export type { Product, ProductDetail, Category };
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

export function getAuthToken(): string {
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

export interface AdminDashboardStats {
  total_products: number;
  active_products: number;
  inactive_products: number;
  total_orders: number;
  pending_orders: number;
  total_customers: number;
  total_revenue: number;
  low_stock_products: number;
}

export interface AdminRecentOrder {
  id: string;
  order_number: string;
  user_id: string;
  status: string;
  total_amount: number;
  created_at: string;
}

export interface AdminDashboardResponse {
  customers: {
    total: number;
  };

  products: {
    total: number;
    active: number;
    inactive: number;
  };

  orders: {
    total: number;
    pending: number;
    confirmed: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
    returned: number;
  };

  revenue: {
    total: number;
    today: number;
    this_month: number;
    previous_month: number;
  };

  complaints: {
    total: number;
    open: number;
    in_progress: number;
    resolved: number;
    closed: number;
  };

  inventory: {
    total_units: number;
    low_stock_products: number;
    out_of_stock_products: number;
    expiring_batches_30_days: number;
  };
}

export async function getAdminDashboard(): Promise<AdminDashboardResponse> {
  const token = getAuthToken();

  return apiRequest<AdminDashboardResponse>("/admin/dashboard", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function getAdminProducts(): Promise<Product[]> {
  const token = getAuthToken();

  return apiRequest<Product[]>("/products/admin", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function deleteAdminProduct(productId: string): Promise<void> {
  const token = getAuthToken();

  await apiRequest(
    `/products/admin/${encodeURIComponent(productId)}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
}

export async function updateProductStatus(
  productId: string,
  productStatus: string
): Promise<Product> {
  const token = getAuthToken();

  return apiRequest<Product>(
    `/products/admin/${encodeURIComponent(
      productId
    )}/status?product_status=${encodeURIComponent(
      productStatus
    )}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
}

export interface CreateProductData {
  name: string;
  slug: string;
  sku: string;
  category_id: string;
  brand_id?: string | null;
  product_type: string;
  short_description?: string | null;
  description?: string | null;
  mrp: number;
  selling_price: number;
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
}

export async function createAdminProduct(
  data: CreateProductData
): Promise<Product> {
  const token = getAuthToken();

  return apiRequest<Product>("/products/admin", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
}

export async function updateAdminProduct(
  productId: string,
  data: Partial<Product>
): Promise<Product> {
  const token = getAuthToken();

  return apiRequest<Product>(
    `/products/admin/${encodeURIComponent(productId)}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }
  );
}

export async function getAdminProduct(
  productId: string
): Promise<Product> {
  const token = getAuthToken();

  return apiRequest<Product>(
    `/products/admin/${encodeURIComponent(productId)}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
}

export interface Batch {
  id: string;
  product_id: string;
  batch_number: string;
  quantity: number;
  manufacturing_date: string | null;
  expiry_date: string | null;
  is_active: boolean;
}

export interface InventoryMovement {
  id: string;
  product_id: string;
  batch_id: string;
  quantity: number;
  movement_type: string;
  reason: string | null;
  created_at: string;
}

export interface CreateBatchData {
  product_id: string;
  batch_number: string;
  quantity: number;
  manufacturing_date?: string | null;
  expiry_date?: string | null;
}

export interface InventoryAdjustmentData {
  batch_id: string;
  quantity: number;
  movement_type: string;
  reason?: string | null;
}

export async function getProductInventory(
  productId: string
): Promise<Batch[]> {
  const token = getAuthToken();

  return apiRequest<Batch[]>(
    `/inventory/admin/${encodeURIComponent(productId)}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
}

export async function createInventoryBatch(
  data: CreateBatchData
): Promise<Batch> {
  const token = getAuthToken();

  return apiRequest<Batch>("/inventory/admin/batches", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
}

export async function adjustInventory(
  data: InventoryAdjustmentData
): Promise<InventoryMovement> {
  const token = getAuthToken();

  return apiRequest<InventoryMovement>("/inventory/admin/adjust", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
}

export async function getInventoryMovements(
  productId: string
): Promise<InventoryMovement[]> {
  const token = getAuthToken();

  return apiRequest<InventoryMovement[]>(
    `/inventory/admin/${encodeURIComponent(productId)}/movements`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
}

export interface LowStockProduct {
  product_id: string;
  product_name: string;
  current_stock: number;
  reorder_level: number;
}

export async function getLowStockProducts(): Promise<LowStockProduct[]> {
  const token = getAuthToken();

  return apiRequest<LowStockProduct[]>(
    "/inventory/admin/low-stock",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
}

export interface AdminOrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface AdminOrder {
  id: string;
  user_id: string;
  order_number: string;
  status: string;
  subtotal: number;
  shipping_cost: number;
  total_amount: number;
  created_at: string;
  items?: AdminOrderItem[];
}

export interface OrderStatusUpdateData {
  status: string;
}

export async function getAdminOrders(): Promise<AdminOrder[]> {
  const token = getAuthToken();

  return apiRequest<AdminOrder[]>("/orders/admin", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function getAdminOrder(
  orderId: string
): Promise<AdminOrder> {
  const token = getAuthToken();

  return apiRequest<AdminOrder>(
    `/orders/admin/${encodeURIComponent(orderId)}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
}

export async function updateAdminOrderStatus(
  orderId: string,
  status: string
): Promise<AdminOrder> {
  const token = getAuthToken();

  return apiRequest<AdminOrder>(
    `/orders/admin/${encodeURIComponent(orderId)}/status`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        status,
      }),
    }
  );
}

export async function getAdminComplaints(): Promise<Complaint[]> {
  const token = getAuthToken();

  return apiRequest<Complaint[]>("/complaints/admin", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function updateAdminComplaint(
  complaintId: string,
  status: string,
  adminResponse: string
): Promise<Complaint> {
  const token = getAuthToken();

  return apiRequest<Complaint>(
    `/complaints/admin/${encodeURIComponent(complaintId)}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        status,
        admin_response: adminResponse,
      }),
    }
  );
}

export async function getAdminComplaint(
  complaintId: string
): Promise<Complaint> {
  const token = getAuthToken();

  return apiRequest<Complaint>(
    `/complaints/admin/${encodeURIComponent(complaintId)}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
}

// ==================== Notifications ====================

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  notification_type: string;
  is_read: boolean;
  created_at: string;
}

export async function getNotifications(): Promise<Notification[]> {
  const token = getAuthToken();

  return apiRequest<Notification[]>("/notifications", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function getUnreadNotificationCount(): Promise<number> {
  const token = getAuthToken();

  const data = await apiRequest<{ unread_count: number }>(
    "/notifications/unread-count",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return data.unread_count;
}

export async function markNotificationAsRead(
  notificationId: string
): Promise<Notification> {
  const token = getAuthToken();

  return apiRequest<Notification>(
    `/notifications/${encodeURIComponent(notificationId)}/read`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
}

export async function markAllNotificationsAsRead(): Promise<{
  message: string;
}> {
  const token = getAuthToken();

  return apiRequest<{ message: string }>("/notifications/read-all", {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

// ==================== Reviews ====================

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  order_id: string;
  rating: number;
  comment: string | null;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
}

export interface ReviewSummary {
  average_rating: number;
  review_count: number;
}

export interface CreateReviewData {
  product_id: string;
  order_id: string;
  rating: number;
  comment?: string;
}

export interface UpdateReviewData {
  rating: number;
  comment?: string;
}

export async function getProductReviews(
  productId: string
): Promise<Review[]> {
  return apiRequest<Review[]>(
    `/reviews/product/${encodeURIComponent(productId)}`
  );
}

export async function getProductReviewSummary(
  productId: string
): Promise<ReviewSummary> {
  return apiRequest<ReviewSummary>(
    `/reviews/product/${encodeURIComponent(productId)}/summary`
  );
}

export async function getMyReviews(): Promise<Review[]> {
  const token = getAuthToken();

  return apiRequest<Review[]>("/reviews/my", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function createReview(
  data: CreateReviewData
): Promise<Review> {
  const token = getAuthToken();

  return apiRequest<Review>("/reviews", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
}

export async function updateReview(
  reviewId: string,
  data: UpdateReviewData
): Promise<Review> {
  const token = getAuthToken();

  return apiRequest<Review>(
    `/reviews/${encodeURIComponent(reviewId)}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }
  );
}

export async function deleteReview(
  reviewId: string
): Promise<{ message: string }> {
  const token = getAuthToken();

  return apiRequest<{ message: string }>(
    `/reviews/${encodeURIComponent(reviewId)}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
}
