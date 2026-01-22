"use client";
import { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { getUserBilling, handleCartCheckout } from "@/actions/cartActions";
import ModalPaymentConfirmation from "@/components/Modal/ModalPaymentConfirmation";
import { getUserAddress } from "@/actions/cartActions";
import { getCustomerData } from "@/actions/authActions";
import { handleCheckoutAction } from "@/actions/checkoutActions";

export default function COFromCart() {
  // State untuk data checkout
  const [selectedItems, setSelectedItems] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [shippingMethods, setShippingMethods] = useState([]);
  const [selectedShippingMethod, setSelectedShippingMethod] = useState("");
  const [shippingCost, setShippingCost] = useState(15000);
  const [isLoading, setIsLoading] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();
  const [itemIds, setItemIds] = useState([]);
  const [error, setError] = useState(null);
  const taxRate = 0.1;

  // State untuk modal pembayaran
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [checkoutData, setCheckoutData] = useState(null);

  // Data dummy untuk alamat, payment methods, dan shipping methods
  // const dummyAddresses = [
  //   {
  //     id: 1,
  //     name: "Rumah",
  //     recipient: "John Doe",
  //     phone: "081234567890",
  //     address: "Jl. Sudirman No. 123, Jakarta Selatan",
  //     city: "Jakarta",
  //     postalCode: "12190",
  //     isPrimary: true,
  //   },
  //   {
  //     id: 2,
  //     name: "Kantor",
  //     recipient: "John Doe",
  //     phone: "081234567891",
  //     address: "Jl. Thamrin No. 456, Jakarta Pusat",
  //     city: "Jakarta",
  //     postalCode: "10240",
  //     isPrimary: false,
  //   },
  // ];

  const dummyPaymentMethods = [
    { id: "bank_transfer", name: "Bank Transfer", icon: "🏦" },
    { id: "credit_card", name: "Credit Card", icon: "💳" },
    { id: "gopay", name: "GoPay", icon: "📱" },
    { id: "ovo", name: "OVO", icon: "📱" },
    { id: "dana", name: "DANA", icon: "📱" },
    { id: "cod", name: "Cash on Delivery", icon: "💰" },
  ];

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

  // Hitung total berdasarkan data dari API dan shipping method
  const calculateTotals = () => {
    const subtotal = selectedItems.reduce(
      (sum, item) => sum + (item.priceTotal || 0),
      0
    );

    // Cari harga shipping method yang dipilih
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

  useEffect(() => {
    const ids = searchParams.getAll("itemIds");
    // console.log("Item IDs from URL:", ids);

    if (ids.length > 0) {
      setItemIds(ids);
      fetchItemsFromAPI(ids);
    } else {
      router.push("/cart");
    }
  }, [searchParams, router]);

  const fetchItemsFromAPI = async (ids) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await handleCartCheckout(ids);
      const fetchedAddress = await getUserAddress();
      const fetchedUser = await getCustomerData();
      const fetchedBilling = await getUserBilling();
      // console.log("Fetched user address:", fetchedAddress);
      // console.log("Fetched items for checkout:", result);
      // console.log("Fetched user data:", fetchedUser);
      // console.log("Fetched user billing:", fetchedBilling);

      if (result.success && result.data.length > 0) {
        setSelectedItems(result.data);

        const formattedAddresses = fetchedAddress.data.map((address) => ({
          id: address.id,
          name: address.label || `Alamat ${address.id}`,
          recipient: fetchedUser.data.name || "John Doe",
          phone: fetchedUser.data.phone_number || "081234567890",
          address: address.address_line || "",
          city: address.city || "",
          postalCode: address.postal_code || "",
          isPrimary: address.is_default || false,
        }));
        // console.log(formattedAddresses);
        setAddresses(formattedAddresses);
        const primaryAddress = formattedAddresses.find(
          (addr) => addr.isPrimary
        );
        setSelectedAddress(primaryAddress || formattedAddresses[0]);
        setPaymentMethods(dummyPaymentMethods);
        setSelectedPaymentMethod("bank_transfer");
        setShippingMethods(dummyShippingMethods);
        setSelectedShippingMethod("reguler");
      } else {
        setError(result.message || "Tidak ada item yang ditemukan");
        if (result.data.length === 0) {
          router.push("/cart");
        }
      }
    } catch (error) {
      console.error("Error fetching cart items:", error);
      setError("Gagal memuat data checkout");
    } finally {
      setIsLoading(false);
    }
  };

  // Handler functions
  const handleRemoveItem = (cartId) => {
    const updatedItems = selectedItems.filter((item) => item.cartId !== cartId);
    setSelectedItems(updatedItems);

    // Update URL dengan itemIds yang baru
    const updatedIds = updatedItems.map((item) => item.cartId.toString());
    if (updatedIds.length > 0) {
      const query = updatedIds.map((id) => `itemIds=${id}`).join("&");
      router.push(`/cartcheckout?${query}`);
    } else {
      router.push("/cart");
    }
  };

  const handleSelectAddress = (address) => {
    setSelectedAddress(address);
  };

  const handleAddAddress = () => {
    // Logic untuk tambah alamat baru
    console.log("Add new address");
  };

  const handleShippingMethodChange = (methodId) => {
    setSelectedShippingMethod(methodId);
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
      items: selectedItems,
      address: selectedAddress,
      paymentMethod: selectedPaymentMethod,
      shippingMethod: selectedShipping,
      subtotal,
      shippingCost: currentShippingCost,
      tax: currentTaxCost,
      total,
      itemIds: selectedItems.map((item) => item.cartId),
    };

    console.log("Checkout data:", orderData);

    // Set checkout data and open payment modal
    setCheckoutData(orderData);
    setIsPaymentModalOpen(true);
  };

  const handleConfirmPayment = async (orderData) => {
    try {
      console.log("Payment confirmed, creating order:", orderData);

      const checkoutDataForAPI = {
        ...orderData,
        orderStatus: "processing",
        paymentStatus: "down_payment_paid",
        downPayment: orderData.total * 0.3,
        remainingPayment: orderData.total * 0.7,
      };

      console.log("Sending to backend:", checkoutDataForAPI);

      const response = await handleCheckoutAction(checkoutDataForAPI, "cart");

      if (response.success) {
        console.log("Checkout successful:", response);

        const existingOrders = JSON.parse(
          localStorage.getItem("orderHistory") || "[]"
        );
        const newOrder = {
          ...orderData,
          orderId:
            response.orderId ||
            response.data?.id ||
            `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          orderNumber: response.orderNumber,
          orderDate: new Date().toISOString(),
          status: "processing",
          paymentStatus: "down_payment_paid",
          downPayment: orderData.total * 0.3,
          remainingPayment: orderData.total * 0.7,
          backendId: response.data?.id, 
        };

        localStorage.setItem(
          "orderHistory",
          JSON.stringify([newOrder, ...existingOrders])
        );

        const cartItems = JSON.parse(localStorage.getItem("cartItems") || "[]");
        const updatedCartItems = cartItems.filter(
          (item) => !orderData.itemIds.includes(item.id)
        );
        localStorage.setItem("cartItems", JSON.stringify(updatedCartItems));
        alert(`Pesanan berhasil dibuat! Nomor order: ${response.orderNumber}`);
        // router.push("/orders");
      } else {
        console.error("Checkout failed:", response.message);
        alert(`Gagal membuat pesanan: ${response.message}`);
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      alert("Terjadi kesalahan saat memproses pembayaran");
    }
  };
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data checkout...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">
            Terjadi Kesalahan
          </h2>
          <p className="text-gray-600 mt-2">{error}</p>
          <Button
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => router.push("/cart")}
          >
            Kembali ke Cart
          </Button>
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
            <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
            <p className="text-gray-600 mt-2">
              Lengkapi informasi untuk menyelesaikan pesanan (
              {selectedItems.length} item)
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Alamat, Pengiriman, dan Metode Pembayaran */}
            <div className="lg:col-span-2 space-y-8">
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

                {/* Items List */}
                <div className="space-y-4 mb-6 max-h-96 overflow-y-auto pr-2">
                  {selectedItems.map((item) => (
                    <div
                      key={item.cartId}
                      className="flex items-start space-x-4 pb-4 border-b border-gray-100"
                    >
                      <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {item.product?.image ? (
                          <Image
                            src={`${process.env.NEXT_PUBLIC_BASE_URL}/${item.product.image}`}
                            alt={item.product.name}
                            width={64}
                            height={64}
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
                            <h3 className="font-medium text-gray-900 line-clamp-1">
                              {item.product?.name || "Unknown Product"}
                            </h3>
                            <p className="text-sm text-gray-500">
                              Warna: {item.color || "-"}
                            </p>
                            <p className="text-sm text-gray-500">
                              Quantity: {item.quantity}
                            </p>
                            {item.product?.moq && (
                              <p className="text-xs text-gray-400">
                                MOQ: {item.product.moq}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => handleRemoveItem(item.cartId)}
                            className="text-gray-400 hover:text-red-500"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <div className="flex items-center space-x-2">
                            {/* Quantity tidak bisa diubah */}
                            <span className=" text-center bg-gray-100 px-2 py-1 rounded">
                              {item.quantity}
                            </span>
                          </div>
                          <span className="font-medium text-gray-900">
                            Rp {item.priceTotal?.toLocaleString("id-ID")}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Price Summary */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({selectedItems.length} item)</span>
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
                        Total Tax:
                      </span>
                      <span className="text-sm text-gray-600">
                        {Math.round(taxRate * 100)}%
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Total Pajak</span>
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

                {/* Down Payment Info */}
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-green-600 font-bold">30%</span>
                    </div>
                    <h4 className="font-medium text-green-900">
                      Down Payment Required
                    </h4>
                  </div>
                  <p className="text-sm text-green-700 mb-2">
                    Anda perlu membayar DP 30% sebesar:
                  </p>
                  <div className="text-xl font-bold text-green-600">
                    Rp {(total * 0.3).toLocaleString("id-ID")}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    Sisa pembayaran: Rp {(total * 0.7).toLocaleString("id-ID")}
                  </p>
                </div>

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
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg font-medium"
                  onClick={handleCheckout}
                  disabled={
                    selectedItems.length === 0 ||
                    !selectedShippingMethod ||
                    !selectedPaymentMethod
                  }
                >
                  Lanjut ke Pembayaran DP
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
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Payment Confirmation */}
      <ModalPaymentConfirmation
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        checkoutData={checkoutData}
        onConfirmPayment={handleConfirmPayment}
      />
    </div>
  );
}
