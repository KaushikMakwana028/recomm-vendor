import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import customerService from '../services/customerService'

// ── Async Thunks ──────────────────────────────────────────────
export const fetchCustomers = createAsyncThunk(
  'customer/fetchCustomers',
  async (_, thunkAPI) => {
    try {
      const response = await customerService.getAllCustomers()
      if (response.success) {
        return response.data
      }
      return thunkAPI.rejectWithValue(response.message || 'Failed to fetch customers')
    } catch (error) {
      return thunkAPI.rejectWithValue(error?.message || 'Something went wrong')
    }
  }
)

const initialState = {
  customers: [],
  loading: false,
  error: null,
}

const customerSlice = createSlice({
  name: 'customer',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload
    },
    addCustomer: (state, action) => {
      state.customers.push({
        id: Date.now(),
        ...action.payload,
      })
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomers.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.loading = false
        state.customers = action.payload
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { setLoading, addCustomer } = customerSlice.actions
export default customerSlice.reducer