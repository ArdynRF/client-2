"use client";
import { StarIcon } from "@/components/icons";
import Image from "next/image";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { useRouter } from "next/navigation";

const ProductCard = ({ product }) => {
  const router = useRouter();
  const handleProductDetail = () => router.push(`/product/${product.id}`);
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  console.log(product);
  return (
    <div
      className="bg-white rounded-xl shadow-lg w-full h-full min-h-[400px]"
      key={product?.id}
    >
      <Image
        className="w-full h-full rounded-t-xl max-h-74 object-cover"
        src={`${BASE_URL}/${product?.image}`}
        alt="product"
        width={0}
        height={0}
        sizes="100vw"
      />
      <div className="p-5 space-y-4">
        <div className="space-y-1">
          <Link
            className="text-2xl font-semibold leading-5"
            href={`/product/${product?.id}`}
          >
            {product?.name}
          </Link>
          <p className="text-gray-400 text-md truncate">
            {product?.description}
          </p>
        </div>

        <div className="grid grid-cols-3 items-center gap-2 py-4">
          {product?.isActive ? (
            <div className="col-span-1 border border-gray-300 rounded-xl p-2 text-center bg-green-50 text-green-700">
              {"Active"}
            </div>
          ) : (
            <div className="col-span-1 border border-gray-300 rounded-xl p-2 text-center bg-gray-100 text-gray-500">
              Inactive Product
            </div>
          )}
          {product?.isCustomization ? (
            <div className="col-span-1 border border-gray-300 rounded-xl p-2 text-center bg-green-50 text-green-700">
              {'Customizable'}
            </div>
          ) : (
            <div className="col-span-1 border border-gray-300 rounded-xl p-2 text-center bg-gray-100 text-gray-500">
              Inactive Product
            </div>
          )}
        </div>

        <div className="space-y-0">
          <div className="flex justify-between items-center">
            <div className="flex gap-x-3 items-center text-xl font-semibold">
              <span className="text-gray-500 line-through">${product.mrp}</span>
              <span className="text-2xl">Rp. {product.lowestPrice} - Rp. {product.highestPrice}</span>
            </div>
            <span className="text-gray-400 text-md">
              {product?.currentStock} left
            </span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex gap-x-1">
              {[...Array(product?.rating || 0)].map((_, index) => (
                <StarIcon key={index} />
              ))}
            </div>
            <div className="product-type-label">Product Type</div>
          </div>
        </div>

        <div className="flex gap-x-2">
          <Button
            className="w-full custom-outline-btn rounded-2xl "
            onClick={() => handleProductDetail({ productId: product.id })}
            text="View Details"
          ></Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
