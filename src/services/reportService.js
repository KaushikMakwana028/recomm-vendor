import { reportAPI } from './api'

const reportService = {
  // Get report by filter ('daily' | 'weekly' | 'monthly')
  getReport: async (filter = 'daily') => {
    try {
      const response = await reportAPI.getReport(filter)
      return {
        success: response.status ?? true,
        data: response.data,
      }
    } catch (error) {
      throw error.response?.data || error.message
    }
  },
}

export default reportService