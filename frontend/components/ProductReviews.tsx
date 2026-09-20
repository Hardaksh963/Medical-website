"use client";

import { useEffect, useState } from "react";

import {
  createReview,
  getAuthToken,
  getOrders,
  getMyReviews,
  getProductReviews,
  getProductReviewSummary,
  Review,
  ReviewSummary,
} from "@/lib/api";

interface ProductReviewsProps {
  productId: string;
}

interface EligibleOrder {
  id: string;
  order_number: string;
  status: string;
  created_at: string;
  items?: {
    product_id: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
  }[];
}

export default function ProductReviews({
  productId,
}: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [summary, setSummary] = useState<ReviewSummary>({
    average_rating: 0,
    review_count: 0,
  });

  const [eligibleOrders, setEligibleOrders] = useState<EligibleOrder[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState("");

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [loggedIn, setLoggedIn] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);

  useEffect(() => {
    loadReviews();
  }, [productId]);

  async function loadReviews() {
    try {
      setLoading(true);
      setError("");

      const [reviewData, summaryData] = await Promise.all([
        getProductReviews(productId),
        getProductReviewSummary(productId),
      ]);

      setReviews(reviewData);
      setSummary(summaryData);

      const token = getAuthToken();

      if (!token) {
        setLoggedIn(false);
        setEligibleOrders([]);
        setSelectedOrderId("");
        return;
      }

      setLoggedIn(true);

      await loadCustomerReviewData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load product reviews."
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadCustomerReviewData() {
    try {
      setOrdersLoading(true);

      const [myReviews, myOrders] = await Promise.all([
        getMyReviews(),
        getOrders(),
      ]);

      // Check whether the customer has already reviewed this product.
      const existingReview = myReviews.find(
        (review) => review.product_id === productId
      );

      setHasReviewed(Boolean(existingReview));

      if (existingReview) {
        setEligibleOrders([]);
        setSelectedOrderId("");
        return;
      }

      /*
       * Find customer's orders containing this product.
       *
       * Cancelled and returned orders are not considered eligible
       * for submitting a product review.
       */
      const eligible = (myOrders as EligibleOrder[]).filter((order) => {
        const status = order.status?.toUpperCase();

        if (status === "CANCELLED" || status === "RETURNED") {
          return false;
        }

        return (
          order.items?.some(
            (item) => item.product_id === productId
          ) ?? false
        );
      });

      setEligibleOrders(eligible);

      // Automatically select the first eligible order.
      if (eligible.length > 0) {
        setSelectedOrderId(eligible[0].id);
      } else {
        setSelectedOrderId("");
      }
    } catch (err) {
      setEligibleOrders([]);
      setSelectedOrderId("");

      console.error(
        "Failed to load customer review data:",
        err
      );
    } finally {
      setOrdersLoading(false);
    }
  }

  async function handleSubmitReview() {
    if (!loggedIn) {
      setError("Please login to submit a review.");
      return;
    }

    if (!selectedOrderId) {
      setError(
        "You need an eligible order containing this product to submit a review."
      );
      return;
    }

    if (!comment.trim()) {
      setError("Please enter a review comment.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setMessage("");

      await createReview({
        product_id: productId,
        order_id: selectedOrderId,
        rating,
        comment: comment.trim(),
      });

      setMessage("Review submitted successfully.");

      setComment("");
      setRating(5);
      setSelectedOrderId("");
      setHasReviewed(true);
      setEligibleOrders([]);

      await loadReviews();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to submit review."
      );
    } finally {
      setSubmitting(false);
    }
  }

  function renderStars(value: number) {
    const rounded = Math.max(
      0,
      Math.min(5, Math.round(value))
    );

    return (
      <span className="text-yellow-500">
        {"★".repeat(rounded)}
        <span className="text-gray-300">
          {"★".repeat(5 - rounded)}
        </span>
      </span>
    );
  }

  if (loading) {
    return (
      <section className="mt-8 rounded-2xl border bg-white p-6">
        <p className="text-black">
          Loading reviews...
        </p>
      </section>
    );
  }

  return (
    <section className="mt-8 rounded-2xl border bg-white p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-black">
          Customer Reviews
        </h2>

        <div className="mt-2 flex items-center gap-3">
          <span className="text-2xl font-semibold">
            {Number(summary.average_rating).toFixed(1)}
          </span>

          <span className="text-lg">
            {renderStars(summary.average_rating)}
          </span>

          <span className="text-sm text-black">
            ({summary.review_count}{" "}
            {summary.review_count === 1
              ? "review"
              : "reviews"})
          </span>
        </div>
      </div>

      {/* Review submission */}
      <div className="mb-8 rounded-xl border bg-gray-50 p-5">
        <h3 className="mb-4 text-black font-semibold">
          Write a Review
        </h3>

        {!loggedIn ? (
          <p className="text-sm text-black">
            Please login to submit a review.
          </p>
        ) : hasReviewed ? (
          <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            You have already reviewed this product.
          </div>
        ) : ordersLoading ? (
          <p className="text-sm text-black">
            Checking your orders...
          </p>
        ) : eligibleOrders.length === 0 ? (
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
            You need to purchase this product before you can
            submit a review.
          </div>
        ) : (
          <div className="space-y-4">
            {/* Order selection */}
            <div>
              <label
                htmlFor="review-order"
                className="mb-2 block text-sm font-medium text-black"
              >
                Select your order
              </label>

              <select
                id="review-order"
                value={selectedOrderId}
                onChange={(event) =>
                  setSelectedOrderId(event.target.value)
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-black outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">
                  Select an order
                </option>

                {eligibleOrders.map((order) => (
                  <option key={order.id} value={order.id}>
                    {order.order_number} —{" "}
                    {new Date(
                      order.created_at
                    ).toLocaleDateString()}
                  </option>
                ))}
              </select>
            </div>

            {/* Rating */}
            <div>
              <label
                htmlFor="review-rating"
                className="mb-2 block text-sm font-medium text-black"
              >
                Rating
              </label>

              <select
                id="review-rating"
                value={rating}
                onChange={(event) =>
                  setRating(Number(event.target.value))
                }
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-black outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value={5}>5 — Excellent</option>
                <option value={4}>4 — Very Good</option>
                <option value={3}>3 — Good</option>
                <option value={2}>2 — Fair</option>
                <option value={1}>1 — Poor</option>
              </select>
            </div>

            {/* Comment */}
            <div>
              <label
                htmlFor="review-comment"
                className="mb-2 block text-sm font-medium text-black"
              >
                Your Review
              </label>

              <textarea
                id="review-comment"
                value={comment}
                onChange={(event) =>
                  setComment(event.target.value)
                }
                rows={4}
                placeholder="Share your experience with this product..."
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-black outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <button
              type="button"
              onClick={handleSubmitReview}
              disabled={submitting || !selectedOrderId}
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting
                ? "Submitting..."
                : "Submit Review"}
            </button>
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {message && (
          <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
            {message}
          </div>
        )}
      </div>

      {/* Existing reviews */}
      <div>
        <h3 className="mb-4 text-black font-semibold">
          Reviews
        </h3>

        {reviews.length === 0 ? (
          <p className="text-sm text-black">
            No reviews yet. Be the first to review this
            product.
          </p>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="border-b pb-4 last:border-b-0"
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm font-medium text-black">
                    Verified Customer
                  </span>

                  <span className="text-xs text-black">
                    {new Date(
                      review.created_at
                    ).toLocaleDateString()}
                  </span>
                </div>

                <div className="mt-1">
                  {renderStars(review.rating)}
                </div>

                {review.comment && (
                  <p className="mt-2 text-sm leading-6 text-black">
                    {review.comment}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
