"use client";
import Button from "@/components/ui/Button";
import Image from "next/image";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import ToCartQuantity from "@/components/modal/Penawaran";
import BuyNowModal from "@/components/modal/BuyNowModal";
import SampleOrderModal from "@/components/modal/SampleOrderModal";
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
    images = [],
  } = product;

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  const router = useRouter();

  // ========== FUNGSI UTAMA DULU ==========

  // Fungsi checkPrice
  const checkPrice = useCallback(() => {
    if (!priceTiers.length) return 0;
    const sorted = [...priceTiers].sort((a, b) => a.minQty - b.minQty);
    return sorted[0]?.unitPrice || 0;
  }, [priceTiers]);

  // Fungsi calculatePriceByQuantity
  const calculatePriceByQuantity = useCallback(
    (quantity) => {
      if (!priceTiers.length) return 0;
      const sortedTiers = [...priceTiers].sort((a, b) => b.minQty - a.minQty);
      const applicableTier = sortedTiers.find(
        (tier) => quantity >= tier.minQty,
      );
      return applicableTier
        ? applicableTier.unitPrice
        : sortedTiers[sortedTiers.length - 1].unitPrice;
    },
    [priceTiers],
  );

  // ========== STATE SETELAH FUNGSI ==========

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBuyNowModalOpen, setIsBuyNowModalOpen] = useState(false);
  const [isSampleModalOpen, setIsSampleModalOpen] = useState(false);
  const [fixedPrice, setFixedPrice] = useState(() => checkPrice()); // SEKARANG checkPrice sudah didefinisikan
  const [isOutOfStock, setIsOutOfStock] = useState(false);
  const [totalStock, setTotalStock] = useState(0);
  const [hasAvailableColors, setHasAvailableColors] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [checkoutStatus, setCheckoutStatus] = useState("Buy Now");

  // State untuk carousel
  const [selectedImage, setSelectedImage] = useState(0);

  // ========== MEMOIZED VALUES ==========

  const price = useMemo(() => checkPrice(), [checkPrice]);

  // Cek apakah ada harga sample
  const hasSampleOption = useMemo(() => sample_price > 0, [sample_price]);

  // Product Images dengan useMemo - FIXED VERSION
  const productImages = useMemo(() => {
    console.log("Processing images:", {
      mainImage: image,
      additionalImages: images,
    });

    // Main image
    const mainImage = image
      ? {
          id: 0,
          url: image.startsWith("http") ? image : `${BASE_URL}/${image}`,
          alt: `${name} - Main Image`,
          isMain: true,
        }
      : null;

    // Additional images - PERBAIKAN DI SINI
    const additionalImages = Array.isArray(images)
      ? images
          .filter((img) => img && img.url) // Filter hanya yang punya URL
          .map((img, idx) => {
            console.log(`Image ${idx}:`, img);
            return {
              id: img.id || idx + 1,
              // PERHATIAN: img.url sudah berisi path lengkap dari database
              // Tidak perlu tambahkan BASE_URL di depan jika sudah relatif
              url: img.url.startsWith("http")
                ? img.url
                : img.url.startsWith("/")
                  ? `${BASE_URL}${img.url}`
                  : `${BASE_URL}/${img.url}`,
              alt: img.alt || `${name} - Image ${idx + 2}`,
              order: img.order || idx,
            };
          })
          .sort((a, b) => (a.order || 0) - (b.order || 0)) // Sort by order
      : [];

    console.log("Final productImages:", {
      mainImage,
      additionalImagesCount: additionalImages.length,
      allImages: mainImage
        ? [mainImage, ...additionalImages]
        : additionalImages,
    });

    return mainImage ? [mainImage, ...additionalImages] : additionalImages;
  }, [image, images, BASE_URL, name]);
  // ========== EFFECTS ==========

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
  }, [colorStocks, moq]);

  // ========== HANDLERS ==========

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

  const handleDirectCheckout = useCallback(
    (status, quantity, color = null, notes = "") => {
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
    },
    [
      calculatePriceByQuantity,
      id,
      name,
      moq,
      isOutOfStock,
      image,
      productType,
      sample_price,
      weight,
      width,
      technics,
      styles,
      patterns,
      router,
    ],
  );

  // Navigation carousel
  const nextImage = useCallback(() => {
    setSelectedImage((prev) =>
      prev === productImages.length - 1 ? 0 : prev + 1,
    );
  }, [productImages.length]);

  const prevImage = useCallback(() => {
    setSelectedImage((prev) =>
      prev === 0 ? productImages.length - 1 : prev - 1,
    );
  }, [productImages.length]);

  // SVG Icons inline
  const ChevronLeftIcon = ({ className }) => (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M15 19l-7-7 7-7"
      />
    </svg>
  );

  const ChevronRightIcon = ({ className }) => (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M9 5l7 7-7 7"
      />
    </svg>
  );

  const HomeIcon = ({ className }) => (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
      />
    </svg>
  );

  // ========== RENDER ==========

  return (
    <div className="min-h-screen bg-gray-50 w-full">
      {/* Breadcrumbs - FULL WIDTH tanpa batasan max-width */}
      <div className="w-full bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-2 text-sm">
            <a
              href="/"
              className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
            >
              <HomeIcon className="w-4 h-4" />
              Home
            </a>
            <span className="text-gray-400">/</span>
            <a href="/products" className="text-gray-600 hover:text-gray-900">
              Products
            </a>
            <span className="text-gray-400">/</span>
            <span className="text-gray-500">{productType?.name}</span>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-medium truncate max-w-xs">
              {name}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content - FULL WIDTH tanpa max-w-7xl di container utama */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Product Layout Grid - sekarang full width */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Image Carousel (50% width) */}
          <div className="lg:w-1/2">
            <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
              {/* Main Image Container */}
              <div className="relative mb-6">
                <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 relative">
                  {productImages.length > 0 ? (
                    <Image
                      src={productImages[selectedImage].url}
                      alt={productImages[selectedImage].alt}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      priority
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <span className="text-gray-400">No image available</span>
                    </div>
                  )}

                  {/* Navigation Arrows - Hanya muncul jika ada lebih dari 1 gambar */}
                  {productImages.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full shadow-xl flex items-center justify-center hover:bg-white hover:scale-105 transition-all duration-200"
                        aria-label="Previous image"
                      >
                        <ChevronLeftIcon className="w-6 h-6 text-gray-800" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full shadow-xl flex items-center justify-center hover:bg-white hover:scale-105 transition-all duration-200"
                        aria-label="Next image"
                      >
                        <ChevronRightIcon className="w-6 h-6 text-gray-800" />
                      </button>
                    </>
                  )}
                </div>

                {/* Image Counter */}
                {productImages.length > 1 && (
                  <div className="absolute bottom-6 right-6 bg-black/70 text-white px-3 py-1.5 rounded-full text-sm font-medium shadow-lg">
                    {selectedImage + 1} / {productImages.length}
                  </div>
                )}
              </div>

              {/* Thumbnail Images dengan lebih banyak spacing */}
              {productImages.length > 1 && (
                <div className="pt-4 border-t border-gray-100">
                  <h4 className="text-sm font-semibold text-gray-700 mb-4">
                    Gallery
                  </h4>
                  <div className="grid grid-cols-4 gap-4">
                    {productImages.map((img, index) => (
                      <button
                        key={img.id}
                        onClick={() => setSelectedImage(index)}
                        className={`aspect-square rounded-lg overflow-hidden border-3 transition-all transform hover:scale-105 ${
                          selectedImage === index
                            ? "border-blue-500 ring-4 ring-blue-100"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        aria-label={`View image ${index + 1}`}
                      >
                        <div className="relative w-full h-full">
                          <Image
                            src={img.url}
                            alt={img.alt}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 25vw, 12.5vw"
                          />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Product Info (50% width) */}
          <div className="lg:w-1/2">
            <div className="bg-white rounded-2xl shadow-lg p-6 lg:p-8 hover:shadow-xl transition-shadow duration-300">
              {/* Product Header dengan lebih banyak spacing */}
              <div className="mb-8">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <span className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                      {productType?.name}
                    </span>
                    <span
                      className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                        isOutOfStock
                          ? "bg-amber-100 text-amber-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {isOutOfStock ? "Pre-Order" : "In Stock"}
                    </span>
                  </div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                    {name}
                  </h1>
                  <p className="text-gray-600 text-lg leading-relaxed mt-2">
                    {description}
                  </p>
                </div>
              </div>

              {/* Price Section dengan lebih banyak spacing */}
              <div className="mb-10 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
                <div className="flex flex-col gap-4">
                  <div>
                    <div className="flex items-baseline gap-3">
                      <span className="text-5xl font-bold text-gray-900">
                        Rp {price.toLocaleString("id-ID")}
                      </span>
                      <span className="text-lg text-gray-500">/ unit</span>
                    </div>
                    <p className="text-gray-600 mt-2">
                      Starting price based on MOQ
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700">MOQ</p>
                      <div className="text-xl font-semibold text-blue-700">
                        {moq} pcs
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700">
                        Available Stock
                      </p>
                      <div
                        className={`text-xl font-semibold ${totalStock > 0 ? "text-green-700" : "text-red-700"}`}
                      >
                        {totalStock.toLocaleString()} pcs
                      </div>
                    </div>
                  </div>

                  {/* Sample Price dengan spacing lebih */}
                  {hasSampleOption && (
                    <div className="mt-4 pt-4 border-t border-blue-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-purple-700">
                            Sample Order Available
                          </p>
                          <p className="text-xs text-gray-600">
                            Test product quality before bulk order
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-purple-700">
                            Rp {sample_price.toLocaleString("id-ID")}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons dengan spacing lebih */}
              <div className="space-y-6 mb-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Button
                    className={`w-full py-4 rounded-xl text-lg font-semibold transition-all duration-300 ${
                      isOutOfStock
                        ? "bg-gray-100 text-gray-700 border-2 border-gray-300 hover:bg-gray-200 hover:border-gray-400"
                        : "bg-blue-600 hover:bg-blue-700 hover:scale-[1.02] text-white shadow-lg hover:shadow-xl"
                    }`}
                    onClick={() => setIsModalOpen(true)}
                    disabled={isOutOfStock}
                  >
                    {isOutOfStock ? "Out of Stock" : "🛒 Add to Cart"}
                  </Button>

                  <Button
                    className={`w-full py-4 rounded-xl text-lg font-semibold transition-all duration-300 hover:scale-[1.02] shadow-lg hover:shadow-xl ${
                      isOutOfStock
                        ? "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white"
                        : "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white"
                    }`}
                    onClick={() => setIsBuyNowModalOpen(true)}
                  >
                    {isOutOfStock ? "📝 Pre-Order Now" : "⚡ Buy Now"}
                  </Button>
                </div>

                {/* Sample Order Button dengan spacing lebih */}
                {hasSampleOption && (
                  <div className="pt-4">
                    <Button
                      className="w-full py-4 rounded-xl text-lg font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 hover:scale-[1.02] text-white shadow-lg hover:shadow-xl transition-all duration-300"
                      onClick={() => setIsSampleModalOpen(true)}
                    >
                      🔬 Order Sample
                    </Button>
                    <p className="text-center text-gray-500 text-sm mt-3">
                      Order up to 5 pieces for quality testing
                    </p>
                  </div>
                )}
              </div>

              {/* Color Variants dengan spacing lebih */}
              {colorStocks.length > 0 && (
                <div className="mb-10">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6 pb-3 border-b border-gray-200">
                    Available Colors & Stock
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {colorStocks.map((color) => (
                      <div
                        key={color.id}
                        className={`p-4 rounded-xl border-2 transition-all hover:shadow-md ${
                          color.stock >= moq
                            ? "border-green-300 bg-green-50 hover:border-green-400"
                            : color.stock > 0
                              ? "border-yellow-300 bg-yellow-50 hover:border-yellow-400"
                              : "border-red-300 bg-red-50 hover:border-red-400"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className="w-10 h-10 rounded-full border-2 border-white shadow-md"
                            style={{ backgroundColor: color.color }}
                            title={color.color}
                          />
                          <div className="flex-1">
                            <p className="font-bold text-gray-900">
                              {color.color}
                            </p>
                            <div className="flex items-center justify-between mt-1">
                              <span
                                className={`text-sm font-semibold ${
                                  color.stock >= moq
                                    ? "text-green-700"
                                    : color.stock > 0
                                      ? "text-yellow-700"
                                      : "text-red-700"
                                }`}
                              >
                                {color.stock.toLocaleString()} pcs
                              </span>
                              {color.stock < moq && color.stock > 0 && (
                                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                                  Below MOQ
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Price Tiers */}
              {priceTiers.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Quantity Discount
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {priceTiers.map((tier, index) => (
                      <div
                        key={index}
                        className="p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all"
                      >
                        <div className="text-center">
                          <p className="text-2xl font-bold text-gray-900 mb-1">
                            Rp {tier.unitPrice.toLocaleString("id-ID")}
                          </p>
                          <p className="text-sm text-gray-600">
                            {tier.minQty}
                            {tier.maxQty ? ` - ${tier.maxQty}` : "+"} pcs
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Product Details Section - FULL WIDTH */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg p-6 lg:p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Product Specifications
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              {[
                ["Product Name", name],
                ["Product Type", productType?.name || "-"],
                ["Description", description || "-"],
                ["Current Stock", `${currentStock || 0} pcs`],
                ["Weight", weight || "-"],
                ["Width", width || "-"],
              ].map(([label, value], i) => (
                <div key={i} className="flex">
                  <div className="w-1/3 font-medium text-gray-700">{label}</div>
                  <div className="w-2/3 text-gray-600">{value}</div>
                </div>
              ))}
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {[
                ["MOQ", `${moq} pcs`],
                ["Total Available Stock", `${totalStock} pcs`],
                [
                  "Stock Status",
                  isOutOfStock ? "Pre-Order Only" : "Ready Stock",
                ],
                ["Technic", technics?.map((t) => t.name).join(", ") || "-"],
                ["Style", styles?.map((s) => s.name).join(", ") || "-"],
                ["Pattern", patterns?.map((p) => p.name).join(", ") || "-"],
                hasSampleOption
                  ? [
                      "Sample Price",
                      `Rp ${sample_price.toLocaleString("id-ID")}`,
                    ]
                  : null,
              ]
                .filter(Boolean)
                .map(([label, value], i) => (
                  <div key={i} className="flex">
                    <div className="w-1/3 font-medium text-gray-700">
                      {label}
                    </div>
                    <div className="w-2/3 text-gray-600">{value}</div>
                  </div>
                ))}
            </div>
          </div>

          {/* Color Summary */}
          {colorStocks.length > 0 && (
            <div className="mt-8 pt-6 border-t">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Available Colors
              </h3>
              <div className="flex flex-wrap gap-2">
                {colorStocks.map((color) => (
                  <div
                    key={color.id}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200"
                  >
                    <div
                      className="w-4 h-4 rounded-full border"
                      style={{ backgroundColor: color.color }}
                    />
                    <span className="text-sm font-medium">{color.color}</span>
                    <span className="text-sm text-gray-500">
                      ({color.stock} pcs)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
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

      <BuyNowModal
        isOpen={isBuyNowModalOpen}
        onClose={() => setIsBuyNowModalOpen(false)}
        onSubmit={(data) => {
          const status = isOutOfStock ? "Pre Order" : "Buy Now";
          handleDirectCheckout(
            status,
            data.quantity,
            data.colorData,
            data.notes,
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

      <SampleOrderModal
        isOpen={isSampleModalOpen}
        onClose={() => setIsSampleModalOpen(false)}
        onSubmit={(data) => {
          handleDirectCheckout(
            "Sample Order",
            data.quantity,
            data.colorData,
            data.notes,
          );
        }}
        initialData={{
          colorStocks: colorStocks,
          sampleProducts: sampleProducts,
          isOutOfStock: isOutOfStock,
          productName: name,
          samplePrice: sample_price,
        }}
        title={`Order Sample - ${name}`}
      />
    </div>
  );
};

export default Product;
