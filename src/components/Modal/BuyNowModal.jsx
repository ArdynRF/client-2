import { useState, useEffect } from "react";

export default function BuyNowModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = {},
  title = "Buy Now",
  priceTiers = [],
}) {
  const [quantity, setQuantity] = useState(initialData.quantity || 1);
  const [notes, setNotes] = useState(initialData.notes || "");
  const [fixedPrice, setFixedPrice] = useState(initialData.price || 0);
  const [selectedColorId, setSelectedColorId] = useState("");
  const [selectedColor, setSelectedColor] = useState(null);

  const colorStocks = initialData.colorStocks || [];
  const moq = initialData.moq || 1;
  const isOutOfStock = initialData.isOutOfStock || false;
  const productName = initialData.productName || "";
  const sortedTiers = [...priceTiers].sort((a, b) => b.minQty - a.minQty);

  
  const handleColorChange = (colorId) => {
    setSelectedColorId(colorId);
    const selected = colorStocks.find(
      (color) => color.id === parseInt(colorId)
    );
    setSelectedColor(selected);
  };

  
  const calculateFixedPrice = (qty) => {
    if (priceTiers.length === 0) return 0;

    
    const sortedTiers = [...priceTiers].sort((a, b) => b.minQty - a.minQty);

    
    const applicableTier = sortedTiers.find((tier) => qty >= tier.minQty);

    
    
    if (applicableTier) {
      return applicableTier.unitPrice;
    } else {
      
      const smallestTier = sortedTiers.reduce((prev, current) =>
        prev.minQty < current.minQty ? prev : current
      );
      return smallestTier?.unitPrice || 0;
    }
  };

  
  const getCurrentTierInfo = (qty) => {
    if (priceTiers.length === 0) return "";

    const sortedTiers = [...priceTiers].sort((a, b) => a.minQty - b.minQty);
    const applicableTier = calculateFixedPrice(qty);

    
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

  
  const getStockStatus = (stock) => {
    if (stock > 10)
      return { label: "Tersedia", class: "text-green-600 bg-green-50" };
    if (stock > 5)
      return { label: "Terbatas", class: "text-yellow-600 bg-yellow-50" };
    if (stock > 0)
      return { label: "Hampir Habis", class: "text-orange-600 bg-orange-50" };
    return { label: "Habis", class: "text-red-600 bg-red-50" };
  };

  
  useEffect(() => {
    const newFixedPrice = calculateFixedPrice(quantity);
    setFixedPrice(newFixedPrice);
  }, [quantity, priceTiers]);

  
  useEffect(() => {
    if (colorStocks.length > 0 && !selectedColorId) {
      const availableColor = colorStocks.find((color) => color.stock > 0);
      if (availableColor) {
        setSelectedColorId(availableColor.id.toString());
        setSelectedColor(availableColor);
      } else if (colorStocks.length > 0) {
        
        setSelectedColorId(colorStocks[0].id.toString());
        setSelectedColor(colorStocks[0]);
      }
    }
  }, [colorStocks]);

  const handleSubmit = (e) => {
    e.preventDefault();

    
    if (!selectedColorId) {
      alert("Please select a color");
      return;
    }

    
    if (isOutOfStock && quantity < moq) {
      alert(`Minimum order quantity for pre-order: ${moq} items`);
      return;
    }

    
    if (!isOutOfStock && selectedColor && quantity > selectedColor.stock) {
      alert("Quantity exceeds available stock for the selected color.");
      return;
    }

    onSubmit({
      quantity,
      price: fixedPrice,
      notes,
      colorId: parseInt(selectedColorId),
      colorData: selectedColor,
      colorName: selectedColor?.color || "",
      status: isOutOfStock ? "Pre Order" : "Buy Now",
      totalPrice: quantity * fixedPrice,
    });

    onClose();
  };

  const handleReset = () => {
    setQuantity(initialData.quantity || 1);
    setNotes(initialData.notes || "");
    setFixedPrice(initialData.price || 0);
    setSelectedColorId("");
    setSelectedColor(null);

    
    if (colorStocks.length > 0) {
      const availableColor = colorStocks.find((color) => color.stock > 0);
      if (availableColor) {
        setSelectedColorId(availableColor.id.toString());
        setSelectedColor(availableColor);
      } else {
        setSelectedColorId(colorStocks[0].id.toString());
        setSelectedColor(colorStocks[0]);
      }
    }
  };

  const handleQuantityUpdate = (newQuantity) => {
    setQuantity(newQuantity);
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
              <div className="flex items-center space-x-2">
                <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  isOutOfStock 
                    ? "bg-yellow-100 text-yellow-800" 
                    : "bg-green-100 text-green-800"
                }`}>
                  {isOutOfStock ? "Pre Order" : "Buy Now"}
                </span>
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

            {/* Product Info */}
            <div className="p-4 md:p-5 border-b bg-gray-50">
              <div className="flex items-start space-x-3">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{productName}</h4>
                  <div className="mt-1 text-sm text-gray-600">
                    <span className="font-medium">Status:</span>{" "}
                    <span className={isOutOfStock ? "text-yellow-600" : "text-green-600"}>
                      {isOutOfStock ? "Pre Order (Stock Habis)" : "Ready Stock"}
                    </span>
                  </div>
                  {isOutOfStock && (
                    <p className="mt-1 text-xs text-yellow-600">
                      Produk ini akan diproses setelah stock tersedia
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit}>
              <div className="p-4 md:p-5 space-y-4">
                {/* Color Selection */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900">
                    Pilih Warna
                  </label>
                  <div className="relative">
                    <select
                      className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white appearance-none text-gray-900"
                      value={selectedColorId || ""}
                      onChange={(e) => handleColorChange(e.target.value)}
                      required
                    >
                      {colorStocks.length === 0 ? (
                        <option value="">Tidak ada warna tersedia</option>
                      ) : (
                        <>
                          <option value="" disabled>
                            -- Pilih warna --
                          </option>
                          {colorStocks.map((colorStock) => {
                            const stockStatus = getStockStatus(
                              colorStock.stock
                            );
                            const isAvailable = isOutOfStock ? true : colorStock.stock > 0;

                            return (
                              <option
                                key={colorStock.id}
                                value={colorStock.id}
                                disabled={!isAvailable && !isOutOfStock}
                                className={`
                                  ${
                                    isAvailable || isOutOfStock
                                      ? "text-gray-900"
                                      : "text-gray-400"
                                  }
                                  ${!isAvailable && !isOutOfStock && "bg-gray-100"}
                                `}
                              >
                                {colorStock.color}{" "}
                                {!isAvailable && !isOutOfStock
                                  ? `(${stockStatus.label})`
                                  : `- ${colorStock.stock} pcs`}
                                {isOutOfStock && " (Pre Order)"}
                              </option>
                            );
                          })}
                        </>
                      )}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Preview warna yang dipilih */}
                  {selectedColor && (
                    <div className="mt-3 p-3 border border-gray-200 rounded-lg bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">
                          Warna dipilih:
                        </h4>
                        {!isOutOfStock && (
                          <span
                            className={`text-xs font-medium px-2 py-1 rounded-full ${
                              getStockStatus(selectedColor.stock).class
                            }`}
                          >
                            {getStockStatus(selectedColor.stock).label}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-3">
                        <div>
                          <p className="font-medium text-gray-900">
                            {selectedColor.color}
                          </p>
                          <p className="text-sm text-gray-600">
                            Stok: {selectedColor.stock} pcs
                            {isOutOfStock && " (Pre Order)"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Quantity Input */}
                <div>
                  <label
                    htmlFor="quantity"
                    className="block mb-2 text-sm font-medium text-gray-900"
                  >
                    Quantity
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
                        handleQuantityUpdate(newQty);
                      }}
                      min={moq}
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 text-center"
                      required
                    />
                  </div>
                  {moq > 1 && (
                    <p className="mt-1 text-xs text-gray-500">
                      Minimum order quantity: {moq} items
                    </p>
                  )}
                </div>

                {/* Fixed Price Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-700 font-medium">
                      {isOutOfStock ? "Pre Order Price" : "Fixed Price"} per unit:
                    </span>
                    <span className="text-lg font-bold text-blue-600">
                      Rp {fixedPrice.toLocaleString("id-ID")}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <div>Quantity: {quantity} items</div>
                    <div className="text-blue-700 font-medium mt-1">
                      {getCurrentTierInfo(quantity)}
                    </div>
                  </div>

                  {/* Price Tiers Info */}
                  {priceTiers.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-blue-100">
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
                </div>

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
                <div className={`p-3 rounded-lg ${isOutOfStock ? 'bg-yellow-50 border border-yellow-200' : 'bg-green-50 border border-green-200'}`}>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-medium">Total Amount:</span>
                    <span className="font-semibold text-lg text-gray-900">
                      Rp {(quantity * fixedPrice).toLocaleString("id-ID")}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    <div className="flex justify-between">
                      <span>{quantity} item(s) × Rp {fixedPrice.toLocaleString("id-ID")}</span>
                      <span className={isOutOfStock ? "text-yellow-700 font-medium" : "text-green-700 font-medium"}>
                        {isOutOfStock ? "Pre Order" : "Ready Stock"}
                      </span>
                    </div>
                    {isOutOfStock && (
                      <p className="text-xs text-yellow-600 mt-1">
                        Pembayaran akan diminta setelah stock tersedia
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end p-4 md:p-5 border-t border-gray-200 rounded-b space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="py-2.5 px-5 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`text-white font-medium rounded-lg text-sm px-5 py-2.5 text-center ${
                    isOutOfStock
                      ? "bg-yellow-600 hover:bg-yellow-700 focus:ring-4 focus:outline-none focus:ring-yellow-300"
                      : "bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300"
                  }`}
                  disabled={!selectedColorId}
                >
                  {isOutOfStock ? "Pre Order Now" : "Proceed to Checkout"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}