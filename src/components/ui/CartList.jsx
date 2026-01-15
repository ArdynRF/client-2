// components/CartList.jsx - Alternatif lebih sederhana
"use client";

import { useState } from "react";
import Image from "next/image";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { handleRemoveSingleItem } from "@/actions/cartActions";

export default function CartList({
  cartItem,
  isSelected,
  onSelect,
  onUpdateQuantity,
}) {
  const [quantity, setQuantity] = useState(cartItem.quantity || 1);
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

  const isDirectBuy = cartItem.status === "direct";

  const handleQuantityChange = (newQuantity) => {
    const validQuantity = Math.max(1, newQuantity);
    setQuantity(validQuantity);

    if (onUpdateQuantity && isDirectBuy) {
      onUpdateQuantity(validQuantity);
    }
  };

  const handleRemove = async () => {
    await handleRemoveSingleItem(cartItem.id);
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
          <div className="relative w-24 h-24 md:w-28 md:h-28">
            <Image
              className="object-cover rounded-lg"
              src={
                cartItem.product?.image
                  ? `${BASE_URL}/${cartItem.product.image}`
                  : "/prod-img.jpg"
              }
              alt={cartItem.product?.name || "Product"}
              fill
              sizes="(max-width: 768px) 96px, 112px"
              style={{ objectFit: "cover" }}
            />
          </div>
        </div>

        {/* Product Info */}
        <div className="flex-grow">
          <div className="flex flex-col md:flex-row md:justify-between">
            <div className="flex-grow">
              <Link href={`/products/${cartItem.productId}`}>
                <h2 className="text-lg font-medium text-gray-900 hover:text-blue-600">
                  {cartItem.product?.name || "Product Name"}
                </h2>
              </Link>

              <div className="flex items-center mt-1 space-x-2">
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    isDirectBuy
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {isDirectBuy ? "Direct Buy" : "Negotiate"}
                </span>
                {!isDirectBuy && (
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                    Approved
                  </span>
                )}

                {cartItem.color && (
                  <div className="flex items-center text-sm text-gray-600">
                    <div
                      className="w-3 h-3 rounded-full mr-1 border border-gray-300"
                      style={{ backgroundColor: cartItem.color }}
                    />
                    {cartItem.color}
                  </div>
                )}
              </div>

              <div className="mt-2 flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="text-gray-700">Quantity:</span>

                  <span className="text-gray-900 font-medium">
                    {cartItem.quantity} pcs
                  </span>
                </div>

                {!isDirectBuy && (
                  <span className="text-sm text-amber-600">
                    (Tidak bisa diubah)
                  </span>
                )}
              </div>

              <div className="text-sm text-gray-400 mt-2">
                Added: {new Date(cartItem.addedAt).toLocaleDateString("id-ID")}
              </div>
            </div>

            {/* Price & Actions */}
            <div className="mt-4 md:mt-0 md:text-right">
              <div className="text-xl font-bold text-gray-900">
                Rp {cartItem.priceTotal?.toLocaleString("id-ID") || "0"}
              </div>
              <div className="text-sm text-gray-500">
                Rp{" "}
                {(cartItem.priceTotal / cartItem.quantity)?.toLocaleString(
                  "id-ID"
                ) || "0"}{" "}
                / pcs
              </div>

              <div className="mt-3 items-end">
                <Button
                  onClick={handleRemove}
                  className="px-3 py-1.5 text-sm bg-red-50 text-red-600 hover:bg-red-100"
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
