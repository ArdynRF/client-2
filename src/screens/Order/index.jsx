"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCustomerData } from "@/actions/authActions";
import Button from "@/components/ui/Button";
import Image from "next/image";
import { getOrdersByUser } from "@/actions/checkoutActions";

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  const filters = [
    { id: "all", label: "All Orders", color: "gray" },
    { id: "processing", label: "Processing", color: "blue" },
    { id: "payment", label: "Payment Pending", color: "yellow" },
    { id: "shipped", label: "Shipped", color: "purple" },
    { id: "delivered", label: "Delivered", color: "green" },
    { id: "cancelled", label: "Cancelled", color: "red" },
  ];

  const fetchOrders = async (page = 1, status = "all") => {
    try {
      setLoading(true);

      // Gunakan fungsi getOrdersByUser
      const result = await getOrdersByUser(status, page, pagination.limit);
      console.log("Fetched orders:", result);

      if (result.success) {
        setOrders(result.data || []);
        setPagination(result.pagination || pagination);
      } else {
        if (result.message === "User not authenticated") {
          router.push("/login");
          return;
        }
        setError(result.message || "Failed to load orders");

        // Fallback ke localStorage
        const localOrders = JSON.parse(
          localStorage.getItem("orderHistory") || "[]"
        );
        setOrders(localOrders);
      }
    } catch (err) {
      console.error("Fetch orders error:", err);
      setError("Failed to load orders");

      // Fallback ke localStorage
      const localOrders = JSON.parse(
        localStorage.getItem("orderHistory") || "[]"
      );
      setOrders(localOrders);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(1, activeFilter);
  }, [activeFilter]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    const colors = {
      payment: "bg-yellow-100 text-yellow-800 border-yellow-200",
      processing: "bg-blue-100 text-blue-800 border-blue-200",
      shipped: "bg-purple-100 text-purple-800 border-purple-200",
      delivered: "bg-green-100 text-green-800 border-green-200",
      cancelled: "bg-red-100 text-red-800 border-red-200",
    };

    const labels = {
      payment: "Payment Pending",
      processing: "Processing",
      shipped: "Shipped",
      delivered: "Delivered",
      cancelled: "Cancelled",
    };

    return (
      <span
        className={`px-3 py-1 text-xs font-medium rounded-full border ${colors[status] || "bg-gray-100 text-gray-800"}`}
      >
        {labels[status] || status}
      </span>
    );
  };

  const getPaymentStatusBadge = (status) => {
    const colors = {
      payment: "bg-yellow-100 text-yellow-800",
      down_payment_paid: "bg-blue-100 text-blue-800",
      fully_paid: "bg-green-100 text-green-800",
      refunded: "bg-red-100 text-red-800",
    };

    const labels = {
      payment: "Payment Pending",
      down_payment_paid: "DP Paid",
      fully_paid: "Fully Paid",
      refunded: "Refunded",
    };

    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded ${colors[status] || "bg-gray-100 text-gray-800"}`}
      >
        {labels[status] || status}
      </span>
    );
  };

  const handleViewOrder = (orderId) => {
    router.push(`/orders/${orderId}`);
  };

  const handleLoadMore = () => {
    if (pagination.page < pagination.totalPages) {
      const nextPage = pagination.page + 1;
      fetchOrders(nextPage, activeFilter);
    }
  };

  if (loading && orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading your orders...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
            <p className="text-gray-600 mt-2">
              View and manage all your orders
            </p>
          </div>

          {/* Filter Buttons */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              {filters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeFilter === filter.id
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* Order Count */}
          <div className="mb-6 p-4 bg-white rounded-lg shadow-sm">
            <div className="flex justify-between items-center">
              <div>
                <span className="font-medium text-gray-900">
                  {orders.length} order{orders.length !== 1 ? "s" : ""} found
                </span>
                {activeFilter !== "all" && (
                  <span className="ml-2 text-sm text-gray-600">
                    (Filtered by: {activeFilter})
                  </span>
                )}
              </div>
              {pagination.total > 0 && (
                <div className="text-sm text-gray-600">
                  Page {pagination.page} of {pagination.totalPages}
                </div>
              )}
            </div>
          </div>

          {/* Orders List */}
          {error && !orders.length ? (
            <div className="text-center py-10 bg-white rounded-lg shadow-sm">
              <div className="text-red-600 mb-4">{error}</div>
              <Button
                onClick={() => fetchOrders(1, activeFilter)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Try Again
              </Button>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-lg shadow-sm">
              <div className="w-24 h-24 mx-auto mb-4 text-gray-400">
                <svg
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  className="w-full h-full"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No orders found
              </h3>
              <p className="text-gray-600 mb-6">
                {activeFilter !== "all"
                  ? `You don't have any ${activeFilter} orders`
                  : "You haven't placed any orders yet"}
              </p>
              <Button
                onClick={() => router.push("/")}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Browse Products
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
                >
                  {/* Order Header */}
                  <div className="p-4 border-b border-gray-100 bg-gray-50">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center space-x-3">
                          <h3 className="font-semibold text-gray-900">
                            Order #{order.orderNumber}
                          </h3>
                          {getStatusBadge(order.status)}
                          {getPaymentStatusBadge(order.paymentStatus)}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          Placed on {formatDate(order.orderDate)}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-blue-600">
                          {formatCurrency(order.total)}
                        </div>
                        <p className="text-sm text-gray-600">
                          {order.items?.length || 0} item
                          {order.items?.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="p-4">
                    <div className="space-y-4">
                      {order.items?.slice(0, 3).map((item) => (
                        <div
                          key={item.id}
                          className="flex items-start space-x-4"
                        >
                          <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                            {/* {item.product?.image ? (
                              <Image
                                src={
                                  item.product.image.startsWith("http")
                                    ? item.product.image
                                    : `${process.env.NEXT_PUBLIC_BASE_URL || ""}/${item.product.image}`
                                }
                                alt={item.product.name}
                                width={64}
                                height={64}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src =
                                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 24 24' fill='%23e5e7eb'%3E%3Crect width='24' height='24' rx='4'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='10' fill='%239ca3af'%3EIMG%3C/text%3E%3C/svg%3E";
                                }}
                              /> */}
                            {/* ) : ( */}
                            <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                              <span className="text-gray-500 text-xs">IMG</span>
                            </div>
                            {/* )} */}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">
                              {item.product?.name || "Unknown Product"}
                            </h4>
                            <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                              <span>Qty: {item.quantity}</span>
                              {item.color && <span>Color: {item.color}</span>}
                              <span>
                                Price: {formatCurrency(item.unitPrice)}
                              </span>
                              <span
                                className={`px-2 py-1 text-xs font-medium rounded ${item.productStatus === "Pre Order" ? "bg-yellow-100 text-yellow-800" : item.productStatus === "Sample Order" ? "bg-purple-100 text-purple-800" : "bg-green-100 text-green-800"}`}
                              >
                                {item.productStatus
                                  ? `${item.productStatus}`
                                  : ""}
                              </span>
                            </div>
                          </div>
                          <div className="font-medium text-gray-900">
                            {formatCurrency(item.totalPrice)}
                          </div>
                        </div>
                      ))}

                      {order.items?.length > 3 && (
                        <div className="text-center pt-2 border-t border-gray-100">
                          <p className="text-sm text-gray-600">
                            + {order.items.length - 3} more item
                            {order.items.length - 3 !== 1 ? "s" : ""}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Shipping Info */}
                    <div className="mt-6 pt-4 border-t border-gray-100">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">
                            Shipping Address
                          </h4>
                          {order.shippingAddress && (
                            <div className="text-sm text-gray-600">
                              <p className="font-medium">
                                {order.shippingAddress.recipient}
                              </p>
                              <p>{order.shippingAddress.address}</p>
                              <p>
                                {order.shippingAddress.city},{" "}
                                {order.shippingAddress.postalCode}
                              </p>
                              <p>📞 {order.shippingAddress.phone}</p>
                            </div>
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">
                            Shipping Method
                          </h4>
                          {order.shippingMethod && (
                            <div className="text-sm text-gray-600">
                              <p className="font-medium">
                                {order.shippingMethod.name}
                              </p>
                              <p>{order.shippingMethod.description}</p>
                              <p className="text-gray-500">
                                Cost: {formatCurrency(order.shippingCost)}
                              </p>
                              {order.estimatedDelivery && (
                                <p className="text-gray-500">
                                  Est. delivery:{" "}
                                  {formatDate(order.estimatedDelivery)}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">
                            Billing Address
                          </h4>
                          {order.billingAddress && (
                            <div className="text-sm text-gray-600">
                              <p className="font-medium">
                                NPWP : {order.billingAddress.NPWP || "-"}
                              </p>
                              <p>NIK : {order.billingAddress.NIK || "-"}</p>
                              
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Footer */}
                  <div className="p-4 border-t border-gray-100 bg-gray-50">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="text-sm text-gray-600">
                        <div className="font-medium mb-1">Payment Summary:</div>
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span>Subtotal:</span>
                            <span>{formatCurrency(order.subtotal)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Shipping:</span>
                            <span>{formatCurrency(order.shippingCost)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Tax:</span>
                            <span>{formatCurrency(order.tax)}</span>
                          </div>
                          <div className="flex justify-between font-bold border-t pt-1">
                            <span>Total:</span>
                            <span>{formatCurrency(order.total)}</span>
                          </div>
                          {order.downPayment && (
                            <div className="flex justify-between text-green-600">
                              <span>Down Payment Paid:</span>
                              <span>{formatCurrency(order.downPayment)}</span>
                            </div>
                          )}
                          {order.remainingPayment && (
                            <div className="flex justify-between">
                              <span>Remaining Payment:</span>
                              <span>
                                {formatCurrency(order.remainingPayment)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-3">
                        <Button
                          onClick={() => handleViewOrder(order.id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          View Details
                        </Button>
                        {(order.status === "payment" ||
                          order.status === "processing") && (
                          <Button
                            onClick={() =>
                              router.push(`/orders/${order.id}/track`)
                            }
                            className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                          >
                            Track Order
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Load More Button */}
          {pagination.page < pagination.totalPages && (
            <div className="mt-6 text-center">
              <Button
                onClick={handleLoadMore}
                className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                disabled={loading}
              >
                {loading ? "Loading..." : "Load More Orders"}
              </Button>
            </div>
          )}

          {/* Back to Home */}
          <div className="mt-8 text-center">
            <button
              onClick={() => router.push("/")}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
