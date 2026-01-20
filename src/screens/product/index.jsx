"use client";
import Button from "@/components/ui/Button";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import ToCartQuantity from "@/components/modal/Penawaran";
import BuyNowModal from "@/components/modal/BuyNowModal";
import SampleOrderModal from "@/components/modal/SampleOrderModal"; // Tambahkan modal sample
import { handleToCartAction } from "@/actions/cartActions";
import { useRouter } from "next/navigation";

const Product = ({ product }) => {
  const {
    id,
    name,
    image,
    description,
    priceTiers = [],
    colorStocks = [],
    productType,
    moq,
    sample_price, 
    currentStock,
    sampleProducts = [], 
    weight,
    width,
    technics = [],
    styles = [],
    patterns = [],
  } = product;

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  const router = useRouter();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBuyNowModalOpen, setIsBuyNowModalOpen] = useState(false);
  const [isSampleModalOpen, setIsSampleModalOpen] = useState(false); // State untuk modal sample
  const [fixedPrice, setFixedPrice] = useState(checkPrice());
  const [isOutOfStock, setIsOutOfStock] = useState(false);
  const [totalStock, setTotalStock] = useState(0);
  const [hasAvailableColors, setHasAvailableColors] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [checkoutStatus, setCheckoutStatus] = useState("Buy Now");
  const price = checkPrice();

  // Cek apakah ada harga sample
  const hasSampleOption =  sample_price > 0;

  function checkPrice() {
    priceTiers.sort((a, b) => a.minQty - b.minQty);
    return priceTiers[0]?.unitPrice || 0;
  }

  function calculatePriceByQuantity(quantity) {
    if (!priceTiers.length) return 0;

    const sortedTiers = [...priceTiers].sort((a, b) => b.minQty - a.minQty);

    const applicableTier = sortedTiers.find((tier) => quantity >= tier.minQty);

    return applicableTier
      ? applicableTier.unitPrice
      : sortedTiers[sortedTiers.length - 1].unitPrice;
  }

  function handleQuantityChange(quantity) {
    const newPrice = calculatePriceByQuantity(quantity);
    setFixedPrice(newPrice);
  }

  // Calculate stock availability
  useEffect(() => {
    const total = colorStocks.reduce((total, color) => total + color.stock, 0);
    setTotalStock(total);

    const available = colorStocks.some((color) => color.stock >= moq);
    setHasAvailableColors(available);

    const outOfStock =
      colorStocks.every((color) => color.stock < moq) || total === 0;
    setIsOutOfStock(outOfStock);

    if (outOfStock) {
      setCheckoutStatus("Pre Order");
    }

    console.log(product)
  }, [colorStocks, moq]);

  const handleAddToCart = async (data) => {
    setIsAddingToCart(true);
    try {
      await handleToCartAction(data);
      setIsModalOpen(false);
      alert("Item added to cart successfully!");
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Failed to add item to cart. Please try again.");
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleDirectCheckout = (status, quantity, color = null, notes = "") => {
    let selectedPrice;

    if (status === "Sample Order") {
      selectedPrice = sample_price; 
    } else {
      selectedPrice = calculatePriceByQuantity(quantity); 
    }

    const totalPrice = selectedPrice * quantity;

    const checkoutData = {
      productId: id,
      productName: name,
      quantity: quantity,
      unitPrice: selectedPrice,
      totalPrice: totalPrice,
      status: status,
      color: color?.color,
      notes: notes,
      moq: moq,
      isOutOfStock: isOutOfStock,
      productImage: image,
      productType: productType?.name,
      isSampleOrder: status === "Sample Order", 
      samplePrice: sample_price,

      productDetails: {
        weight: weight,
        width: width,
        technics: technics.map((t) => t.name),
        styles: styles.map((s) => s.name),
        patterns: patterns.map((p) => p.name),
      },
    };

    const encodedData = encodeURIComponent(JSON.stringify(checkoutData));
    router.push(`/directcheckout?data=${encodedData}`);
  };

  return (
    <>
      <div className="my-10 p-5 rounded-xl bg-white grid grid-cols-2 gap-5">
        {/* Gambar Produk */}
        <div className="w-full h-full bg-gray-100 rounded-xl p-3">
          <Image
            className="w-full h-full max-h-[calc(100vh-150px)] rounded-xl m-auto"
            src={`${BASE_URL}/${image}`}
            alt="product"
            width={0}
            height={0}
            sizes="100vw"
          />
        </div>

        {/* Informasi Produk */}
        <div className="px-5">
          <div className="flex justify-end">
            <div className="product-type-label">
              {productType?.name ?? "Unknown Type"}
            </div>
          </div>

          <h1 className="text-2xl font-medium">{name}</h1>

          {/* Harga dan Stock */}
          <div className="my-7 space-y-3">
            <h3 className="text-sm font-medium text-gray-600">
              MOQ: {moq} pcs
            </h3>

            {/* Tampilkan harga sample jika ada */}
            {hasSampleOption && (
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-purple-700">
                    Sample Price:
                  </span>
                  <span className="text-lg font-bold text-purple-600">
                    Rp {sample_price.toLocaleString("id-ID")}
                  </span>
                </div>
                <p className="text-sm text-purple-600 mt-1">
                  ✓ Order sample untuk pengujian (max 5 pcs)
                </p>
              </div>
            )}

            <div className="text-gray-500 font-medium">
              {totalStock > 0 ? `${totalStock} item left` : "Out of Stock"}
            </div>

            {/* Stock Status Warning */}
            {isOutOfStock && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <svg
                    className="w-5 h-5 text-red-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-red-600 font-medium">Stock Habis</span>
                </div>
                <p className="text-sm text-red-500 mt-1">
                  {colorStocks.length === 0
                    ? "Tidak ada warna tersedia"
                    : `Stock semua warna di bawah MOQ (${moq} pcs)`}
                </p>
              </div>
            )}
          </div>

          {/* Price Tiers - 2 Kolom */}
          <div className="my-7 space-y-4">
            <h6 className="text-lg font-semibold">Pricing by Quantity</h6>
            <div className="grid grid-cols-2 gap-5">
              {priceTiers.map((tier, index) => (
                <div
                  key={index}
                  className="border border-gray-300 rounded-xl p-3 text-center"
                >
                  <div className="text-xl font-bold text-indigo-600">
                    ${tier.unitPrice}
                  </div>
                  <div className="text-sm text-gray-500">
                    Min: {tier.minQty}
                    <br />
                    Max: {tier.maxQty ?? "∞"}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Deskripsi Produk */}
          <p className="text-lg font-semibold">Description</p>
          <p className="text-gray-600">{description}</p>

          {/* Tombol Section */}
          <div className="my-7 space-y-3">
            {/* Tombol utama dalam satu baris */}
            <div className="flex gap-x-5">
              <Button
                className={`custom-outline-btn w-full rounded-2xl ${
                  isOutOfStock
                    ? "opacity-50 cursor-not-allowed hover:bg-gray-100 hover:text-gray-700"
                    : ""
                }`}
                onClick={() => setIsModalOpen(true)}
                disabled={isOutOfStock}
              >
                {isOutOfStock ? "Stock Habis" : "Add to Cart"}
              </Button>

              <Button
                className={`w-full rounded-2xl ${
                  isOutOfStock
                    ? "bg-yellow-500 hover:bg-yellow-600"
                    : "bg-blue-500 hover:bg-blue-600"
                } text-white`}
                onClick={() => setIsBuyNowModalOpen(true)}
              >
                {isOutOfStock ? "Pre Order" : "Buy Now"}
              </Button>
            </div>

            {/* Tombol Order Sample - hanya muncul jika ada harga sample */}
            {hasSampleOption && (
              <Button
                className="w-full rounded-2xl bg-purple-600 hover:bg-purple-700 text-white"
                onClick={() => setIsSampleModalOpen(true)}
              >
                Order Sample
              </Button>
            )}
          </div>

          {/* Additional stock info for each color */}
          <div className="mt-6 border-t pt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Stock per Warna:
            </h4>
            <div className="space-y-2">
              {colorStocks.map((color) => (
                <div
                  key={color.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-4 h-4 rounded-full border border-gray-300"
                      style={{ backgroundColor: color.color }}
                    />
                    <span className="text-sm text-gray-600">{color.color}</span>
                  </div>
                  <div
                    className={`text-sm font-medium ${
                      color.stock >= moq
                        ? "text-green-600"
                        : color.stock > 0
                        ? "text-yellow-600"
                        : "text-red-600"
                    }`}
                  >
                    {color.stock} pcs
                    {color.stock < moq && color.stock > 0 && (
                      <span className="text-xs text-gray-500 ml-1">
                        (below MOQ)
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Detail Produk */}
      <div className="my-10 p-5 rounded-xl bg-white col-span-2">
        <h2 className="text-3xl font-bold mb-6">Detail Product</h2>
        <div className="border-t border-gray-300 divide-y divide-gray-300 text-gray-700 text-md">
          {/* Baris detail */}
          {[
            ["Nama Barang", name],
            ["Product Type", productType?.name ?? "-"],
            ["Description", description ?? "-"],
            ["Current Stock", currentStock ?? "-"],
            ["Weight", weight ?? "-"],
            ["Width", width ?? "-"],
            ["Technic", technics?.map((t) => t.name).join(", ") || "-"],
            ["Style", styles?.map((s) => s.name).join(", ") || "-"],
            ["Pattern", patterns?.map((p) => p.name).join(", ") || "-"],
            ["Color", colorStocks?.map((c) => c.color).join(", ") || "-"],
            ["MOQ", `${moq} pcs`],
            ["Available Stock", `${totalStock} pcs`],
            ["Stock Status", isOutOfStock ? "Habis" : "Tersedia"],
            hasSampleOption
              ? ["Sample Price", `Rp ${sample_price.toLocaleString("id-ID")}`]
              : null,
          ]
            .filter(Boolean)
            .map(([label, value], i) => (
              <div
                key={i}
                className="py-3 flex justify-between items-start border-b border-gray-300"
              >
                <div className="w-1/2 pr-4 font-medium border-r border-gray-300">
                  {label}
                </div>
                <div className="w-1/2 pl-4">{value}</div>
              </div>
            ))}
        </div>
      </div>

      {/* Modal Add to Cart */}
      <ToCartQuantity
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddToCart}
        initialData={{
          quantity: moq,
          price: price,
          notes: "",
          fixedPrice: fixedPrice,
          colorStocks: colorStocks,
          moq: moq,
          productId: id,
        }}
        priceTiers={priceTiers}
      />

      {/* Modal Buy Now / Pre Order */}
      <BuyNowModal
        isOpen={isBuyNowModalOpen}
        onClose={() => setIsBuyNowModalOpen(false)}
        onSubmit={(data) => {
          const status = isOutOfStock ? "Pre Order" : "Buy Now";
          handleDirectCheckout(
            status,
            data.quantity,
            data.colorData,
            data.notes
          );
        }}
        initialData={{
          quantity: moq,
          price: price,
          colorStocks: colorStocks,
          moq: moq,
          isOutOfStock: isOutOfStock,
          productName: name,
        }}
        priceTiers={priceTiers}
        calculatePrice={calculatePriceByQuantity}
      />

      {/* Modal Order Sample */}
      <SampleOrderModal
        isOpen={isSampleModalOpen}
        onClose={() => setIsSampleModalOpen(false)}
        onSubmit={(data) => {
          // Kirim dengan status "Sample Order"
          handleDirectCheckout(
            "Sample Order",
            data.quantity,
            data.colorData,
            data.notes
          );
        }}
        initialData={{
          colorStocks: colorStocks,
          sampleProducts: sampleProducts,
          isOutOfStock: isOutOfStock,
          productName: name,
          samplePrice: sample_price, // Kirim harga sample ke modal
        }}
        title={`Order Sample - ${name}`}
      />
    </>
  );
};

export default Product;
