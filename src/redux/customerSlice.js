import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  customers: [
    {
      id: 1,
      name: 'Rajesh Kumar',
      mobile: '+91 9876543210',
      email: 'rajesh@example.com',
      totalOrders: 45,
      totalSpent: 25600,
      lastOrder: '2024-01-15',
      isRepeat: true,
    },
    {
      id: 2,
      name: 'Priya Patel',
      mobile: '+91 9876543211',
      email: 'priya@example.com',
      totalOrders: 32,
      totalSpent: 18900,
      lastOrder: '2024-01-14',
      isRepeat: true,
    },
    {
      id: 3,
      name: 'Amit Shah',
      mobile: '+91 9876543212',
      email: 'amit@example.com',
      totalOrders: 12,
      totalSpent: 8500,
      lastOrder: '2024-01-13',
      isRepeat: false,
    },
  ],
  loading: false,
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
})

export const { setLoading, addCustomer } = customerSlice.actions
export default customerSlice.reducer