import { useState, useEffect } from "react";

export default function ToCartQuantity({
  isOpen,
  onClose,
  onSubmit,
  initialData = {},
  title = "Add to Cart",
  priceTiers = [],
}) {
  const [quantity, setQuantity] = useState(initialData.quantity);
  const [price, setPrice] = useState(initialData.price || 0);
  const [notes, setNotes] = useState(initialData.notes || "");
  const [transactionType, setTransactionType] = useState("negotiate");
  const [fixedPrice, setFixedPrice] = useState(initialData.fixedPrice || 0);
  const sortedTiers = [...priceTiers].sort((a, b) => b.minQty - a.minQty);
  const moq = initialData.quantity;
  // Function untuk menghitung fixedPrice berdasarkan quantity dan priceTiers
  const calculateFixedPrice = (qty) => {
    if (priceTiers.length === 0) return 0;

    // Urutkan priceTiers dari minQty terbesar ke terkecil
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
  const getCurrentTierInfo = (qty) => {
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

  useEffect(() => {
    if (transactionType === "directly") {
      const newFixedPrice = calculateFixedPrice(quantity);
      setFixedPrice(newFixedPrice);
    }
  }, [quantity, transactionType, priceTiers]);

  useEffect(() => {
    if (transactionType === "directly") {
      const newFixedPrice = calculateFixedPrice(quantity);
      setFixedPrice(newFixedPrice);
    } else {
      setPrice(initialData.price || 0);
    }
  }, [transactionType, isOpen]);


  const handleSubmit = (e) => {
    e.preventDefault();

    if (transactionType === "directly") {
      onSubmit({
        quantity,
        price: fixedPrice,
        notes,
        transactionType: "directly",
      });
    } else {
      onSubmit({
        quantity,
        price,
        notes,
        transactionType: "negotiate",
      });
    }

    onClose();
  };

  const handleReset = () => {
    setQuantity(initialData.quantity || 1);
    setPrice(initialData.price || 0);
    setNotes(initialData.notes || "");
    setFixedPrice(initialData.fixedPrice || 0);
    setTransactionType("negotiate");
  };

  const handleQuantityUpdate = (newQuantity) => {
    setQuantity(newQuantity);
    console.log("Quantity updated to:", newQuantity);
    console.log("Initial quantity:", initialData.quantity);
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
              <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
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

            {/* Transaction Type Selector */}
            <div className="p-4 md:p-5 border-b">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-700">
                  Transaction Type:
                </span>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setTransactionType("negotiate")}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      transactionType === "negotiate"
                        ? "bg-blue-100 text-blue-700 border border-blue-300"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
                    }`}
                  >
                    Negotiate Price
                  </button>
                  <button
                    type="button"
                    onClick={() => setTransactionType("directly")}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      transactionType === "directly"
                        ? "bg-green-100 text-green-700 border border-green-300"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
                    }`}
                  >
                    Buy Directly
                  </button>
                </div>
              </div>

              {/* Transaction Type Description */}
              <div className="mt-3 text-sm text-gray-600">
                {transactionType === "directly"
                  ? "Purchase at fixed price based on quantity tier"
                  : "Negotiate your own price with the seller"}
              </div>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit}>
              <div className="p-4 md:p-5 space-y-4">
                {/* Quantity Input */}
                <div>
                  <label
                    htmlFor="quantity"
                    className="block mb-2 text-sm font-medium text-gray-900"
                  >
                    Quantity
                  </label>
                  <div className="flex items-center space-x-3">
                    <button
                      type="button"
                      onClick={() =>
                        handleQuantityUpdate(Math.max(1, quantity - 1))
                      }
                      disabled={quantity < moq} // <-- ini yang penting
                      className={`w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100
    ${
      quantity < moq ? "opacity-50 cursor-not-allowed" : ""
    }`}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M20 12H4"
                        />
                      </svg>
                    </button>

                    <input
                      type="number"
                      id="quantity"
                      value={quantity}
                      onChange={(e) => {
                        const newQty = Math.max(
                          1,
                          parseInt(e.target.value) || 1
                        );
                        handleQuantityUpdate(newQty);
                      }}
                      min={moq}
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 text-center"
                      required
                    />

                    <button
                      type="button"
                      onClick={() => handleQuantityUpdate(quantity + 1)}
                      className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Price Input - Hanya untuk negotiate */}
                {transactionType === "negotiate" && (
                  <div>
                    <label
                      htmlFor="price"
                      className="block mb-2 text-sm font-medium text-gray-900"
                    >
                      Your Offer Price (IDR)
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
                        placeholder="Enter your offer"
                        required
                      />
                    </div>
                  </div>
                )}

                {/* Fixed Price Info - Hanya untuk directly */}
                {transactionType === "directly" && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-700 font-medium">
                        Fixed Price per unit:
                      </span>
                      <span className="text-lg font-bold text-green-600">
                        Rp {fixedPrice.toLocaleString("id-ID")}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <div>Quantity: {quantity} items</div>
                      <div className="text-green-700 font-medium mt-1">
                        {getCurrentTierInfo(quantity)}
                      </div>
                    </div>

                    {/* Price Tiers Info */}
                    {priceTiers.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-green-100">
                        <div className="text-xs font-medium text-gray-500 mb-1">
                          Available Price Tiers:
                        </div>
                        <div className="space-y-1 max-h-24 overflow-y-auto pr-2">
                          {[...priceTiers]
                            .sort((a, b) => a.minQty - b.minQty)
                            .map((tier, index) => (
                              <div
                                key={tier.id || index}
                                className={`flex justify-between text-xs px-2 py-1 rounded ${
                                  quantity >= tier.minQty
                                    ? "bg-green-100 text-green-800"
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
                  </div>
                )}

                {/* Notes Input */}
                <div>
                  <label
                    htmlFor="notes"
                    className="block mb-2 text-sm font-medium text-gray-900"
                  >
                    Notes (Optional)
                  </label>
                  <textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 resize-none"
                    placeholder="Add special instructions or notes..."
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
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Amount:</span>
                    <span className="font-semibold text-lg">
                      Rp{" "}
                      {transactionType === "directly"
                        ? (quantity * fixedPrice).toLocaleString("id-ID")
                        : (quantity * price).toLocaleString("id-ID")}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {quantity} item(s) × Rp{" "}
                    {transactionType === "directly"
                      ? fixedPrice.toLocaleString("id-ID")
                      : price.toLocaleString("id-ID")}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end p-4 md:p-5 border-t border-gray-200 rounded-b space-x-3">
                <button
                  type="button"
                  onClick={handleReset}
                  className="py-2.5 px-5 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`text-white font-medium rounded-lg text-sm px-5 py-2.5 text-center ${
                    transactionType === "directly"
                      ? "bg-green-600 hover:bg-green-700 focus:ring-4 focus:outline-none focus:ring-green-300"
                      : "bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300"
                  }`}
                >
                  {transactionType === "directly" ? "Buy Now" : "Submit Offer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
