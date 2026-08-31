import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import reportService from '../services/reportService'

// ── Async Thunks ──────────────────────────────────────────────
export const fetchReport = createAsyncThunk(
  'report/fetchReport',
  async (filter, thunkAPI) => {
    try {
      const response = await reportService.getReport(filter)
      if (response.success) {
        return response.data
      }
      return thunkAPI.rejectWithValue(response.message || 'Failed to fetch report')
    } catch (error) {
      return thunkAPI.rejectWithValue(error?.message || 'Something went wrong')
    }
  }
)

const initialState = {
  reportType: 'daily',
  reportData: {
    metrics: {
      total_orders: 0,
      total_sales: 0,
      avg_order_value: 0
    },
    sales_report: {
      labels: [],
      values: []
    },
    category_distribution: [],
    top_selling_products: []
  },
  loading: false,
  error: null,
}

const reportSlice = createSlice({
  name: 'report',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload
    },
    setReportType: (state, action) => {
      state.reportType = action.payload
    },
    setReportData: (state, action) => {
      state.reportData = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReport.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchReport.fulfilled, (state, action) => {
        state.loading = false
        state.reportData = action.payload
      })
      .addCase(fetchReport.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { setLoading, setReportType, setReportData } = reportSlice.actions
export default reportSlice.reducer