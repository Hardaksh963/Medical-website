"use client";

import { useEffect, useState } from "react";
import {
  createReview,
  getAuthToken,
  getMyReviews,
  getProductReviewSummary,
  getProductReviews,
  Review,
  ReviewSummary,
} from "@/lib/api";

interface ProductReviewsProps {
  productId: string;
}

export default function ProductReviews({
  productId,
}: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [summary, setSummary] = useState<ReviewSummary>({
    average_rating: 0,
    review_count: 0,
  });

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [orderId, setOrderId] = useState("");

  const [loading, setLoading] = useState(true);
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

      if (token) {
        setLoggedIn(true);

        try {
          const myReviews = await getMyReviews();

          const existingReview = myReviews.find(
            (review) => review.product_id === productId
          );

          if (existingReview) {
            setHasReviewed(true);
          }
        } catch {
          setHasReviewed(false);
        }
      } else {
        setLoggedIn(false);
      }
    } catch (err) {
      console.error("Failed to load reviews:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load reviews."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitReview() {
    if (!loggedIn) {
      setError("Please login to submit a review.");
      return;
    }

    if (!orderId.trim()) {
      setError("Please enter the order ID for this purchase.");
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
        order_id: orderId.trim(),
        rating,
        comment: comment.trim(),
      });

      setMessage("Review submitted successfully.");
      setComment("");
      setOrderId("");
      setRating(5);
      setHasReviewed(true);

      await loadReviews();
    } catch (err) {
      console.error("Failed to submit review:", err);

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
    return (
      <span className="text-yellow-500">
        {"★".repeat(Math.round(value))}
        <span className="text-gray-300">
          {"★".repeat(5 - Math.round(value))}
        </span>
      </span>
    );
  }

  if (loading) {
    return (
      <section className="mt-10 border-t pt-8">
        <h2 className="text-xl font-bold text-gray-900">
          Customer Reviews
        </h2>

        <p className="mt-4 text-sm text-gray-500">
          Loading reviews...
        </p>
      </section>
    );
  }

  return (
    <section className="mt-10 border-t pt-8">

      {/* Summary */}
      <div className="flex flex-col gap-6 rounded-xl border bg-white p-6 sm:flex-row sm:items-center">

        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Customer Reviews
          </h2>

          <div className="mt-3 flex items-center gap-3">
            <span className="text-3xl font-bold text-gray-900">
              {summary.average_rating.toFixed(1)}
            </span>

            <div>
              <div className="text-lg">
                {renderStars(summary.average_rating)}
              </div>

              <p className="text-sm text-gray-500">
                {summary.review_count}{" "}
                {summary.review_count === 1
                  ? "review"
                  : "reviews"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Success */}
      {message && (
        <div className="mt-5 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          {message}
        </div>
      )}

      {/* Review form */}
      {loggedIn && !hasReviewed && (
        <div className="mt-6 rounded-xl border bg-white p-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Write a Review
          </h3>

          <div className="mt-5">
            <label className="block text-sm font-medium text-gray-700">
              Rating
            </label>

            <select
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="mt-2 rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
            >
              <option value={5}>★★★★★ - 5</option>
              <option value={4}>★★★★☆ - 4</option>
              <option value={3}>★★★☆☆ - 3</option>
              <option value={2}>★★☆☆☆ - 2</option>
              <option value={1}>★☆☆☆☆ - 1</option>
            </select>
          </div>

          <div className="mt-5">
            <label className="block text-sm font-medium text-gray-700">
              Order ID
            </label>

            <input
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="Enter the order ID containing this product"
              className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />

            <p className="mt-1 text-xs text-gray-500">
              You can find the order ID in My Orders.
            </p>
          </div>

          <div className="mt-5">
            <label className="block text-sm font-medium text-gray-700">
              Review
            </label>

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              placeholder="Share your experience with this product..."
              className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <button
            type="button"
            onClick={handleSubmitReview}
            disabled={submitting}
            className="mt-5 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
        </div>
      )}

      {/* Login message */}
      {!loggedIn && (
        <div className="mt-6 rounded-xl border bg-gray-50 p-5">
          <p className="text-sm text-gray-600">
            Login to write a review for this product.
          </p>
        </div>
      )}

      {/* Already reviewed */}
      {loggedIn && hasReviewed && (
        <div className="mt-6 rounded-xl border bg-gray-50 p-5">
          <p className="text-sm text-gray-600">
            You have already reviewed this product.
          </p>
        </div>
      )}

      {/* Reviews */}
      <div className="mt-8">
        {reviews.length === 0 ? (
          <div className="rounded-xl border bg-white p-8 text-center">
            <p className="text-gray-500">
              No reviews yet. Be the first to review this product.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="rounded-xl border bg-white p-5"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="text-lg">
                      {renderStars(review.rating)}
                    </div>

                    <p className="mt-1 text-xs text-gray-500">
                      {new Date(
                        review.created_at
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {review.comment && (
                  <p className="mt-4 text-sm leading-6 text-gray-700">
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
