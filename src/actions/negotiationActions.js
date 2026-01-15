"use server";

import { getCustomerData } from "@/actions/authActions";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export async function getNegotiationsByUserId(userId) {
  try {
    

    // Validate userId
    const id = Number(userId);
    if (isNaN(id) || id <= 0) {
      console.error("Invalid user ID:", userId);
      return [];
    }

    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const res = await fetch(`${BASE_URL}/api/negotiate/${id}`, {
      // Perhatikan endpoint: /api/negotiations/${id}
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      signal: controller.signal,
      cache: "no-store",
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      // Handle 404 specially (user might have no negotiations)
      if (res.status === 404) {
        
        return [];
      }

      console.error("API error:", res.status, res.statusText);
      return [];
    }

    const data = await res.json();
    

    // Validate response data
    if (!data || !data.success) {
      console.error("API returned unsuccessful:", data);
      return [];
    }

    // Handle both formats: data.data or just data
    const negotiations = data.data || data;

    if (!Array.isArray(negotiations)) {
      console.error("Invalid response format, expected array:", data);
      return [];
    }

    
   
    return negotiations;
  } catch (error) {
    console.error("Failed to fetch negotiations:", error);

    // Handle timeout specifically
    if (error.name === "AbortError") {
      console.error("Fetch timeout - API took too long to respond");
    }

    return [];
  }
}

export async function handleDeleteNegotiation(negotiationIds) {
  try {
    const idsArray = Array.isArray(negotiationIds)
      ? negotiationIds
      : [negotiationIds];

    

  
  

    const response = await fetch(`${BASE_URL}/api/negotiate`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ negotiationIds: idsArray }),
    });

    

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Delete failed:", errorData);
      return {
        success: false,
        message: errorData.error || "Failed to delete negotiation(s)",
      };
    }

    const result = await response.json();
    

    return {
      success: true,
      message: result.message || "Negotiation(s) deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting negotiation:", error);
    return {
      success: false,
      message: "Network error. Please try again.",
    };
  }
}

// Versi dengan reload callback
export async function handleDeleteNegotiationWithCallback(
  negotiationIds,
  callback
) {
  const result = await handleDeleteNegotiation(negotiationIds);

  if (result.success && callback && typeof callback === "function") {
    callback();
  }

  return result;
}
