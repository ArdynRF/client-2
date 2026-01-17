'use client';
import Button from "@/components/ui/Button";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import ToCartQuantity from "@/components/modal/Penawaran";

// Kamu bisa ubah props di sini agar data produk masuk dari luar
const Product = ({ product }) => {
  const {
    name,
    image,
    description,
    priceTiers = [],
    colorStocks = [],
    productType,
    moq,
  } = product;

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fixedPrice, setFixedPrice] = useState(checkPrice());
  const [isOutOfStock, setIsOutOfStock] = useState(false);
  const [totalStock, setTotalStock] = useState(0);
  const [hasAvailableColors, setHasAvailableColors] = useState(false);

  const handleAddToCart = (data) => {
    console.log("Add to cart data:", data);
    // Implement your add to cart logic here
  };

  const price = checkPrice();

  function checkPrice() {
    priceTiers.sort((a, b) => a.minQty - b.minQty);
    return priceTiers[0]?.unitPrice || 0;
  }

  function handleQuantityChange(quantity) {
    let applicableTier = priceTiers
      .filter((tier) => quantity >= tier.minQty)
      .sort((a, b) => b.minQty - a.minQty)[0];

    if (applicableTier) {
      setFixedPrice(applicableTier.unitPrice);
    } else {
      setFixedPrice(priceTiers[0]?.unitPrice || 0);
    }
  }

  // Calculate stock availability
  useEffect(() => {
    // Calculate total stock
    const total = colorStocks.reduce((total, color) => total + color.stock, 0);
    setTotalStock(total);

    // Check if any color has stock >= MOQ
    const available = colorStocks.some(color => color.stock >= moq);
    setHasAvailableColors(available);

    // Check if product is out of stock
    const outOfStock = colorStocks.every(color => color.stock < moq) || total === 0;
    setIsOutOfStock(outOfStock);
  }, [colorStocks, moq]);

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
            <div className="text-gray-500 font-medium">
              {totalStock > 0 ? `${totalStock} item left` : 'Out of Stock'}
            </div>
            
            {/* Stock Status Warning */}
            {isOutOfStock && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
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

          {/* Tombol */}
          <div className="my-7 flex gap-x-5">
            <Button
              className={`custom-outline-btn w-full rounded-2xl ${
                isOutOfStock 
                  ? 'opacity-50 cursor-not-allowed hover:bg-gray-100 hover:text-gray-700' 
                  : ''
              }`}
              onClick={() => setIsModalOpen(true)}
              disabled={isOutOfStock}
            >
              {isOutOfStock ? 'Stock Habis' : 'Add to Cart'}
            </Button>
            <Button 
              className={`w-full rounded-2xl ${
                isOutOfStock 
                  ? 'opacity-50 cursor-not-allowed hover:bg-blue-600' 
                  : ''
              }`}
              disabled={isOutOfStock}
            >
              {isOutOfStock ? 'Stock Habis' : 'Buy Now'}
            </Button>
          </div>
          
          {/* Additional stock info for each color */}
          <div className="mt-6 border-t pt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Stock per Warna:</h4>
            <div className="space-y-2">
              {colorStocks.map((color) => (
                <div key={color.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-4 h-4 rounded-full border border-gray-300"
                      style={{ backgroundColor: color.color }}
                    />
                    <span className="text-sm text-gray-600">{color.color}</span>
                  </div>
                  <div className={`text-sm font-medium ${
                    color.stock >= moq 
                      ? 'text-green-600' 
                      : color.stock > 0 
                      ? 'text-yellow-600' 
                      : 'text-red-600'
                  }`}>
                    {color.stock} pcs
                    {color.stock < moq && color.stock > 0 && (
                      <span className="text-xs text-gray-500 ml-1">(below MOQ)</span>
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
            ["Nama Barang", product.name],
            ["Product Type", product.productType?.name ?? "-"],
            ["Description", product.description ?? "-"],
            ["Current Stock", product.currentStock ?? "-"],
            ["Weight", product.weight ?? "-"],
            ["Width", product.width ?? "-"],
            ["Yarn Number", product.yarnNumber ?? "-"],
            ["Technic", product.technics?.map((t) => t.name).join(", ") || "-"],
            ["Style", product.styles?.map((s) => s.name).join(", ") || "-"],
            ["Pattern", product.patterns?.map((p) => p.name).join(", ") || "-"],
            [
              "Color",
              product.colorStocks?.map((c) => c.color).join(", ") || "-",
            ],
            ["MOQ", `${moq} pcs`],
            ["Available Stock", `${totalStock} pcs`],
            ["Stock Status", isOutOfStock ? "Habis" : "Tersedia"],
          ].map(([label, value], i) => (
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
        }}
        priceTiers={priceTiers}
      />
    </>
  );
};

export default Product;