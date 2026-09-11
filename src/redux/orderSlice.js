import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import orderService from "../services/orderService";

const initialState = {
  orders: [],
  loading: false,
  error: null,
};

export const fetchOrders = createAsyncThunk(
  "order/fetchOrders",
  async (status = "", { rejectWithValue }) => {
    try {
      const response = await orderService.getAllOrders(status);
      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const updateOrderStatus = createAsyncThunk(
  "order/updateOrderStatus",
  async ({ id, status, remarks = "", deliveryOption = "", distance = "" }, { rejectWithValue }) => {
    try {
      const response = await orderService.updateOrderStatus(id, status, remarks, deliveryOption, distance);
      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    addOrder: (state, action) => {
      state.orders.unshift({
        id: Date.now(),
        orderNumber: `ORD-${String(state.orders.length + 1).padStart(3, "0")}`,
        ...action.payload,
        orderDate: new Date().toISOString(),
      });
      state.orders.sort((a, b) => {
        const aUrgent = a.deliveryType === "urgent" ? 1 : 0;
        const bUrgent = b.deliveryType === "urgent" ? 1 : 0;
        return bUrgent - aUrgent;
      });
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        const sortedOrders = [...action.payload].sort((a, b) => {
          const aUrgent = a.deliveryType === "urgent" ? 1 : 0;
          const bUrgent = b.deliveryType === "urgent" ? 1 : 0;
          if (aUrgent !== bUrgent) {
            return bUrgent - aUrgent;
          }
          return 0; // Preserve default order (time-based) for same type
        });
        state.orders = sortedOrders;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        const order = state.orders.find((o) => o.id === action.payload.id);
        if (order) {
          order.status = action.payload.status;
          if (action.payload.delivery_charge !== undefined && action.payload.delivery_charge !== null) {
            order.deliveryCharge = action.payload.delivery_charge;
          }
          if (action.payload.total_amount !== undefined && action.payload.total_amount !== null) {
            order.totalAmount = action.payload.total_amount;
          }
          if (action.meta.arg.deliveryOption) {
            order.deliveryOption = action.meta.arg.deliveryOption;
          }
          if (action.meta.arg.distance) {
            order.distance = parseFloat(action.meta.arg.distance);
          }
          if (action.payload.invoice_url) {
            order.invoiceUrl = action.payload.invoice_url;
          }
        }
      });
  },
});

export const { setLoading, addOrder } = orderSlice.actions
export default orderSlice.reducer;
