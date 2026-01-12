"use server";
import { getCustomerData } from "@/actions/authActions";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export async function handleCartItems() {
  const customer = await getCustomerData();
  if (!customer) return [];
  const userId = Number(customer.data.id);
  console.log(customer)
  console.log("Fetching cart items for user ID:", userId);
  const res = await fetch(`${BASE_URL}/api/cart/${userId}`);

  if (!res.ok) {
    console.error("API error:", res.status);
    return [];
  }

  const text = await res.text();
  if (!text) return []; 

  const data = JSON.parse(text);
  return data;
}
