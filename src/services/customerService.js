import { customerAPI } from './api'
import orderService from './orderService'

const customerService = {
  // Get all customers
  getAllCustomers: async (filters = {}) => {
    try {
      const response = await customerAPI.getCustomers()
      const customers = response.data || []

      // Fetch orders to calculate stats dynamically
      let orders = []
      try {
        const ordersRes = await orderService.getAllOrders()
        orders = ordersRes.data || []
      } catch (err) {
        console.error("Failed to fetch orders for customer stats: ", err)
      }

      const mappedCustomers = customers.map(c => {
        // Match orders by mobile or customer name (case-insensitive)
        const customerOrders = orders.filter(o => 
          (o.mobile && o.mobile.replace(/\D/g, '').endsWith(c.mobile.replace(/\D/g, ''))) || 
          (o.customerName && o.customerName.toLowerCase() === c.name.toLowerCase())
        )

        const totalOrders = customerOrders.length
        const totalSpent = customerOrders.reduce((sum, o) => sum + (parseFloat(o.totalAmount) || 0), 0)
        
        // Find last order
        const sortedOrders = [...customerOrders].sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))
        const lastOrder = sortedOrders.length > 0 ? sortedOrders[0].orderDate.split(' ')[0] : 'N/A'

        return {
          id: c.id,
          name: c.name,
          mobile: c.mobile,
          email: c.email || 'N/A',
          address: c.address,
          profileImage: c.profile_image,
          totalOrders,
          totalSpent,
          lastOrder,
          isRepeat: totalOrders > 1,
        }
      })

      return {
        success: response.status ?? true,
        data: mappedCustomers,
      }
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