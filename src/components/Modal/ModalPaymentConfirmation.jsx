"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ModalPaymentConfirmation({
  isOpen,
  onClose,
  checkoutData,
  onConfirmPayment,
}) {
  const router = useRouter();
  const [isConfirming, setIsConfirming] = useState(false);
  const [downPayment, setDownPayment] = useState(0);
  const [remainingPayment, setRemainingPayment] = useState(0);

  // Calculate DP 30% when modal opens
  useEffect(() => {
    if (isOpen && checkoutData) {
      const dp = checkoutData.total * 0.3;
      setDownPayment(dp);
      setRemainingPayment(checkoutData.total - dp);
    }
  }, [isOpen, checkoutData]);

  const handleConfirmPayment = async () => {
    if (!checkoutData) return;

    setIsConfirming(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Create order data
      const orderData = {
        ...checkoutData,
        downPayment: downPayment,
        remainingPayment: remainingPayment,
        paymentStatus: "down_payment_paid",
        orderStatus: "processing",
        orderDate: new Date().toISOString(),
        orderNumber: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      };

      // Save to localStorage for order history
      const existingOrders = JSON.parse(
        localStorage.getItem("orderHistory") || "[]"
      );
      localStorage.setItem(
        "orderHistory",
        JSON.stringify([orderData, ...existingOrders])
      );

      // Call parent handler
      if (onConfirmPayment) {
        onConfirmPayment(orderData);
      }

      // Close modal
      onClose();

      // Redirect to order history
      //   router.push("/orders");

      // Show success message
    //   alert(
    //     "Pembayaran DP 30% berhasil dikonfirmasi! Pesanan Anda sedang diproses."
    //   );
    } catch (error) {
      console.error("Payment confirmation error:", error);
      alert("Terjadi kesalahan saat mengkonfirmasi pembayaran.");
    } finally {
      setIsConfirming(false);
    }
  };

  if (!isOpen || !checkoutData) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-gray-900/70 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div
            className="relative bg-white rounded-lg shadow-xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Konfirmasi Pembayaran
                </h3>
                <p className="text-sm text-gray-600">
                  Selesaikan pembayaran untuk melanjutkan pesanan
                </p>
              </div>
              <button
                type="button"
                className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center"
                onClick={onClose}
              >
                <svg
                  className="w-3 h-3"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 14 14"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                  />
                </svg>
                <span className="sr-only">Close modal</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 md:p-5 space-y-4">
              {/* Order Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">
                  Ringkasan Pesanan
                </h4>

                {/* Items */}
                <div className="mb-3">
                  <div className="text-sm font-medium text-gray-700 mb-2">
                    Item Pesanan:
                  </div>
                  {checkoutData.items?.map((item, index) => (
                    <div
                      key={item.cartId || index}
                      className="flex justify-between text-sm mb-1"
                    >
                      <span className="text-gray-600 truncate max-w-[200px]">
                        {item.product?.name || "Product"} × {item.quantity}
                      </span>
                      <span className="font-medium">
                        Rp {item.priceTotal.toLocaleString("id-ID")}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-2 border-t pt-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span>
                      Rp {checkoutData.subtotal.toLocaleString("id-ID")}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Ongkir:</span>
                    <span>
                      Rp {checkoutData.shippingCost.toLocaleString("id-ID")}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-gray-900">Total:</span>
                    <span className="text-lg text-blue-600">
                      Rp {checkoutData.total.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Down Payment Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8  flex items-center justify-center mr-3">
                    <span className="text-blue-600 bg-blue-100 rounded-lg p-1 font-bold">
                      30%
                    </span>
                  </div>
                  <h4 className="font-medium text-blue-900">
                    Down Payment (DP) Required
                  </h4>
                </div>
                <p className="text-sm text-blue-700 mb-3">
                  Untuk melanjutkan pemesanan, Anda perlu membayar DP sebesar
                  30% dari total harga.
                </p>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Total Pesanan:</span>
                    <span className="font-medium">
                      Rp {checkoutData.total.toLocaleString("id-ID")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">DP 30%:</span>
                    <span className="font-bold text-green-600">
                      Rp {downPayment.toLocaleString("id-ID")}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-gray-700">Sisa Pembayaran:</span>
                    <span className="font-medium text-gray-900">
                      Rp {remainingPayment.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Shipping Info */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">
                  Pengiriman ke:
                </h4>
                <div className="text-sm text-gray-600">
                  <p className="font-medium">
                    {checkoutData.address?.recipient}
                  </p>
                  <p>{checkoutData.address?.address}</p>
                  <p>
                    {checkoutData.address?.city},{" "}
                    {checkoutData.address?.postalCode}
                  </p>
                  <p>📞 {checkoutData.address?.phone}</p>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center text-sm">
                    <span className="mr-2">
                      {checkoutData.shippingMethod?.icon}
                    </span>
                    <div>
                      <span className="font-medium">
                        {checkoutData.shippingMethod?.name}
                      </span>
                      <p className="text-gray-600">
                        {checkoutData.shippingMethod?.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">
                  Metode Pembayaran:
                </h4>
                <div className="flex items-center">
                  {checkoutData.paymentMethod === "bank_transfer" && (
                    <>
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                        <span className="text-green-600 font-bold">🏦</span>
                      </div>
                      <div>
                        <span className="font-medium">Transfer Bank</span>
                        <p className="text-sm text-gray-600">
                          Transfer ke rekening yang tersedia
                        </p>
                      </div>
                    </>
                  )}
                  {checkoutData.paymentMethod === "credit_card" && (
                    <>
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                        <span className="text-blue-600 font-bold">💳</span>
                      </div>
                      <div>
                        <span className="font-medium">Kartu Kredit</span>
                        <p className="text-sm text-gray-600">
                          Pembayaran dengan kartu kredit
                        </p>
                      </div>
                    </>
                  )}
                  {checkoutData.paymentMethod === "cod" && (
                    <>
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                        <span className="text-orange-600 font-bold">💰</span>
                      </div>
                      <div>
                        <span className="font-medium">Cash on Delivery</span>
                        <p className="text-sm text-gray-600">
                          Bayar saat barang diterima
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-0.5">
                    <svg
                      className="w-5 h-5 text-yellow-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-800">
                      <strong>Perhatian:</strong> DP 30% harus dibayar dalam
                      waktu 24 jam. Pesanan akan diproses setelah pembayaran DP
                      dikonfirmasi.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-4 md:p-5 border-t border-gray-200 rounded-b">
              {/* <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-5 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700"
                disabled={isConfirming}
              >
                Kembali
              </button> */}

              <div className="flex flex-col items-end">
                <div className="text-sm text-gray-600 mb-1">
                  DP yang harus dibayar:
                </div>
                <div className="text-lg font-bold text-green-600">
                  Rp {downPayment.toLocaleString("id-ID")}
                </div>
              </div>

              <button
                type="button"
                onClick={handleConfirmPayment}
                disabled={isConfirming}
                className="text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 font-medium rounded-lg text-sm px-5 py-2.5 text-center focus:ring-4 focus:outline-none focus:ring-green-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isConfirming ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Memproses...
                  </span>
                ) : (
                  "Konfirmasi Pembayaran DP"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
