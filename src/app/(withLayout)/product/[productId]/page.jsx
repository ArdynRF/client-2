import { getProductById } from "@/actions/productActions";
import Product from "@/screens/product";

const ProductPage = async ({ params }) => {
  const { productId } = await params; // ✅ Diperbaiki

  const response = await getProductById(productId);
  const product = response.data;

  return (
    <>
      <Product product={product} />
    </>
  );
};

export default ProductPage;
