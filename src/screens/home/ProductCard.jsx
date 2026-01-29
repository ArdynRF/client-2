"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";

const ProductCard = ({ product }) => {
  const router = useRouter();
  const handleProductDetail = () => router.push(`/product/${product.id}`);
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

  // Calculate if product has price range
  const hasPriceRange =
    product.highestPrice && product.highestPrice !== product.lowestPrice;

  // Stock status color
  const getStockColor = () => {
    if (product?.currentStock <= 0) return "bg-orange-100 text-orange-800";
    if (product?.currentStock <= 10) return "bg-yellow-100 text-yellow-800";
    return "bg-green-100 text-green-800";
  };

  return (
    <button
      onClick={handleProductDetail}
      className="group flex flex-col w-full h-full bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-200 border border-gray-200 overflow-hidden text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 hover:border-gray-300"
    >
      {/* Product Image Container */}
      <div className="relative w-full pb-[100%] overflow-hidden bg-gray-100">
        <div className="absolute inset-0">
          <Image
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
            src={`${BASE_URL}/${product?.image}`}
            alt={product?.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            priority={false}
          />

          {/* Pre-Order Badge */}
          {product?.currentStock <= 0 && (
            <div className="absolute top-2 left-2 z-10">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-orange-500 text-white shadow-md">
                PRE-ORDER
              </span>
            </div>
          )}

          {/* Status Overlay */}
          {!product?.isActive && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
              <span className="bg-white/90 text-gray-800 px-3 py-1.5 rounded-lg text-sm font-semibold">
                Inactive
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Product Info */}
      <div className="flex-1 p-4 flex flex-col">
        {/* Product Name dengan underline animasi */}
        <div className="mb-3">
          <div className="relative inline-block group">
            <h3 className="text-gray-900 font-semibold text-lg md:text-xl line-clamp-2 mb-1.5 pr-1 group-hover:text-black transition-colors duration-200">
              {product?.name}
            </h3>
            {/* Underline effect */}
            <div className="absolute -bottom-1 left-0 w-0 h-[2px] bg-gradient-to-r from-black to-black group-hover:w-full transition-all duration-300 ease-out rounded-full"></div>
          </div>
          <p className="text-sm text-gray-500 line-clamp-2 mt-2">
            {product?.description}
          </p>
        </div>

        {/* Price Section */}
        <div className="mb-3">
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-lg font-bold text-gray-900">
              Rp {parseInt(product.lowestPrice).toLocaleString()}
            </span>

            {hasPriceRange && (
              <>
                <span className="text-gray-400 text-sm">-</span>
                <span className="text-base font-semibold text-gray-700">
                  Rp {parseInt(product.highestPrice).toLocaleString()}
                </span>
              </>
            )}
          </div>

          {hasPriceRange && (
            <div className="flex items-center gap-1 mt-1">
              <span className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                Price Range
              </span>
              {product.moq && (
                <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                  MOQ: {product.moq}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Status Badges */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {product?.isActive && (
            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800 border border-green-200">
              Active
            </span>
          )}

          {product?.isCustomization && (
            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
              Custom
            </span>
          )}

          {product?.currentStock > 0 && product?.currentStock <= 10 && (
            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
              Low Stock
            </span>
          )}
        </div>

        {/* Stock & Status Footer */}
        <div className="mt-auto pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="text-xs text-gray-500 truncate">
                {product?.currentStock > 0 ? (
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                    Available
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                    Pre-Order Only
                  </span>
                )}
              </div>
            </div>

            <div className="flex-shrink-0 ml-2">
              <span
                className={`px-2.5 py-1 rounded text-xs font-semibold ${getStockColor()}`}
              >
                {product?.currentStock > 0 ? (
                  <>{product.currentStock.toLocaleString()} units</>
                ) : (
                  <>Pre-Order</>
                )}
              </span>
            </div>
          </div>

          {/* Quick info */}
          {product.weight && (
            <div className="mt-2 text-[10px] text-gray-400 flex items-center gap-2">
              <span>{product.weight}</span>
              {product.width && <span>•</span>}
              {product.width && <span>{product.width}</span>}
            </div>
          )}
        </div>
      </div>
    </button>
  );
};

export default ProductCard;
