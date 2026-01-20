"use client";
import { useState, useEffect } from "react";

export default function SampleOrderModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = {},
  title = "Order Sample",
}) {
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  const [selectedColorId, setSelectedColorId] = useState("");
  const [selectedColor, setSelectedColor] = useState(null);

  const colorStocks = initialData.colorStocks || [];
  const isOutOfStock = initialData.isOutOfStock || false;
  const productName = initialData.productName || "";
  const samplePrice = initialData.samplePrice || 0; // Harga sample
  const maxSampleQty = 5; // Maksimal 5 untuk sample

  const handleColorChange = (colorId) => {
    setSelectedColorId(colorId);
    const selected = colorStocks.find(
      (color) => color.id === parseInt(colorId)
    );
    setSelectedColor(selected);
  };

  useEffect(() => {
    if (isOpen && colorStocks.length > 0 && !selectedColorId) {
      const availableColor = colorStocks.find((color) => color.stock > 0);
      if (availableColor) {
        setSelectedColorId(availableColor.id.toString());
        setSelectedColor(availableColor);
      } else if (colorStocks.length > 0) {
        setSelectedColorId(colorStocks[0].id.toString());
        setSelectedColor(colorStocks[0]);
      }
    }
  }, [isOpen, colorStocks, selectedColorId]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!selectedColorId) {
      alert("Silakan pilih warna");
      return;
    }

    if (quantity < 1 || quantity > maxSampleQty) {
      alert(`Jumlah sample harus antara 1 - ${maxSampleQty} item`);
      return;
    }

    if (!isOutOfStock && selectedColor && quantity > selectedColor.stock) {
      alert("Jumlah melebihi stok yang tersedia untuk warna yang dipilih.");
      return;
    }

    onSubmit({
      quantity,
      price: samplePrice, // Selalu gunakan harga sample
      notes,
      colorId: parseInt(selectedColorId),
      colorData: selectedColor,
      colorName: selectedColor?.color || "",
      status: "Sample Order",
      orderType: "sample",
      isSample: true,
      samplePrice: samplePrice,
      totalPrice: quantity * samplePrice,
    });

    onClose();
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
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                  Sample
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
                    <span className="text-purple-600">Sample Order</span>
                  </div>
                  <p className="mt-1 text-xs text-purple-600">
                    Pesanan sample untuk pengujian kualitas (max {maxSampleQty}{" "}
                    pcs)
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit}>
              <div className="p-4 md:p-5 space-y-4">
                {/* Color Selection */}
                {colorStocks.length > 0 && (
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-900">
                      Pilih Warna (Opsional)
                    </label>
                    <div className="relative">
                      <select
                        className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white appearance-none text-gray-900"
                        value={selectedColorId || ""}
                        onChange={(e) => handleColorChange(e.target.value)}
                      >
                        <option value="">-- Pilih warna (opsional) --</option>
                        {colorStocks.map((colorStock) => {
                          const isAvailable =
                            isOutOfStock || colorStock.stock > 0;

                          return (
                            <option
                              key={colorStock.id}
                              value={colorStock.id}
                              disabled={!isAvailable}
                              className={`
                                ${
                                  isAvailable
                                    ? "text-gray-900"
                                    : "text-gray-400"
                                }
                                ${!isAvailable && "bg-gray-100"}
                              `}
                            >
                              {colorStock.color}{" "}
                              {!isAvailable
                                ? "(Habis)"
                                : `- ${colorStock.stock} pcs`}
                            </option>
                          );
                        })}
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
                  </div>
                )}

                {/* Quantity Input */}
                <div>
                  <label
                    htmlFor="quantity"
                    className="block mb-2 text-sm font-medium text-gray-900"
                  >
                    Jumlah Sample (max {maxSampleQty} pcs)
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="number"
                      id="quantity"
                      value={quantity}
                      onChange={(e) => {
                        let newQty = parseInt(e.target.value) || 1;
                        newQty = Math.max(1, Math.min(maxSampleQty, newQty));
                        setQuantity(newQty);
                      }}
                      min="1"
                      max={maxSampleQty}
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 block w-full p-2.5 text-center"
                      required
                    />
                  </div>
                  <p className="mt-1 text-xs text-purple-600">
                    ✓ Order sample untuk pengujian kualitas
                  </p>
                </div>

                {/* Price Info */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-700 font-medium">
                      Harga Sample per unit:
                    </span>
                    <span className="text-lg font-bold text-purple-600">
                      Rp {samplePrice.toLocaleString("id-ID")}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <div>Jumlah: {quantity} pcs</div>
                    <div className="text-purple-700 font-medium mt-1">
                      Fixed Price - Sample Order
                    </div>
                  </div>
                </div>

                {/* Notes Input */}
                <div>
                  <label
                    htmlFor="notes"
                    className="block mb-2 text-sm font-medium text-gray-900"
                  >
                    Catatan (Opsional)
                  </label>
                  <textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 block w-full p-2.5 resize-none"
                    placeholder="Tambahkan catatan untuk sample (misal: untuk pengujian warna, kualitas, dll...)"
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
                <div className="p-3 rounded-lg bg-purple-50 border border-purple-200">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-medium">
                      Total Pembayaran:
                    </span>
                    <span className="font-semibold text-lg text-gray-900">
                      Rp {(quantity * samplePrice).toLocaleString("id-ID")}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    <div className="flex justify-between">
                      <span>
                        {quantity} pcs × Rp{" "}
                        {samplePrice.toLocaleString("id-ID")}
                      </span>
                      <span className="text-purple-700 font-medium">
                        Sample Order
                      </span>
                    </div>
                    <p className="text-xs text-purple-600 mt-1">
                      Sample akan dikirim dalam 1-2 hari kerja
                    </p>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end p-4 md:p-5 border-t border-gray-200 rounded-b space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="py-2.5 px-5 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-purple-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="text-white bg-purple-600 hover:bg-purple-700 focus:ring-4 focus:outline-none focus:ring-purple-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                  disabled={!quantity}
                >
                  Order Sample
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
