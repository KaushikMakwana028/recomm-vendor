// src/services/inventoryService.js

// ✅ Use named import { inventoryAPI } — matches api.js export
import { inventoryAPI } from './api'

const inventoryService = {
  // Get full inventory (products + stats + alerts)
  getInventory: async () => {
    return await inventoryAPI.getInventory()
  },

  // Update stock for a single product
  updateStock: async (productId, stock) => {
    return await inventoryAPI.updateStock(productId, stock)
  },
}

export default inventoryService