"use server";
import { getCustomerData } from "@/actions/authActions";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export async function handleCartItems() {
  try {
    const customer = await getCustomerData();

    // Check if customer exists and has data
    if (!customer || !customer.data || !customer.data.id) {
      console.warn("No customer data found");
      return [];
    }

    const userId = Number(customer.data.id);

    // Validate userId
    if (isNaN(userId) || userId <= 0) {
      console.error("Invalid user ID:", userId);
      return [];
    }


    // Add timeout to fetch
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const res = await fetch(`${BASE_URL}/api/cart/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      signal: controller.signal,
      cache: "no-store", // Untuk data yang selalu fresh
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      console.error("API error:", res.status, res.statusText);

      // Return empty array for 404 (cart might be empty)
      if (res.status === 404) {
        return [];
      }

      return [];
    }

    const data = await res.json();

    // Validate response data
    if (!Array.isArray(data)) {
      console.error("Invalid response format, expected array:", data);
      return [];
    }
 
    return data;
  } catch (error) {
    console.error("Error in handleCartItems:", error);

    // Handle specific errors
    if (error.name === "AbortError") {
      console.error("Fetch timeout - API took too long to respond");
    } else if (error instanceof SyntaxError) {
      console.error("JSON parse error - Invalid response from API");
    }

    return [];
  }
}

// Optional: Function untuk menghapus cache jika diperlukan
export async function refreshCartItems() {
  // Force revalidation jika menggunakan cache
  // revalidatePath('/cart');
  return await handleCartItems();
}

// Optional: Function untuk menghitung total cart
export async function getCartTotal() {
  const cartItems = await handleCartItems();
  
  if (!cartItems || cartItems.length === 0) {
    return {
      subtotal: 0,
      itemCount: 0,
      totalItems: 0,
    };
  }

  const subtotal = cartItems.reduce((sum, item) => {
    return sum + (item.priceTotal || 0);
  }, 0);

  const totalItems = cartItems.reduce((sum, item) => {
    return sum + (item.quantity || 0);
  }, 0);

  return {
    subtotal,
    itemCount: cartItems.length,
    totalItems,
  };
}

export async function handleRemoveSingleItem(cartId) {
  try {
    const response = await fetch(`${BASE_URL}/api/cart/`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cartIds: [cartId] }),
    });

    if (response.ok) {
  
      return true;
    } else {
      console.error(
        `Failed to remove item with cart ID ${cartId}:`,
        response.statusText
      );
      return false;
    }
  } catch (error) {
    console.error(`Error removing item with cart ID ${cartId}:`, error);
    return false;
  }
}
