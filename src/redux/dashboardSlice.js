import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  stats: {
    todayOrders: 45,
    todaySales: 12500,
    pendingOrders: 8,
    customerRating: 4.5,
    notifications: 5,
  },
  recentOrders: [
    {
      id: 1,
      orderNumber: 'ORD-001',
      customerName: 'Rajesh Kumar',
      items: 5,
      amount: 850,
      status: 'pending',
      time: '10 mins ago',
    },
    {
      id: 2,
      orderNumber: 'ORD-002',
      customerName: 'Priya Patel',
      items: 3,
      amount: 450,
      status: 'accepted',
      time: '25 mins ago',
    },
    {
      id: 3,
      orderNumber: 'ORD-003',
      customerName: 'Amit Shah',
      items: 8,
      amount: 1200,
      status: 'packed',
      time: '45 mins ago',
    },
  ],
  topProducts: [
    { id: 1, name: 'Milk (1L)', sold: 85, revenue: 4250 },
    { id: 2, name: 'Rice (5kg)', sold: 45, revenue: 4500 },
    { id: 3, name: 'Bread', sold: 120, revenue: 3600 },
    { id: 4, name: 'Eggs (12pcs)', sold: 65, revenue: 3900 },
  ],
  salesData: [
    { day: 'Mon', sales: 2400 },
    { day: 'Tue', sales: 1398 },
    { day: 'Wed', sales: 9800 },
    { day: 'Thu', sales: 3908 },
    { day: 'Fri', sales: 4800 },
    { day: 'Sat', sales: 3800 },
    { day: 'Sun', sales: 4300 },
  ],
  loading: false,
}

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload
    },
    updateStats: (state, action) => {
      state.stats = { ...state.stats, ...action.payload }
    },
  },
})

export const { setLoading, updateStats } = dashboardSlice.actions
export default dashboardSlice.reducer