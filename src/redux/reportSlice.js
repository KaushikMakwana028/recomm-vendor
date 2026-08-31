import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  reportType: 'daily',
  reportData: {
    totalOrders: 45,
    totalSales: 12500,
    topProducts: [],
  },
  loading: false,
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
})

export const { setLoading, setReportType, setReportData } = reportSlice.actions
export default reportSlice.reducer