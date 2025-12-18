import FilterSection from "./FilterSection";
import ProductCard from "./ProductCard";

const HomeScreen = ({ initialFilters, products, productTypes }) => {
  return (
    <div className="my-10">
      <h1 className="text-3xl font-semibold">Products</h1>

      <div className="my-5 grid grid-cols-4 gap-5">
        <FilterSection
          searchParams={initialFilters}
          productTypes={productTypes}
        />

        <div className="col-span-3 grid grid-cols-2 gap-5">
          {products.data?.map((product) => (
            <ProductCard product={product} key={product.id} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;
