import { orderAPI } from "./api";

// Maps backend order shape -> frontend shape used by Orders.jsx / OrderDetail.jsx
const mapOrder = (o) => ({
  id: o.order_id,
  orderNumber: o.order_number,
  customerName: o.customer_name,
  mobile: o.customer_mobile,
  address: o.address,
  items: (o.items || []).map((it) => ({
    name: it.product_name,
    quantity: it.quantity,
    price: it.price,
    image: it.image,
  })),
  totalAmount: o.total_amount,
  paymentMethod: o.payment_method,
  paymentStatus: o.payment_status,
  // Canonical status as stored in DB: pending, confirmed, packed, out_for_delivery, delivered, cancelled
  status: o.status,
  orderDate: o.created_at,
  deliveryOption: o.delivery_option || "",
  deliveryCharge: o.delivery_charge ? parseFloat(o.delivery_charge) : 0,
  distance: o.distance ? parseFloat(o.distance) : null,
  deliveryType: o.delivery_type || "normal",
  chosenTimeOption: o.chosen_time_option || "immediately",
  estimatedWindowStart: o.estimated_window_start || null,
  estimatedWindowEnd: o.estimated_window_end || null,
  estimatedWindowFormatted: o.estimated_window_formatted || (o.chosen_time_option ? o.chosen_time_option.toUpperCase() : "Immediately"),
  customDeliveryTime: o.custom_delivery_time || null,
  invoiceUrl: o.invoice_url || "",
  canDownloadInvoice: o.can_download_invoice ?? ["out_for_delivery", "delivered"].includes(o.status),
});

const orderService = {
  // Get all vendor orders (optional status filter: 'pending','confirmed','packed','out_for_delivery','delivered','cancelled')
  getAllOrders: async (status = "") => {
    const data = await orderAPI.getVendorOrders(status);
    const list = (data.data || []).map(mapOrder);

    return {
      success: data.status ?? true,
      data: list,
    };
  },

  // Update order status ('confirmed' | 'packed' | 'out_for_delivery' | 'delivered' | 'cancelled')
  updateOrderStatus: async (orderId, status, remarks = "", deliveryOption = "", distance = "") => {
    const response = await orderAPI.updateVendorOrderStatus(
      orderId,
      status,
      remarks,
      deliveryOption,
      distance
    );
    return {
      success: response.status ?? true,
      message: response.message || "Order status updated successfully",
      data: {
        id: orderId,
        status: response.data?.status || status,
        delivery_charge: response.data?.delivery_charge,
        total_amount: response.data?.total_amount,
        invoice_url: response.data?.invoice_url || "",
      },
    };
  },
};

export default orderService;
