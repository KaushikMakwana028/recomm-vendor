import { axiosInstance } from "./authService";

const storeService = {
  // Get store profile
  getProfile: async () => {
    try {
      // Get user from localStorage to extract ID
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = user.id;

      if (!userId) {
        throw new Error("User ID not found");
      }

      const response = await axiosInstance.get(`/get_profile/${userId}`);

      // Check if response has the expected structure
      if (!response.data.status) {
        throw new Error(response.data.message || "Failed to fetch profile");
      }

      return response.data; // Return the full response with status, message, data
    } catch (error) {
      throw error.response?.data || { message: error.message };
    }
  },

  // Update store profile
  updateProfile: async (formData) => {
    try {
      // Get user ID for the update endpoint
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = user.id;

      if (!userId) {
        throw new Error("User ID not found");
      }

      // Make sure the backend knows which store/user row to update.
      // formData may already contain other fields (name, shop_name, bank
      // details, store_photo, etc.) appended by the caller — this just
      // adds the id alongside them without overwriting anything.
      if (!formData.has("id")) {
        formData.append("id", userId);
      }

      const response = await axiosInstance.post("/update_profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (!response.data.status) {
        throw new Error(response.data.message || "Failed to update profile");
      }

      return response.data;
    } catch (error) {
      throw error.response?.data || { message: error.message };
    }
  },
};

export default storeService;
