// src/services/api.js

const API_BASE_URL = "http://localhost/kaushik_php/ci_project/recomm/api/";

// ─────────────────────────────────────────────
// Core fetch wrapper
// ─────────────────────────────────────────────
const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;

  const config = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  };

  // Attach token if available
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  try {
    console.log("Making API call to:", url);
    const response = await fetch(url, config);
    console.log("API Response status:", response.status);

    // Handle 401 - session expired
    if (response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
      return;
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("API Response data:", data);

    if (!data.status) {
      throw new Error(data.message || "API request failed");
    }

    return data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

// ─────────────────────────────────────────────
// Auth API
// ─────────────────────────────────────────────
export const authAPI = {
  loginSendOtp: async (mobile) => {
    return apiCall("/login_send_otp", {
      method: "POST",
      body: JSON.stringify({ mobile }),
    });
  },

  loginVerifyOtp: async (mobile, otp) => {
    return apiCall("/verify_login_otp", {
      method: "POST",
      body: JSON.stringify({ mobile, otp }),
    });
  },

  registerSendOtp: async (userData) => {
    return apiCall("/register_send_otp", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  },

  registerVerifyOtp: async (mobile, otp) => {
    return apiCall("/verify_register_otp", {
      method: "POST",
      body: JSON.stringify({ mobile, otp }),
    });
  },
};

// ─────────────────────────────────────────────
// Inventory API
// ─────────────────────────────────────────────
export const inventoryAPI = {
  getInventory: async () => {
    return apiCall("/get_inventory", {
      method: "GET",
    });
  },

  updateStock: async (productId, stock) => {
    return apiCall("/update_stock", {
      method: "POST",
      body: JSON.stringify({ product_id: productId, stock }),
    });
  },
};

// ─────────────────────────────────────────────
// Vendor Orders API
// ─────────────────────────────────────────────
export const orderAPI = {
  getVendorOrders: async (status) => {
    const query = status ? `?status=${encodeURIComponent(status)}` : "";
    return apiCall(`/get_vendor_orders${query}`, {
      method: "GET",
    });
  },

  updateVendorOrderStatus: async (orderId, status, remarks, deliveryOption, distance) => {
    const body = { order_id: orderId, status, remarks };
    if (deliveryOption) body.delivery_option = deliveryOption;
    if (distance !== undefined && distance !== null && distance !== "") body.distance = parseFloat(distance);

    return apiCall("/update_vendor_order_status", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },
};

// ─────────────────────────────────────────────
// Customers API
// ─────────────────────────────────────────────
export const customerAPI = {
  getCustomers: async () => {
    return apiCall("/get_customer", {
      method: "GET",
    });
  },
};

// ─────────────────────────────────────────────
// Reports API
// ─────────────────────────────────────────────
export const reportAPI = {
  getReport: async (filter = "daily") => {
    return apiCall(`/get_report?filter=${encodeURIComponent(filter)}`, {
      method: "GET",
    });
  },
};

