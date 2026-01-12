import { MinusCircleIcon, PlusCircleIcon, StarIcon } from "@/components/icons";
import Button from "@/components/ui/Button";
import Image from "next/image";
import { handleCartItems } from "@/actions/cartActions";




const  Cart = async () => {

  const cartItems = await handleCartItems();
  return (
    <div className="my-10">
      <h1 className="text-3xl font-semibold">Keranjang Pertanyaan</h1>

      {!cartItems || cartItems.length === 0 ? (
        <div className="text-center mt-10 text-gray-500">
          Keranjang Anda kosong.
        </div>
      ) : (
        cartItems?.map((item) => (
         aaa 
        ))
      )}
    </div>
  );
};

export default Cart;
