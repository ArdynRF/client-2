"use client";
import { StarIcon } from "@/components/icons";
import Image from "next/image";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { useRouter } from "next/navigation";

const cartItems = [
    name, price, quantity, image
]

export default function CartList({ cartItems }) {
  const router = useRouter();
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

  return (
    <div className="grid grid-cols-3 gap-5 my-5">
      <div className="col-span-3 space-y-5">
        <div className="w-full bg-white shadow-md rounded-xl">
          <div className="grid grid-cols-[auto_1fr]">
            <Image
              className="w-60 h-60 object-cover rounded-l-xl m-auto"
              src="/prod-img.jpg"
              alt="product"
              width={0}
              height={0}
              sizes="100vw"
            />
            <div className="flex flex-col p-8">
              <div className="flex justify-between">
                <h1 className="text-2xl font-medium">{cartItems.name}</h1>
                <div className="product-type-label">{cartItems.type}</div>
              </div>
              <div className="text-xl flex gap-x-3 items-center">
                <span className="text-gray-500 line-through font-medium">
                    Rp. {cartItems.price}
                </span>
              </div>
              <div className="flex justify-end mt-auto gap-2">
                <div className=" text-gray-600 border border-gray-300 rounded px-2 py-1">
                  Quantity: {cartItems.quantity}
                </div>
                <Button className="custom-outline-btn">Remove</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
