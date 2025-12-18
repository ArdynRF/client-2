import { getProducts, getProductTypes } from "@/actions/productActions";
import HomeScreen from "@/screens/home";

export default async function Home({ searchParams }) {
  const params = await searchParams; // ⬅️ Await before use
  const filters = {};

  Object.entries(params || {}).forEach(([key, value]) => {
    filters[key] =
      typeof value === "string" && value.includes(",")
        ? value.split(",")
        : value;
  });

  const products = await getProducts(filters);
  const productTypesRes = await getProductTypes();

  const productTypes = [
    { label: "All", value: "all" },
    ...productTypesRes?.data?.map((item) => ({
      label: item.name,
      value: String(item.id),
    })),
  ];

  return (
    <HomeScreen
      initialFilters={filters}
      products={products}
      productTypes={productTypes}
    />
  );
}
