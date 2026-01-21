import { useState, useEffect } from "react";

export default function ModalRenegotiate({
  isOpen,
  onClose,
  onSubmit,
  initialData = {},
  title = "Renegotiate Offer",
  priceTiers = [],
}) {
  const [quantity, setQuantity] = useState(initialData.quantity || 1);
  const [price, setPrice] = useState(initialData.offeredPrice || 0);
  const [notes, setNotes] = useState(initialData.notes || "");
  const [selectedColor, setSelectedColor] = useState(initialData.color || "");
  const [currentTierInfo, setCurrentTierInfo] = useState("");
  const [originalPrice, setOriginalPrice] = useState(
    initialData.originalPrice || 0
  );

  const colorStocks = initialData.colorStocks || [];
  const moq = initialData.moq || 1;
  const sortedTiers = [...priceTiers].sort((a, b) => b.minQty - a.minQty);

  const getStockStatus = (stock) => {
    if (stock > 10)
      return { label: "Tersedia", class: "text-green-600 bg-green-50" };
    if (stock > 5)
      return { label: "Terbatas", class: "text-yellow-600 bg-yellow-50" };
    if (stock > 0)
      return { label: "Hampir Habis", class: "text-orange-600 bg-orange-50" };
    return { label: "Habis", class: "text-red-600 bg-red-50" };
  };

  
  const calculateFixedPrice = (qty) => {
    if (priceTiers.length === 0) return 0;

    
    const sortedTiers = [...priceTiers].sort((a, b) => b.minQty - a.minQty);

    // Cari tier yang applicable (quantity >= minQty)
    const applicableTier = sortedTiers.find((tier) => qty >= tier.minQty);

    // Jika ditemukan, gunakan unitPrice dari tier tersebut
    // Jika tidak ditemukan, gunakan tier dengan minQty terkecil
    if (applicableTier) {
      return applicableTier.unitPrice;
    } else {
      // Cari tier dengan minQty terkecil
      const smallestTier = sortedTiers.reduce((prev, current) =>
        prev.minQty < current.minQty ? prev : current
      );
      return smallestTier?.unitPrice || 0;
    }
  };

  // Function untuk mendapatkan info tier saat ini
  const getCurrentTierInfoText = (qty) => {
    if (priceTiers.length === 0) return "";

    const sortedTiers = [...priceTiers].sort((a, b) => a.minQty - b.minQty);
    const applicableTier = calculateFixedPrice(qty);

    // Cari tier yang sesuai dengan harga
    const tier = priceTiers.find((t) => t.unitPrice === applicableTier);

    if (tier) {
      const nextTier = sortedTiers.find((t) => t.minQty > tier.minQty);
      if (nextTier) {
        return `Tier: ${tier.minQty}+ items (Next tier at ${nextTier.minQty} items)`;
      }
      return `Tier: ${tier.minQty}+ items (Highest tier)`;
    }

    return "";
  };

  // Handler untuk perubahan warna
  const handleColorChange = (color) => {
    setSelectedColor(color);
  };

  // Update tier info ketika quantity berubah
  useEffect(() => {
    if (priceTiers.length > 0) {
      const tierInfo = getCurrentTierInfoText(quantity);
      setCurrentTierInfo(tierInfo);

      // Hitung harga fixed berdasarkan tier
      const fixedPrice = calculateFixedPrice(quantity);
      setOriginalPrice(fixedPrice);
    }
  }, [quantity, priceTiers]);

  // Reset form ketika modal dibuka
  useEffect(() => {
    if (isOpen) {
      setQuantity(initialData.quantity || 1);
      setPrice(initialData.offeredPrice || 0);
      setNotes(initialData.notes || "");
      setSelectedColor(initialData.color || "");
    }
  }, [isOpen, initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validasi
    if (quantity < moq) {
      alert(`Minimum order quantity is ${moq} items`);
      return;
    }

    if (price <= 0) {
      alert("Please enter a valid price");
      return;
    }

    // Jika ada warna yang harus dipilih
    if (colorStocks.length > 0 && !selectedColor) {
      alert("Please select a color");
      return;
    }

    // Kirim data renegotiate
    onSubmit({
      quantity,
      price,
      notes,
      color: selectedColor,
      originalPrice,
      negotiationId: initialData.negotiationId,
    });
    onClose();
  };

  const handleReset = () => {
    setQuantity(initialData.quantity || 1);
    setPrice(initialData.offeredPrice || 0);
    setNotes(initialData.notes || "");
    setSelectedColor(initialData.color || "");
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-gray-800/70 z-40 transition-opacity"
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
              <h3 className="text-xl font-semibold text-gray-900">
                {title} - {initialData.productName || "Product"}
              </h3>
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
            <form onSubmit={handleSubmit}>
              <div className="p-4 md:p-5 space-y-4">
                {/* Product Info (Original) */}
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                  <div className="text-sm text-blue-800 font-medium mb-1">
                    Original Offer
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">Quantity:</span>
                      <span className="ml-2 font-medium">
                        {initialData.quantity || 1}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Original Price:</span>
                      <span className="ml-2 font-medium">
                        Rp{" "}
                        {(initialData.offeredPrice || 0).toLocaleString(
                          "id-ID"
                        )}
                      </span>
                    </div>
                    {initialData.color && (
                      <div>
                        <span className="text-gray-600">Color:</span>
                        <span className="ml-2 font-medium">
                          {initialData.color}
                        </span>
                      </div>
                    )}
                    {initialData.status && (
                      <div>
                        <span className="text-gray-600">Status:</span>
                        <span
                          className={`ml-2 font-medium ${
                            initialData.status === "rejected"
                              ? "text-red-600"
                              : initialData.status === "approved"
                                ? "text-green-600"
                                : "text-yellow-600"
                          }`}
                        >
                          {initialData.status}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Color Selection (jika ada) */}
                {colorStocks.length > 0 && (
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-900">
                      Select Color
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {colorStocks.map((colorStock) => {
                        const stockStatus = getStockStatus(colorStock.stock);
                        const isAvailable = colorStock.stock > 0;

                        return (
                          <button
                            key={colorStock.id}
                            type="button"
                            onClick={() =>
                              isAvailable && handleColorChange(colorStock.color)
                            }
                            disabled={!isAvailable}
                            className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                              selectedColor === colorStock.color
                                ? "bg-blue-100 text-blue-700 border-blue-300"
                                : isAvailable
                                  ? "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                                  : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                            }`}
                          >
                            <div className="flex items-center space-x-2">
                              <span>{colorStock.color}</span>
                              <span
                                className={`text-xs px-1.5 py-0.5 rounded-full ${
                                  isAvailable
                                    ? stockStatus.class
                                    : "bg-gray-200 text-gray-500"
                                }`}
                              >
                                {stockStatus.label}
                              </span>
                            </div>
                            {isAvailable && (
                              <div className="text-xs text-gray-500 mt-1">
                                Stock: {colorStock.stock}
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Quantity Input */}
                <div>
                  <label
                    htmlFor="quantity"
                    className="block mb-2 text-sm font-medium text-gray-900"
                  >
                    New Quantity
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="number"
                      id="quantity"
                      value={quantity}
                      onChange={(e) => {
                        const newQty = Math.max(
                          moq,
                          parseInt(e.target.value) || moq
                        );
                        setQuantity(newQty);
                      }}
                      min={moq}
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 text-center"
                      required
                    />
                    {priceTiers.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setQuantity(moq)}
                        className="px-3 py-2 text-sm text-blue-600 hover:text-blue-800"
                      >
                        Reset to MOQ
                      </button>
                    )}
                  </div>
                  {moq > 1 && (
                    <p className="mt-1 text-xs text-gray-500">
                      Minimum order quantity: {moq} items
                    </p>
                  )}
                </div>

                {/* Price Tiers Info (jika ada) */}
                {priceTiers.length > 0 && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-700 font-medium">
                        Suggested Price (based on quantity):
                      </span>
                      <span className="text-lg font-bold text-blue-600">
                        Rp {originalPrice.toLocaleString("id-ID")}
                      </span>
                    </div>
                    {currentTierInfo && (
                      <div className="text-sm text-blue-700 font-medium mb-2">
                        {currentTierInfo}
                      </div>
                    )}

                    {/* Price Tiers Details */}
                    <div className="text-xs font-medium text-gray-500 mb-1">
                      Price Tiers:
                    </div>
                    <div className="space-y-1 max-h-20 overflow-y-auto pr-2">
                      {[...priceTiers]
                        .sort((a, b) => a.minQty - b.minQty)
                        .map((tier, index) => (
                          <div
                            key={tier.id || index}
                            className={`flex justify-between text-xs px-2 py-1 rounded ${
                              quantity >= tier.minQty
                                ? "bg-blue-100 text-blue-800"
                                : "text-gray-500"
                            }`}
                          >
                            <span>≥ {tier.minQty} items</span>
                            <span className="font-medium">
                              Rp {tier.unitPrice.toLocaleString("id-ID")}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Price Input */}
                <div>
                  <label
                    htmlFor="price"
                    className="block mb-2 text-sm font-medium text-gray-900"
                  >
                    New Offer Price (IDR)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
                      <span className="text-gray-500">Rp</span>
                    </div>
                    <input
                      type="number"
                      id="price"
                      value={price}
                      onChange={(e) =>
                        setPrice(parseFloat(e.target.value) || 0)
                      }
                      min="0"
                      step="500"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-12 p-2.5"
                      placeholder="Enter your new offer price"
                      required
                    />
                  </div>
                  {originalPrice > 0 && (
                    <div className="mt-1 text-xs text-gray-500">
                      Suggested price: Rp{" "}
                      {originalPrice.toLocaleString("id-ID")}
                      {price > originalPrice && (
                        <span className="ml-2 text-red-600">
                          (Your offer is higher than suggested)
                        </span>
                      )}
                      {price < originalPrice && (
                        <span className="ml-2 text-green-600">
                          (Your offer is lower than suggested)
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Notes Input */}
                <div>
                  <label
                    htmlFor="notes"
                    className="block mb-2 text-sm font-medium text-gray-900"
                  >
                    Reason for Renegotiation (Optional)
                  </label>
                  <textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 resize-none"
                    placeholder="Explain why you want to renegotiate (e.g., found better price, budget constraints, etc.)"
                    maxLength={200}
                  />
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-gray-500">Optional</span>
                    <span className="text-xs text-gray-500">
                      {notes.length}/200
                    </span>
                  </div>
                </div>

                {/* Display Total */}
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-gray-700 font-medium">
                      New Total:
                    </span>
                    <span className="font-bold text-lg text-blue-700">
                      Rp {(quantity * price).toLocaleString("id-ID")}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>
                      {quantity} item(s) × Rp {price.toLocaleString("id-ID")}
                    </span>
                    <span className="text-blue-600 font-medium">
                      {price > (initialData.offeredPrice || 0) ? (
                        <span className="text-green-600">
                          ↑ Increase from original
                        </span>
                      ) : price < (initialData.offeredPrice || 0) ? (
                        <span className="text-blue-600">
                          ↓ Decrease from original
                        </span>
                      ) : (
                        <span className="text-gray-600">Same as original</span>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between p-4 md:p-5 border-t border-gray-200 rounded-b">
                <div>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="py-2 px-4 text-sm font-medium text-gray-700 hover:text-gray-900"
                  >
                    Reset
                  </button>
                </div>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="py-2.5 px-5 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 font-medium rounded-lg text-sm px-5 py-2.5 text-center focus:ring-4 focus:outline-none focus:ring-blue-300"
                  >
                    Submit Renegotiation
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
