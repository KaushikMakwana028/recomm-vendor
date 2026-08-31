// src/redux/inventorySlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import inventoryService from '../services/inventoryService' // ✅ default import is fine

// ── Async Thunks ──────────────────────────────────────────────

export const fetchInventory = createAsyncThunk(
  'inventory/fetchInventory',
  async (_, thunkAPI) => {
    try {
      const response = await inventoryService.getInventory()
      // response = { status: true, code: 200, message: '...', data: { stats, alerts, products } }
      if (response.status) {
        return response.data // { stats, alerts, products }
      }
      return thunkAPI.rejectWithValue(response.message || 'Failed to fetch inventory')
    } catch (error) {
      return thunkAPI.rejectWithValue(error?.message || 'Something went wrong')
    }
  }
)

export const updateProductStock = createAsyncThunk(
  'inventory/updateProductStock',
  async ({ productId, stock }, thunkAPI) => {
    try {
      const response = await inventoryService.updateStock(productId, stock)
      // response = { status: true, data: { id, product_name, stock, unit, status } }
      if (response.status) {
        return response.data
      }
      return thunkAPI.rejectWithValue(response.message || 'Failed to update stock')
    } catch (error) {
      return thunkAPI.rejectWithValue(error?.message || 'Something went wrong')
    }
  }
)

// ── Initial State ─────────────────────────────────────────────

const initialState = {
  products: [],
  stats: {
    total: 0,
    in_stock: 0,
    low_stock: 0,
    out_of_stock: 0,
  },
  alerts: {
    low_stock_products: [],
    out_of_stock_products: [],
  },
  loading: false,
  updateLoading: false,
  error: null,
  updateError: null,
}

// ── Slice ─────────────────────────────────────────────────────

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    clearInventoryError: (state) => {
      state.error = null
      state.updateError = null
    },
  },
  extraReducers: (builder) => {

    // ── fetchInventory ─────────────────────────────────────────
    builder
      .addCase(fetchInventory.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchInventory.fulfilled, (state, action) => {
        state.loading = false
        state.products = action.payload.products
        state.stats = action.payload.stats
        state.alerts = action.payload.alerts
      })
      .addCase(fetchInventory.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

    // ── updateProductStock ─────────────────────────────────────
    builder
      .addCase(updateProductStock.pending, (state) => {
        state.updateLoading = true
        state.updateError = null
      })
      .addCase(updateProductStock.fulfilled, (state, action) => {
        state.updateLoading = false

        const updated = action.payload // { id, stock, status, ... }

        // Update the product in the list
        const idx = state.products.findIndex((p) => p.id === updated.id)
        if (idx !== -1) {
          state.products[idx].stock = updated.stock
          state.products[idx].status = updated.status
        }

        // Recalculate stats from updated products array
        state.stats.total = state.products.length
        state.stats.in_stock = state.products.filter((p) => p.status === 'in_stock').length
        state.stats.low_stock = state.products.filter((p) => p.status === 'low_stock').length
        state.stats.out_of_stock = state.products.filter((p) => p.status === 'out_of_stock').length

        // Recalculate alerts
        state.alerts.low_stock_products = state.products.filter((p) => p.status === 'low_stock')
        state.alerts.out_of_stock_products = state.products.filter((p) => p.status === 'out_of_stock')
      })
      .addCase(updateProductStock.rejected, (state, action) => {
        state.updateLoading = false
        state.updateError = action.payload
      })
  },
})

export const { clearInventoryError } = inventorySlice.actions
export default inventorySlice.reducer