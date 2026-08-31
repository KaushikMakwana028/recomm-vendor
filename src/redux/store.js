import { configureStore } from '@reduxjs/toolkit'
import authReducer from './authSlice'
import storeReducer from './storeSlice'
import productReducer from './productSlice'
import orderReducer from './orderSlice'
import inventoryReducer from './inventorySlice'
import customerReducer from './customerSlice'
import offerReducer from './offerSlice'
import reportReducer from './reportSlice'
import settingsReducer from './settingsSlice'
import dashboardReducer from './dashboardSlice'

const store = configureStore({
  reducer: {
    auth: authReducer,
    store: storeReducer,
    product: productReducer,
    order: orderReducer,
    inventory: inventoryReducer,
    customer: customerReducer,
    offer: offerReducer,
    report: reportReducer,
    settings: settingsReducer,
    dashboard: dashboardReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
})

export default store