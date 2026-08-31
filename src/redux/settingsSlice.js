import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  settings: {
    openingTime: '08:00',
    closingTime: '22:00',
    deliveryRadius: 5,
    holidayMode: false,
    notifications: {
      orderAlerts: true,
      lowStockAlerts: true,
      customerMessages: true,
    },
  },
  loading: false,
}

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload
    },
    updateSettings: (state, action) => {
      state.settings = { ...state.settings, ...action.payload }
    },
    toggleHolidayMode: (state) => {
      state.settings.holidayMode = !state.settings.holidayMode
    },
    updateNotifications: (state, action) => {
      state.settings.notifications = {
        ...state.settings.notifications,
        ...action.payload,
      }
    },
  },
})

export const { setLoading, updateSettings, toggleHolidayMode, updateNotifications } =
  settingsSlice.actions
export default settingsSlice.reducer