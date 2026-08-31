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
  async ({ id, status, remarks = "" }, { rejectWithValue }) => {
    try {
      await orderService.updateOrderStatus(id, status, remarks);
      return { id, status };
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
        state.orders = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        const order = state.orders.find((o) => o.id === action.payload.id);
        if (order) order.status = action.payload.status;
      });
  },
});

export const { setLoading, addOrder } = orderSlice.actions
export default orderSlice.reducer;
