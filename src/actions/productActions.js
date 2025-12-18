"use server";

export async function getProducts(filters = {}) {
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

  // 🔧 Ubah ke query string
  const query = Object.entries(filters)
    .filter(([_, value]) => value)
    .map(([key, value]) => {
      const values = typeof value === "string" ? value.split(",") : value;
      return `${key}=${Array.isArray(values) ? values.join(",") : values}`;
    })
    .join("&");

  const res = await fetch(`${BASE_URL}/api/products?${query}`);
  const data = await res.json();

  return data;
}

export async function getProductTypes() {
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  const res = await fetch(`${BASE_URL}/api/products/product-type`);
  const data = await res.json();
  //   console.log(data);

  return data;
}

export async function getProductById(productId) {
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  const res = await fetch(`${BASE_URL}/api/products/${productId}`);
  const data = await res.json();

  return data;
}
