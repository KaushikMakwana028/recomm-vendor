import apiClient from './api'

const customerService = {
  // Get all customers
  getAllCustomers: async (filters = {}) => {
    try {
      // Static response since no API
      return {
        success: true,
        data: [],
        pagination: {
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0,
        },
      }
      // Actual API call:
      // const response = await axiosInstance.get('/customers', { params: filters })
      // return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Get customer by ID
  getCustomerById: async (customerId) => {
    try {
      // Static response since no API
      return {
        success: true,
        data: null,
      }
      // Actual API call:
      // const response = await axiosInstance.get(`/customers/${customerId}`)
      // return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Get customer order history
  getCustomerOrderHistory: async (customerId) => {
    try {
      // Static response since no API
      return {
        success: true,
        data: [],
      }
      // Actual API call:
      // const response = await axiosInstance.get(`/customers/${customerId}/orders`)
      // return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Get repeat customers
  getRepeatCustomers: async () => {
    try {
      // Static response since no API
      return {
        success: true,
        data: [],
      }
      // Actual API call:
      // const response = await axiosInstance.get('/customers/repeat')
      // return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Get customer statistics
  getCustomerStats: async () => {
    try {
      // Static response since no API
      return {
        success: true,
        data: {
          total: 0,
          repeat: 0,
          new: 0,
          totalRevenue: 0,
        },
      }
      // Actual API call:
      // const response = await axiosInstance.get('/customers/stats')
      // return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },
}

export default customerService