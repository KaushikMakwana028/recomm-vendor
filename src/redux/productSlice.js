import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import productService from '../services/productService'

// ─────────────────────────────────────────────
// Helper: Calculate stock status
// ─────────────────────────────────────────────
const getStockStatus = (stock) => {
  const qty = Number(stock)
  if (qty <= 0) return 'out_of_stock'
  if (qty <= 10) return 'low_stock'
  return 'in_stock'
}

// ─────────────────────────────────────────────
// Thunks
// ─────────────────────────────────────────────

export const fetchCategories = createAsyncThunk(
  'product/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const data = await productService.getCategories()
      return data.data // array of categories
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch categories')
    }
  }
)

export const fetchVendorProducts = createAsyncThunk(
  'product/fetchVendorProducts',
  async (_, { rejectWithValue }) => {
    try {
      const data = await productService.getVendorProducts()
      // Transform API data to match local state structure
      const products = data.data.map((p) => ({
        id: p.id,
        product_id: p.product_id,
        name: p.product_name,
        brand: p.brand,
        category_id: p.category_id,
        category: p.category_name,
        unit: p.unit,
        mrp: Number(p.mrp),
        sellingPrice: Number(p.selling_price),
        stock: Number(p.stock),
        description: p.description || '',
        image: p.image,
        is_own_product: p.is_own_product,
        status: getStockStatus(p.stock),
        added_on: p.added_on,
      }))
      return products
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch products')
    }
  }
)

export const searchProducts = createAsyncThunk(
  'product/searchProducts',
  async ({ search, category_id } = {}, { rejectWithValue }) => {
    try {
      const data = await productService.searchProducts({ search, category_id })
      return data.data
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to search products')
    }
  }
)

export const addVendorProduct = createAsyncThunk(
  'product/addVendorProduct',
  async (productData, { rejectWithValue }) => {
    try {
      const data = await productService.addVendorProduct(productData)
      // Transform returned product
      const p = data.data
      return {
        id: p.id,
        product_id: p.product_id,
        name: p.product_name,
        brand: p.brand,
        category_id: p.category_id,
        category: p.category_name,
        unit: p.unit,
        mrp: Number(p.mrp),
        sellingPrice: Number(p.selling_price),
        stock: Number(p.stock),
        description: p.description || '',
        image: p.image,
        is_own_product: p.is_own_product,
        status: getStockStatus(p.stock),
        added_on: p.added_on,
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to add product')
    }
  }
)

export const updateVendorProduct = createAsyncThunk(
  'product/updateVendorProduct',
  async (productData, { rejectWithValue }) => {
    try {
      const data = await productService.updateVendorProduct(productData)
      // Transform returned product
      const p = data.data
      return {
        id: p.id,
        product_id: p.product_id,
        name: p.product_name,
        brand: p.brand,
        category_id: p.category_id,
        category: p.category_name,
        unit: p.unit,
        mrp: Number(p.mrp),
        sellingPrice: Number(p.selling_price),
        stock: Number(p.stock),
        description: p.description || '',
        image: p.image,
        is_own_product: p.is_own_product,
        status: getStockStatus(p.stock),
        added_on: p.added_on,
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update product')
    }
  }
)

export const deleteVendorProduct = createAsyncThunk(
  'product/deleteVendorProduct',
  async (productId, { rejectWithValue }) => {
    try {
      await productService.deleteVendorProduct(productId)
      return productId
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete product')
    }
  }
)

// ─────────────────────────────────────────────
// Slice
// ─────────────────────────────────────────────

const initialState = {
  products: [],
  categories: [],
  searchResults: [],
  loading: false,
  searchLoading: false,
  actionLoading: false,
  error: null,
  actionError: null,
}

const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    clearProductError(state) {
      state.error = null
      state.actionError = null
    },
    clearSearchResults(state) {
      state.searchResults = []
    },
    // Local update (not synced with API)
    updateProduct(state, { payload }) {
      const index = state.products.findIndex((p) => p.id === payload.id)
      if (index !== -1) {
        state.products[index] = {
          ...state.products[index],
          ...payload,
          status: getStockStatus(payload.stock ?? state.products[index].stock),
        }
      }
    },
    // Local toggle (not synced with API)
    toggleProductStatus(state, { payload: id }) {
      const product = state.products.find((p) => p.id === id)
      if (product) {
        product.status = product.status === 'in_stock' ? 'out_of_stock' : 'in_stock'
      }
    },
  },
  extraReducers: (builder) => {
    // ── fetchCategories ──────────────────────────────────
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCategories.fulfilled, (state, { payload }) => {
        state.loading = false
        state.categories = payload
      })
      .addCase(fetchCategories.rejected, (state, { payload }) => {
        state.loading = false
        state.error = payload
      })

    // ── fetchVendorProducts ──────────────────────────────
    builder
      .addCase(fetchVendorProducts.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchVendorProducts.fulfilled, (state, { payload }) => {
        state.loading = false
        state.products = payload
      })
      .addCase(fetchVendorProducts.rejected, (state, { payload }) => {
        state.loading = false
        state.error = payload
      })

    // ── searchProducts ───────────────────────────────────
    builder
      .addCase(searchProducts.pending, (state) => {
        state.searchLoading = true
      })
      .addCase(searchProducts.fulfilled, (state, { payload }) => {
        state.searchLoading = false
        state.searchResults = payload
      })
      .addCase(searchProducts.rejected, (state, { payload }) => {
        state.searchLoading = false
        state.actionError = payload
      })

    // ── addVendorProduct ─────────────────────────────────
    builder
      .addCase(addVendorProduct.pending, (state) => {
        state.actionLoading = true
        state.actionError = null
      })
      .addCase(addVendorProduct.fulfilled, (state, { payload }) => {
        state.actionLoading = false
        state.products.unshift(payload) // Add to top
      })
      .addCase(addVendorProduct.rejected, (state, { payload }) => {
        state.actionLoading = false
        state.actionError = payload
      })

    // ── deleteVendorProduct ──────────────────────────────
    builder
      .addCase(deleteVendorProduct.pending, (state) => {
        state.actionLoading = true
        state.actionError = null
      })
      .addCase(deleteVendorProduct.fulfilled, (state, { payload: id }) => {
        state.actionLoading = false
        state.products = state.products.filter((p) => p.id !== id)
      })
      .addCase(deleteVendorProduct.rejected, (state, { payload }) => {
        state.actionLoading = false
        state.actionError = payload
      })
    builder
      .addCase(updateVendorProduct.pending, (state) => {
        state.actionLoading = true
        state.actionError = null
      })
      .addCase(updateVendorProduct.fulfilled, (state, { payload }) => {
        state.actionLoading = false
        const index = state.products.findIndex((p) => p.id === payload.id)
        if (index !== -1) {
          state.products[index] = payload
        }
      })
      .addCase(updateVendorProduct.rejected, (state, { payload }) => {
        state.actionLoading = false
        state.actionError = payload
      })
  },
})

export const {
  clearProductError,
  clearSearchResults,
  updateProduct,
  toggleProductStatus,
} = productSlice.actions

export default productSlice.reducer