"use server";
import { getCustomerData } from "@/actions/authActions";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export async function handleCheckoutAction(checkoutData, type = "cart") {
  try {
    // Validasi data checkout
    if (!checkoutData) {
      return {
        success: false,
        message: "Checkout data is required",
        data: null,
      };
    }

    // Get customer data
    const customer = await getCustomerData();
    if (!customer || !customer.data || !customer.data.id) {
      return {
        success: false,
        message: "No customer data found. Please login first.",
        data: null,
      };
    }

    const userId = Number(customer.data.id);
    console.log(`Processing ${type} checkout for user ${userId}`);

    // Prepare order data berdasarkan tipe checkout
    let orderData;

    if (type === "direct") {
      // Direct checkout (single product)
      orderData = prepareDirectCheckoutData(checkoutData, userId);
    } else {
      // Cart checkout (multiple products)
      orderData = prepareCartCheckoutData(checkoutData, userId);
    }

    console.log("Order data to send to backend:", orderData);

    // Kirim ke backend API
    const response = await fetch(`${BASE_URL}/api/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Backend error response:", errorData);
      throw new Error(errorData.error || `Failed to create ${type} order`);
    }

    const result = await response.json();
    console.log("Backend success response:", result);

    // Clear cart items jika checkout dari cart
    if (
      type === "cart" &&
      checkoutData.itemIds &&
      checkoutData.itemIds.length > 0
    ) {
      await clearCartItems(checkoutData.itemIds);
    }

    return {
      success: true,
      message: `${type === "direct" ? "Direct " : ""}Order created successfully`,
      data: result.data,
      orderNumber: result.data?.orderNumber || orderData.orderNumber,
      orderId: result.data?.id,
    };
  } catch (error) {
    console.error(`${type} checkout action error:`, error);

    return {
      success: false,
      message: error.message || `Failed to process ${type} checkout`,
      data: null,
      error: error.message,
    };
  }
}

// Helper function untuk prepare cart checkout data
function prepareCartCheckoutData(checkoutData, userId) {
  return {
    userId: userId,
    items: checkoutData.items.map((item) => ({
      productId: item.productId,
      cartId: item.cartId || null,
      productName: item.product?.name || "Unknown Product",
      quantity: item.quantity,
      unitPrice: getUnitPrice(item),
      totalPrice: item.priceTotal || 0,
      color: item.color || null,
      // Product snapshot (data produk saat checkout)
      productSnapshot: {
        image: item.product?.image || "",
        type: item.product?.productType || "",
        moq: item.product?.moq || "",
        mrp: item.product?.mrp || 0,
        description: item.product?.description || "",
        priceTiers: item.product?.priceTiers || [],
      },
    })),
    address: checkoutData.address,
    billing: checkoutData.billing,
    paymentMethod: checkoutData.paymentMethod,
    shippingMethod: checkoutData.shippingMethod,
    subtotal: checkoutData.subtotal || 0,
    shippingCost: checkoutData.shippingCost || 0,
    tax: checkoutData.tax || 0,
    total: checkoutData.total || 0,
    downPayment:
      checkoutData.downPayment || calculateDownPayment(checkoutData.total || 0),
    remainingPayment:
      checkoutData.remainingPayment ||
      calculateRemainingPayment(checkoutData.total || 0),
    paymentStatus: checkoutData.paymentStatus || "down_payment_paid",
    orderStatus: checkoutData.orderStatus || "processing",
    orderNumber: checkoutData.orderNumber || generateOrderNumber("CART"),
    orderType: "cart",
    notes: checkoutData.notes || "",
    metadata: {
      source: "cart_checkout",
      itemCount: checkoutData.items?.length || 0,
      timestamp: new Date().toISOString(),
    },
  };
}

// Helper function untuk prepare direct checkout data
function prepareDirectCheckoutData(checkoutData, userId) {
  const productData = checkoutData.checkoutData;

  return {
    userId: userId,
    items: [
      {
        productId: productData.productId,
        productName: productData.productName,
        quantity: parseInt(productData.quantity),
        unitPrice: productData.unitPrice,
        totalPrice: productData.totalPrice,
        color: productData.color || null,
        isSampleOrder: productData.isSampleOrder || false,
        orderStatus: productData.isOutOfStock ? "pre_order" : "",
        // Product snapshot
        productSnapshot: {
          image: productData.productImage || "",
          type: productData.productType || "",
          moq: productData.moq || "",
          mrp: productData.unitPrice || 0,
          description: productData.productName,
          priceTiers: [],
          samplePrice: productData.samplePrice || null,
          productDetails: productData.productDetails || {},
          weight: productData.productDetails?.weight,
          width: productData.productDetails?.width,
          technics: productData.productDetails?.technics || [],
          styles: productData.productDetails?.styles || [],
          patterns: productData.productDetails?.patterns || [],
        },
      },
    ],
    address: checkoutData.address,
    billing: checkoutData.billing,
    paymentMethod: checkoutData.paymentMethod,
    shippingMethod: checkoutData.shippingMethod,
    subtotal: checkoutData.subtotal || 0,
    shippingCost: checkoutData.shippingCost || 0,
    tax: checkoutData.tax || 0,
    total: checkoutData.total || 0,
    downPayment:
      checkoutData.downPayment || calculateDownPayment(checkoutData.total || 0),
    remainingPayment:
      checkoutData.remainingPayment ||
      calculateRemainingPayment(checkoutData.total || 0),
    paymentStatus: "down_payment_paid",
    orderStatus: productData.isOutOfStock ? "pre_order" : "",
    orderNumber: generateOrderNumber("DIRECT"),
    orderType: productData.isSampleOrder ? "sample" : "regular",
    notes: productData.notes || "",
    metadata: {
      source: "direct_checkout",
      status: productData.status || "Buy Now",
      isOutOfStock: productData.isOutOfStock || false,
      timestamp: new Date().toISOString(),
    },
  };
}

// Helper functions
function getUnitPrice(item) {
  if (item.product?.mrp) return item.product.mrp;
  if (item.priceTotal && item.quantity) return item.priceTotal / item.quantity;
  return 0;
}

function calculateDownPayment(total) {
  return Math.round(total * 0.3); // 30% DP
}

function calculateRemainingPayment(total) {
  return Math.round(total * 0.7); // 70% remaining
}

function generateOrderNumber(prefix = "ORD") {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `${prefix}-${timestamp}-${random}`;
}

// Function untuk clear cart items setelah checkout
async function clearCartItems(itemIds) {
  try {
    if (!itemIds || itemIds.length === 0) return;

    // Call API untuk delete cart items
    const response = await fetch("/api/cart/clear-checkout", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ cartIds: itemIds }),
    });

    if (!response.ok) {
      console.warn("Failed to clear cart items after checkout");
      return;
    }

    console.log(`Successfully cleared ${itemIds.length} cart items`);
  } catch (error) {
    console.error("Error clearing cart items:", error);
  }
}

export async function processCheckout(checkoutData) {
  // Auto-detect tipe checkout
  const type = checkoutData.checkoutData ? "direct" : "cart";
  return handleCheckoutAction(checkoutData, type);
}

export async function getOrdersByUser(status = "all", page = 1, limit = 10) {
  try {
    const customer = await getCustomerData();
    if (!customer?.data?.id) {
      return {
        success: false,
        message: "User not authenticated",
        data: []
      };
    }

    const userId = customer.data.id;
    const queryParams = new URLSearchParams({
      userId,
      status: status !== "all" ? status : "",
      page: page.toString(),
      limit: limit.toString()
    });

    const response = await fetch(`${BASE_URL}/api/orders/user?${queryParams}`);
    const data = await response.json();
    console.log("Get orders by user response:", data);

    if (data.success) {
      return {
        success: true,
        data: data.data,
        pagination: data.pagination
      };
    } else {
      return {
        success: false,
        message: data.error || "Failed to fetch orders",
        data: []
      };
    }
  } catch (error) {
    console.error("Get orders error:", error);
    return {
      success: false,
      message: "Network error. Please check your connection.",
      data: []
    };
  }
}

export async function getOrderById(orderId) {
  try {
    const response = await fetch(`/api/orders/${orderId}`);
    const data = await response.json();

    if (data.success) {
      return {
        success: true,
        data: data.data
      };
    } else {
      return {
        success: false,
        message: data.error || "Order not found"
      };
    }
  } catch (error) {
    console.error("Get order by ID error:", error);
    return {
      success: false,
      message: "Failed to fetch order details"
    };
  }
}
