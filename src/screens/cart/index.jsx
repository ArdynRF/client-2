// app/cart/page.js
"use client";

import { useState, useEffect } from "react";
import CartList from "@/components/ui/CartList";
import { handleCartItems } from "@/actions/cartActions";
import Button from "@/components/ui/Button";
import Link from "next/link";

export default function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  

  const loadCart = async () => {
    try {
      const items = await handleCartItems();
      
      setCartItems(items || []);
    } catch (error) {
      console.error("Failed to load cart:", error);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadCart();
  }, []);
  // Handle select/deselect all
  const handleSelectAll = () => {
    if (selectedItems.length === cartItems.length) {
      // Deselect all
      setSelectedItems([]);
    } else {
      // Select all
      setSelectedItems(cartItems.map((item) => item.id));
    }
  };

  // Handle single item selection
  const handleSelectItem = (itemId) => {
    setSelectedItems((prev) => {
      if (prev.includes(itemId)) {
        return prev.filter((id) => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
  };

  // Handle quantity update
  const handleUpdateQuantity = (itemId, newQuantity) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  // Handle remove items
  const handleRemoveItems = async () => {
    if (selectedItems.length === 0) return;

    try {
      // TODO: Implement API call to remove items
      const response = await fetch("/api/cart/", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cartIds: selectedItems }),
      });

      if (response.ok) {
        // Remove from local state
        setCartItems((prev) =>
          prev.filter((item) => !selectedItems.includes(item.id))
        );
        setSelectedItems([]);
        alert("Items removed successfully");
      }
    } catch (error) {
      console.error("Failed to remove items:", error);
    }
  };

  // Calculate totals
  const calculateTotals = () => {
    const selected = cartItems.filter((item) =>
      selectedItems.includes(item.id)
    );

    const subtotal = selected.reduce((sum, item) => {
      return sum + (item.priceTotal || 0);
    }, 0);

    const shipping = 0; // Add shipping calculation if needed
    const total = subtotal + shipping;

    return { subtotal, shipping, total };
  };

  const { subtotal, shipping, total } = calculateTotals();

  if (loading) {
    return (
      <div className="my-10">
        <h1 className="text-3xl font-semibold">Cart</h1>
        <div className="text-center mt-10 text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="my-10 max-w-7xl mx-auto px-4">
      <h1 className="text-3xl font-semibold mb-6">Cart List</h1>

      {!cartItems || cartItems.length === 0 ? (
        <div className="text-center mt-10 text-gray-500 bg-white rounded-lg p-8 shadow-sm">
          <div className="text-lg mb-4">Your cart is empty.</div>
          <Link href="/products">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              Browse Products
            </Button>
          </Link>
        </div>
      ) : (
        <>
          {/* Cart Header */}
          <div className="bg-white rounded-t-lg shadow-sm p-4 mb-2 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="select-all"
                  checked={
                    selectedItems.length === cartItems.length &&
                    cartItems.length > 0
                  }
                  onChange={handleSelectAll}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <label
                  htmlFor="select-all"
                  className="ml-2 text-sm font-medium text-gray-900"
                >
                  Select All ({selectedItems.length}/{cartItems.length})
                </label>
              </div>
            </div>

            <div className="text-sm text-gray-600">
              Total Item: {cartItems.length}
            </div>
          </div>

          {/* Cart Items */}
          <div className="space-y-4">
            {cartItems.map((item) => (
              <CartList
                key={item.id}
                cartItem={item}
                isSelected={selectedItems.includes(item.id)}
                onSelect={() => handleSelectItem(item.id)}
                onUpdateQuantity={(newQuantity) =>
                  handleUpdateQuantity(item.id, newQuantity)
                }
                onRemoveSuccess={loadCart}
              />
            ))}
          </div>

          {/* Cart Summary Fixed */}
          <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>Rp {subtotal.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping cost</span>
                <span>Rp {shipping.toLocaleString("id-ID")}</span>
              </div>
              <div className="border-t pt-3 flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span>Rp {total.toLocaleString("id-ID")}</span>
              </div>
            </div>

            <Button
              className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white py-3"
              disabled={selectedItems.length === 0}
            >
              Continue To Payment ({selectedItems.length} item)
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
