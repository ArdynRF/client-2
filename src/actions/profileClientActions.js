"use server";

import { getCustomerData } from "@/actions/authActions";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

// Get user profile
export async function getUserProfileClient(userId) {
  console.log("Fetching profile for userId:", userId);
  try {
    const res = await fetch(`${BASE_URL}/api/profile?userId=${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error("Failed to fetch profile");
    }

    const data = await res.json();
    console.log("User Profile Data:", data);
    return data.data || data;
  } catch (error) {
    console.error("Error to fetch user profile:", error);
    return null;
  }
}

// Update user profile
export async function updateUserProfileClient(UserId, userData) {
  try {

    if (!UserId) {
    // Ambil userId secara otomatis
    const customer = await getCustomerData();
    if (!customer?.data?.id) {
      throw new Error("User not authenticated");
    }
    UserId = customer.data.id;
  }

    const res = await fetch(`${BASE_URL}/api/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...userData,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "Failed to update profile");
    }

    const result = await res.json();
    console.log("Updated Profile Data:", result);
    return result;
  } catch (error) {
    console.error("Failed to update profile:", error);
    throw error;
  }
}

// Update password
export async function updatePasswordClient(currentPassword, newPassword) {
  try {
    const res = await fetch(`${BASE_URL}/api/profile`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "Failed to update password");
    }

    const result = await res.json();
    return result;
  } catch (error) {
    console.error("Failed to update password:", error);
    throw error;
  }
}

// Shipping Address CRUD
export async function createAddressClient(addressData) {
  try {
    const res = await fetch(`${BASE_URL}/api/profile/address/shipping`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(addressData),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "Failed to create address");
    }

    const result = await res.json();
    return result;
  } catch (error) {
    console.error("Failed to create address:", error);
    throw error;
  }
}

export async function updateAddressClient(addressId, addressData) {
  try {
    const res = await fetch(
      `${BASE_URL}/api/profile/address/shipping?id=${addressId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(addressData),
      }
    );

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "Failed to update address");
    }

    const result = await res.json();
    return result;
  } catch (error) {
    console.error("Failed to update address:", error);
    throw error;
  }
}

export async function deleteAddressClient(addressId) {
  try {
    const res = await fetch(
      `${BASE_URL}/api/profile/address/shipping?id=${addressId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "Failed to delete address");
    }

    const result = await res.json();
    return result;
  } catch (error) {
    console.error("Failed to delete address:", error);
    throw error;
  }
}

// Billing Address CRUD
export async function createBillingAddressClient(billingData) {
  try {
    const res = await fetch(`${BASE_URL}/api/profile/address/billing`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(billingData),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "Failed to create billing address");
    }

    const result = await res.json();
    return result;
  } catch (error) {
    console.error("Failed to create billing address:", error);
    throw error;
  }
}

export async function updateBillingAddressClient(billingId, billingData) {
  try {
    const res = await fetch(
      `${BASE_URL}/api/profile/address/billing?id=${billingId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(billingData),
      }
    );

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "Failed to update billing address");
    }

    const result = await res.json();
    return result;
  } catch (error) {
    console.error("Failed to update billing address:", error);
    throw error;
  }
}

export async function deleteBillingAddressClient(billingId) {
  try {
    const res = await fetch(
      `${BASE_URL}/api/profile/address/billing?id=${billingId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "Failed to delete billing address");
    }

    const result = await res.json();
    return result;
  } catch (error) {
    console.error("Failed to delete billing address:", error);
    throw error;
  }
}
