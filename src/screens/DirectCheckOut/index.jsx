"use client";
import { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { getUserAddress } from "@/actions/cartActions";

export default function DirectCheckoutPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [checkoutData, setCheckoutData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [shippingMethods, setShippingMethods] = useState([]);
  const [selectedShippingMethod, setSelectedShippingMethod] = useState("");
  const [shippingCost, setShippingCost] = useState(15000);
  const [error, setError] = useState(null);
  const [taxRate, setTaxRate] = useState(0.1); // 10% pajak

  // Data dummy untuk alamat, payment methods, dan shipping methods
  const dummyAddresses = [
    {
      id: 1,
      name: "Rumah",
      recipient: "John Doe",
      phone: "081234567890",
      address: "Jl. Sudirman No. 123, Jakarta Selatan",
      city: "Jakarta",
      postalCode: "12190",
      isPrimary: true,
    },
    {
      id: 2,
      name: "Kantor",
      recipient: "John Doe",
      phone: "081234567891",
      address: "Jl. Thamrin No. 456, Jakarta Pusat",
      city: "Jakarta",
      postalCode: "10240",
      isPrimary: false,
    },
  ];

  const dummyPaymentMethods = [
    { id: "bank_transfer", name: "Bank Transfer", icon: "🏦" },
    { id: "credit_card", name: "Credit Card", icon: "💳" },
    { id: "gopay", name: "GoPay", icon: "📱" },
    { id: "ovo", name: "OVO", icon: "📱" },
    { id: "dana", name: "DANA", icon: "📱" },
    { id: "cod", name: "Cash on Delivery", icon: "💰" },
  ];

  // Data metode pengiriman dengan estimasi waktu dan harga
  const dummyShippingMethods = [
    {
      id: "instant",
      name: "Instant Delivery",
      description: "Diantar dalam 1-2 jam",
      price: 50000,
      icon: "⚡",
      estimatedDays: "1-2 jam",
    },
    {
      id: "sameday",
      name: "Same Day Delivery",
      description: "Diantar hari ini",
      price: 35000,
      icon: "🚚",
      estimatedDays: "Hari ini",
    },
    {
      id: "reguler",
      name: "Reguler Delivery",
      description: "Diantar dalam 2-3 hari",
      price: 15000,
      icon: "📦",
      estimatedDays: "2-3 hari",
    },
    {
      id: "kargo",
      name: "Kargo",
      description: "Untuk pengiriman besar atau luar kota",
      price: 30000,
      icon: "🚛",
      estimatedDays: "3-7 hari",
    },
  ];

  // Load data dari URL
  useEffect(() => {
    const dataParam = searchParams.get("data");
    console.log("Data from URL:", dataParam);

    if (dataParam) {
      try {
        const decodedData = JSON.parse(decodeURIComponent(dataParam));
        setCheckoutData(decodedData);

        // Set data alamat, payment, dan shipping methods
        // setAddresses(dummyAddresses);
        const primaryAddress = dummyAddresses.find((addr) => addr.isPrimary);
        setSelectedAddress(primaryAddress || dummyAddresses[0]);
        setPaymentMethods(dummyPaymentMethods);
        setSelectedPaymentMethod("bank_transfer");

        // Set shipping methods
        setShippingMethods(dummyShippingMethods);
        // Default pilih reguler delivery
        setSelectedShippingMethod("reguler");
        setShippingCost(dummyShippingMethods[2].price);

        setLoading(false);
      } catch (error) {
        console.error("Error parsing checkout data:", error);
        setError("Data checkout tidak valid");
        setLoading(false);
      }
    } else {
      setError("Tidak ada data checkout");
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    const apiAddresses = async () => {
      await getUserAddress();
    };

    apiAddresses();
  });

  // Hitung total
  const calculateTotals = () => {
    if (!checkoutData) return { subtotal: 0, shippingCost: 0, total: 0 };

    const subtotal = checkoutData.totalPrice || 0;
    const selectedShipping = shippingMethods.find(
      (method) => method.id === selectedShippingMethod
    );
    const currentShippingCost = selectedShipping?.price || shippingCost;
    const currentTaxCost = Math.round(subtotal * taxRate);
    const total = subtotal + currentShippingCost + currentTaxCost;
    return {
      subtotal,
      shippingCost: currentShippingCost,
      total,
      taxCost: currentTaxCost,
    };
  };

  const {
    subtotal,
    shippingCost: currentShippingCost,
    total,
    taxCost: currentTaxCost,
  } = calculateTotals();

  // Handler functions
  const handleSelectAddress = (address) => {
    setSelectedAddress(address);
  };

  const handleAddAddress = () => {
    // Logic untuk tambah alamat baru
    console.log("Add new address");
  };

  const handleShippingMethodChange = (methodId) => {
    setSelectedShippingMethod(methodId);
    const selectedMethod = shippingMethods.find((m) => m.id === methodId);
    if (selectedMethod) {
      setShippingCost(selectedMethod.price);
    }
  };

  const handleCheckout = () => {
    // Validasi sebelum checkout
    if (!selectedShippingMethod) {
      alert("Silakan pilih metode pengiriman");
      return;
    }

    if (!selectedPaymentMethod) {
      alert("Silakan pilih metode pembayaran");
      return;
    }

    const selectedShipping = shippingMethods.find(
      (method) => method.id === selectedShippingMethod
    );

    const orderData = {
      checkoutData,
      address: selectedAddress,
      paymentMethod: selectedPaymentMethod,
      shippingMethod: selectedShipping,
      subtotal,
      shippingCost: currentShippingCost,
      total,
    };

    console.log("Direct Checkout data:", orderData);

    // Simpan data ke localStorage untuk halaman berikutnya
    localStorage.setItem("directCheckoutData", JSON.stringify(orderData));

    // Redirect ke halaman konfirmasi pembayaran
    alert("Pesanan berhasil diproses! Lanjut ke pembayaran...");
    router.push("/payment-confirmation");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data checkout...</p>
        </div>
      </div>
    );
  }

  if (error || !checkoutData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">
            Terjadi Kesalahan
          </h2>
          <p className="text-gray-600 mt-2">
            {error || "Data tidak ditemukan"}
          </p>
          <Button
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => router.push("/")}
          >
            Kembali ke Beranda
          </Button>
        </div>
      </div>
    );
  }

  const {
    productName,
    quantity,
    unitPrice,
    totalPrice,
    status,
    color,
    notes,
    moq,
    productImage,
    productType,
    isOutOfStock,
  } = checkoutData;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-2">
              <h1 className="text-3xl font-bold text-gray-900">
                Direct Checkout
              </h1>
              <span
                className={`px-3 py-1 text-sm font-medium rounded-full ${
                  status === "Buy Now"
                    ? "bg-blue-100 text-blue-800"
                    : status === "Sample Order"
                    ? "bg-purple-100 text-purple-700"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {status}
              </span>
            </div>
            <p className="text-gray-600 mt-2">
              Checkout langsung untuk 1 produk
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Alamat, Pengiriman, dan Metode Pembayaran */}
            <div className="lg:col-span-2 space-y-8">
              {/* Product Summary Card */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Ringkasan Produk
                </h2>
                <div className="flex items-start space-x-4">
                  <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {productImage ? (
                      <Image
                        src={`${
                          process.env.NEXT_PUBLIC_BASE_URL || ""
                        }/${productImage}`}
                        alt={productName}
                        width={96}
                        height={96}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                        <span className="text-gray-500 text-xs">IMG</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900 text-lg">
                          {productName}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {productType}
                        </p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-sm text-gray-500">
                            Warna: {color || "-"}
                          </span>
                          <span className="text-sm text-gray-500">
                            Quantity: {quantity}
                          </span>
                          <span className="text-sm text-gray-500">
                            MOQ: {moq}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-blue-600">
                          Rp {(quantity * unitPrice).toLocaleString("id-ID")}
                        </div>
                        <div className="text-sm text-gray-500">
                          Rp {unitPrice?.toLocaleString("id-ID")} × {quantity}
                        </div>
                      </div>
                    </div>

                    {/* Notes */}
                    {notes && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-sm font-medium text-gray-700 mb-1">
                          Catatan:
                        </p>
                        <p className="text-sm text-gray-600">{notes}</p>
                      </div>
                    )}

                    {/* Stock Status */}
                    <div
                      className={`mt-4 p-3 rounded-lg border ${
                        isOutOfStock
                          ? "bg-yellow-50 border-yellow-200"
                          : "bg-green-50 border-green-200"
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <svg
                          className={`w-5 h-5 ${
                            isOutOfStock ? "text-yellow-600" : "text-green-600"
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          {isOutOfStock ? (
                            <path
                              fillRule="evenodd"
                              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          ) : (
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          )}
                        </svg>
                        <span
                          className={`font-medium ${
                            isOutOfStock ? "text-yellow-700" : "text-green-700"
                          }`}
                        >
                          {isOutOfStock
                            ? "Pre Order - Stock akan diinformasikan"
                            : "Ready Stock - Siap dikirim"}
                        </span>
                      </div>
                      <p
                        className={`text-sm mt-1 ${
                          isOutOfStock ? "text-yellow-600" : "text-green-600"
                        }`}
                      >
                        {isOutOfStock
                          ? "Produk ini sedang dalam status pre-order. Pengiriman akan dilakukan setelah stock tersedia."
                          : "Produk tersedia dan siap dikirim sesuai metode pengiriman yang dipilih."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section: Alamat Pengiriman */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Alamat Pengiriman
                  </h2>
                </div>

                <div className="space-y-4">
                  {addresses.map((address) => (
                    <div
                      key={address.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        selectedAddress?.id === address.id
                          ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => handleSelectAddress(address)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-900">
                              {address.name}
                            </span>
                            {address.isPrimary && (
                              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                Utama
                              </span>
                            )}
                          </div>
                          <p className="text-gray-700 mt-2">
                            <span className="font-medium">
                              {address.recipient}
                            </span>{" "}
                            • {address.phone}
                          </p>
                          <p className="text-gray-600 mt-1">
                            {address.address}
                          </p>
                          <p className="text-gray-600">
                            {address.city}, {address.postalCode}
                          </p>
                        </div>
                        {selectedAddress?.id === address.id && (
                          <div className="text-blue-600">
                            <svg
                              className="w-5 h-5"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section: Metode Pengiriman */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Metode Pengiriman
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {shippingMethods.map((method) => (
                    <div
                      key={method.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        selectedShippingMethod === method.id
                          ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => handleShippingMethodChange(method.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <span className="text-2xl">{method.icon}</span>
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {method.name}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              {method.description}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Estimasi: {method.estimatedDays}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-gray-900">
                            Rp {method.price.toLocaleString("id-ID")}
                          </div>
                          {selectedShippingMethod === method.id && (
                            <div className="mt-1 text-xs text-blue-600 font-medium">
                              ✓ Dipilih
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Shipping Note */}
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    ⚠️ Pilih metode pengiriman sesuai kebutuhan. Instant
                    Delivery hanya tersedia untuk area tertentu.
                  </p>
                </div>
              </div>

              {/* Section: Metode Pembayaran */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Metode Pembayaran
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        selectedPaymentMethod === method.id
                          ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => setSelectedPaymentMethod(method.id)}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{method.icon}</span>
                        <span className="font-medium text-gray-900">
                          {method.name}
                        </span>
                      </div>
                      {selectedPaymentMethod === method.id && (
                        <div className="mt-2 text-xs text-blue-600 font-medium">
                          ✓ Dipilih
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Payment Details */}
                {selectedPaymentMethod === "bank_transfer" && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h3 className="font-medium text-gray-900 mb-2">
                      Instruksi Pembayaran:
                    </h3>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p>Transfer ke rekening berikut:</p>
                      <div className="bg-white p-3 rounded border">
                        <p>
                          <strong>Bank:</strong> BCA
                        </p>
                        <p>
                          <strong>No. Rekening:</strong> 1234567890
                        </p>
                        <p>
                          <strong>Atas Nama:</strong> Toko Batik Online
                        </p>
                      </div>
                      <p className="text-xs">
                        Transfer sebelum 24 jam untuk menghindari pembatalan
                        otomatis
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Ringkasan Pesanan */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm p-6 sticky top-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Ringkasan Pesanan
                </h2>

                {/* Order Summary */}
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {productName}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {quantity} item × Rp{" "}
                        {unitPrice?.toLocaleString("id-ID")}
                      </p>
                      <p className="text-xs text-gray-400">
                        Warna: {color || "-"}
                      </p>
                    </div>
                    <span className="font-medium text-gray-900">
                      Rp {totalPrice?.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>

                {/* Price Summary */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal (1 item)</span>
                    <span>Rp {subtotal.toLocaleString("id-ID")}</span>
                  </div>

                  {/* Shipping Method Info */}
                  {selectedShippingMethod && (
                    <div className="border-t border-gray-200 pt-3 mt-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          Pengiriman:
                        </span>
                        <span className="text-sm text-gray-600">
                          {shippingMethods.find(
                            (m) => m.id === selectedShippingMethod
                          )?.name || "-"}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between text-gray-600">
                    <span>Biaya Pengiriman</span>
                    <span>
                      Rp {currentShippingCost.toLocaleString("id-ID")}
                    </span>
                  </div>
                  <div className="border-t border-gray-200 pt-3 mt-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        Tax:
                      </span>
                      <span className="text-sm text-gray-600">
                        {Math.round(taxRate * 100)}%
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Total Tax</span>
                    <span>Rp {currentTaxCost.toLocaleString("id-ID")}</span>
                  </div>

                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total</span>
                      <span className="text-blue-600">
                        Rp {total.toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Order Status Info */}
                <div
                  className={`mb-6 p-4 rounded-lg border ${
                    isOutOfStock
                      ? "bg-yellow-50 border-yellow-200"
                      : "bg-green-50 border-green-200"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">
                      Status Pesanan:
                    </span>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        isOutOfStock
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {isOutOfStock
                      ? "Pesanan akan diproses setelah stok tersedia"
                      : "Pesanan akan diproses segera setelah pembayaran"}
                  </p>
                </div>

                {/* Shipping Info */}
                {selectedAddress && selectedShippingMethod && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h3 className="font-medium text-gray-900 mb-2">
                      Rincian Pengiriman
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Metode:</span>
                        <span className="font-medium">
                          {
                            shippingMethods.find(
                              (m) => m.id === selectedShippingMethod
                            )?.name
                          }
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Estimasi:</span>
                        <span>
                          {
                            shippingMethods.find(
                              (m) => m.id === selectedShippingMethod
                            )?.estimatedDays
                          }
                        </span>
                      </div>
                      <div className="border-t border-gray-200 pt-2 mt-2">
                        <p className="text-sm text-gray-600 mb-1">Alamat:</p>
                        <p className="text-xs text-gray-500">
                          {selectedAddress.address}
                        </p>
                        <p className="text-xs text-gray-500">
                          {selectedAddress.city}, {selectedAddress.postalCode}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Terms and Conditions */}
                <div className="mb-6">
                  <label className="flex items-start space-x-2">
                    <input
                      type="checkbox"
                      className="mt-1"
                      defaultChecked
                      required
                    />
                    <span className="text-sm text-gray-600">
                      Saya setuju dengan{" "}
                      <a href="#" className="text-blue-600 hover:underline">
                        Syarat dan Ketentuan
                      </a>
                    </span>
                  </label>
                </div>

                {/* Checkout Button */}
                <Button
                  className={`w-full text-white py-3 text-lg font-medium ${
                    isOutOfStock
                      ? "bg-yellow-600 hover:bg-yellow-700"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                  onClick={handleCheckout}
                  disabled={!selectedShippingMethod || !selectedPaymentMethod}
                >
                  {isOutOfStock ? "Konfirmasi Pre Order" : "Bayar Sekarang"}
                </Button>

                {/* Security Info */}
                <div className="mt-4 text-center">
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Transaksi aman dan terenkripsi</span>
                  </div>
                </div>

                {/* Cancel Button */}
                <div className="mt-4 text-center">
                  <button
                    onClick={() => router.back()}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Batalkan dan kembali
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
