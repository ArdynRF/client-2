'use client';
import Button from "@/components/ui/Button";
import Image from "next/image";
import React from "react";
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
  } = product;

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [fixedPrice, setFixedPrice] = React.useState(checkPrice());
  const handleAddToCart = (data) => {};

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
          <div className="my-7 space-y-1">
            <h3 className="text-sm font-medium text-gray-600">
              MOQ: {product.moq} pcs
            </h3>
            <div className="text-gray-500 font-medium">
              {colorStocks.reduce((total, color) => total + color.stock, 0)} item left
            </div>
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
              className="custom-outline-btn w-full rounded-2xl"
              onClick={() => setIsModalOpen(true)}
            >
              Add to Cart
            </Button>
            <Button className="w-full rounded-2xl">Buy Now</Button>
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
          quantity: product.moq,
          price: price,
          notes: "",
          fixedPrice: fixedPrice,
        }}
        priceTiers={priceTiers}
      />
    </>
  );
};

export default Product;
