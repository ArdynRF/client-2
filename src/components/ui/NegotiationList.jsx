// components/NegotiationList.jsx
"use client";

import { useState } from "react";
import Image from "next/image";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { handleDeleteNegotiation } from "@/actions/negotiationActions";

export default function NegotiationList({
  negotiation,
  isSelected,
  onSelect,
  onMoveToCart,
  onReject,
  onRenegotiate,
  onRemoveSuccess,
}) {
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

  // Determine status styling
  const getStatusStyle = (status) => {
    switch (status) {
      case "pending":
        return {
          bg: "bg-yellow-100",
          text: "text-yellow-800",
          label: "Pending",
        };
      case "accepted":
        return {
          bg: "bg-green-100",
          text: "text-green-800",
          label: "Accepted",
        };
      case "rejected":
        return { bg: "bg-red-100", text: "text-red-800", label: "Rejected" };
      case "expired":
        return { bg: "bg-gray-100", text: "text-gray-800", label: "Expired" };
      case "moved_to_cart":
        return { bg: "bg-blue-100", text: "text-blue-800", label: "In Cart" };
      default:
        return { bg: "bg-gray-100", text: "text-gray-800", label: status };
    }
  };

  const statusStyle = getStatusStyle(negotiation.status);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID");
  };

  // Calculate days remaining
  const getDaysRemaining = () => {
    if (!negotiation.expiresAt || negotiation.status !== "pending") return null;
    const now = new Date();
    const expires = new Date(negotiation.expiresAt);
    const diffTime = expires - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const daysRemaining = getDaysRemaining();

  // Handle delete single negotiation
  const handleDelete = async () => {
    if (!confirm("Delete this negotiation?")) return;

    try {
      const response = await handleDeleteNegotiation([negotiation.id]);
      if (response.success) {
        if (onRemoveSuccess) {
          alert("Selected negotiations deleted successfully.");
          onRemoveSuccess();
        }
      }
    } catch (error) {
      console.error("Error deleting negotiation:", error);
      alert("Error deleting negotiation. Please try again.");
    }
  };

  return (
    <div
      className={`w-full bg-white rounded-lg border ${
        isSelected ? "border-blue-500 ring-2 ring-blue-100" : "border-gray-200"
      } p-4 mb-4`}
    >
      <div className="flex items-start space-x-4">
        {/* Checkbox */}
        <div className="flex-shrink-0 pt-1">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onSelect}
            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
        </div>

        {/* Product Image */}
        <div className="flex-shrink-0">
          <div className="relative w-20 h-20 md:w-24 md:h-24">
            <Image
              className="object-cover rounded-lg"
              src={
                negotiation.product?.image
                  ? `${BASE_URL}/${negotiation.product.image}`
                  : "/prod-img.jpg"
              }
              alt={negotiation.product?.name || "Product"}
              fill
              sizes="(max-width: 768px) 80px, 96px"
              style={{ objectFit: "cover" }}
            />
          </div>
        </div>

        {/* Negotiation Info */}
        <div className="flex-grow">
          <div className="flex flex-col md:flex-row md:justify-between">
            <div className="flex-grow">
              <div className="flex items-start justify-between">
                <div>
                  <Link href={`/products/${negotiation.productId}`}>
                    <h2 className="text-lg font-medium text-gray-900 hover:text-blue-600">
                      {negotiation.product?.name || "Product Name"}
                    </h2>
                  </Link>

                  <div className="flex items-center mt-1 space-x-2">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${statusStyle.bg} ${statusStyle.text}`}
                    >
                      {statusStyle.label}
                    </span>

                    {negotiation.color && (
                      <div className="flex items-center text-sm text-gray-600">
                        <div
                          className="w-3 h-3 rounded-full mr-1 border border-gray-300"
                          style={{ backgroundColor: negotiation.color }}
                        />
                        {negotiation.color}
                      </div>
                    )}

                    {/* Days remaining for pending negotiations */}
                    {negotiation.status === "pending" &&
                      daysRemaining !== null && (
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            daysRemaining <= 2
                              ? "bg-red-100 text-red-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {daysRemaining} day(s) left
                        </span>
                      )}
                  </div>
                </div>

                {/* Price Information */}
                <div className="text-right mt-2 md:mt-0">
                  <div className="text-xl font-bold text-gray-900">
                    Rp{" "}
                    {negotiation.offeredPrice?.toLocaleString("id-ID") || "0"}
                  </div>
                  <div className="text-sm text-gray-500">
                    Your offer per unit
                  </div>
                  {negotiation.sellerPrice && (
                    <div className="text-sm mt-1">
                      <span className="text-gray-600">Seller: </span>
                      <span className="font-medium">
                        Rp {negotiation.sellerPrice.toLocaleString("id-ID")}
                      </span>
                    </div>
                  )}
                  {negotiation.finalPrice && (
                    <div className="text-sm mt-1 text-green-600 font-medium">
                      Final: Rp {negotiation.finalPrice.toLocaleString("id-ID")}
                    </div>
                  )}
                </div>
              </div>

              {/* Negotiation Details */}
              <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="text-sm">
                  <div className="text-gray-500">Quantity</div>
                  <div className="font-medium">{negotiation.quantity} pcs</div>
                </div>
                <div className="text-sm">
                  <div className="text-gray-500">Total Offer</div>
                  <div className="font-medium">
                    Rp{" "}
                    {(
                      negotiation.offeredPrice * negotiation.quantity
                    ).toLocaleString("id-ID")}
                  </div>
                </div>
                <div className="text-sm">
                  <div className="text-gray-500">Created</div>
                  <div className="font-medium">
                    {formatDate(negotiation.createdAt)}
                  </div>
                </div>
                <div className="text-sm">
                  <div className="text-gray-500">Expires</div>
                  <div className="font-medium">
                    {formatDate(negotiation.expiresAt)}
                  </div>
                </div>
              </div>

              {/* Notes */}
              {negotiation.notes && (
                <div className="mt-3 p-2 bg-gray-50 rounded text-sm">
                  <div className="text-gray-600 font-medium">Your note:</div>
                  <div className="text-gray-700">{negotiation.notes}</div>
                </div>
              )}

              {/* Original Product Price Comparison */}
              {negotiation.product?.mrp && (
                <div className="mt-2 text-sm">
                  <span className="text-gray-600">Original price: </span>
                  <span className="line-through">
                    Rp {negotiation.product.mrp.toLocaleString("id-ID")}
                  </span>
                  <span
                    className={`ml-2 ${
                      negotiation.offeredPrice < negotiation.product.mrp
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    (
                    {(
                      ((negotiation.offeredPrice - negotiation.product.mrp) /
                        negotiation.product.mrp) *
                      100
                    ).toFixed(1)}
                    %)
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
            {/* Delete button - hidden for accepted status */}
            {negotiation.status !== "accepted" &&
              negotiation.status !== "moved_to_cart" && (
                <Button
                  onClick={handleDelete}
                  className="px-3 py-1.5 text-sm bg-red-50 text-red-600 hover:bg-red-100"
                >
                  Delete
                </Button>
              )}

            {/* Move to Cart button - only for accepted status */}
            {negotiation.status === "accepted" && (
              <Button
                onClick={() => onMoveToCart(negotiation.id)}
                className="px-3 py-1.5 text-sm bg-green-600 text-white hover:bg-green-700"
              >
                Move to Cart
              </Button>
            )}

            {/* Reject button - only for seller/admin, but showing as example */}
            {negotiation.status === "pending" && (
              <Button
                onClick={() => onReject(negotiation.id)}
                className="px-3 py-1.5 text-sm bg-red-600 text-white hover:bg-red-700"
              >
                Cancel
              </Button>
            )}

            {/* Renegotiate button - only for rejected status */}
            {negotiation.status === "rejected" && (
              <Button
                onClick={() => onRenegotiate(negotiation.id)}
                className="px-3 py-1.5 text-sm bg-blue-600 text-white hover:bg-blue-700"
              >
                Renegotiate
              </Button>
            )}

            {/* View Product button */}
            <Link href={`/product/${negotiation.productId}`}>
              <Button className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200">
                View Product
              </Button>
            </Link>

            {/* Status Message */}
            <div className="ml-auto text-sm text-gray-500 self-center">
              {negotiation.respondedAt && (
                <>Responded: {formatDate(negotiation.respondedAt)}</>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
