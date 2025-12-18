import { MinusCircleIcon, PlusCircleIcon, StarIcon } from "@/components/icons";
import Button from "@/components/ui/Button";
import Image from "next/image";

const Cart = () => {
  return (
    <div className="my-10">
      <h1 className="text-3xl font-semibold">Keranjang Pertanyaan</h1>

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
                  <h1 className="text-2xl font-medium">Product Name</h1>
                  <div className="product-type-label">Product Type</div>
                </div>
                <div className="text-xl flex gap-x-3 items-center">
                  <span className="text-gray-500 line-through font-medium">
                    $14.99
                  </span>
                  <span className="text-2xl font-semibold">$12.99</span>
                </div>
                <div className="flex justify-end mt-auto gap-2">
                  <div className=" text-gray-600 border border-gray-300 rounded px-2 py-1">
                    Quantity: 2 Yard
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
