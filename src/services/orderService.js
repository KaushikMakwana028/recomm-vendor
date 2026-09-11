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
  // backend sends 'pending' for brand-new orders; frontend tabs expect 'new'
  status: o.status === "pending" ? "new" : o.status,
  orderDate: o.created_at,
  deliveryOption: o.delivery_option || "",
  deliveryCharge: o.delivery_charge ? parseFloat(o.delivery_charge) : 0,
  distance: o.distance ? parseFloat(o.distance) : null,
  deliveryType: o.delivery_type || "normal",
  invoiceUrl: o.invoice_url || "",
  canDownloadInvoice: o.can_download_invoice ?? ["out_for_delivery", "delivered"].includes(o.status),
});

const orderService = {
  // Get all vendor orders (optional status filter: 'new','accepted','packed','out_for_delivery','delivered','cancelled')
  getAllOrders: async (status = "") => {
    // backend has no 'new' concept — it uses 'pending'
    const backendStatus = status === "new" ? "pending" : status;
    const data = await orderAPI.getVendorOrders(backendStatus);
    const list = (data.data || []).map(mapOrder);

    return {
      success: data.status ?? true,
      data: list,
    };
  },

  // Update order status ('accepted' | 'rejected' | 'packed' | 'out_for_delivery' | 'delivered' | 'cancelled')
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
        status,
        delivery_charge: response.data?.delivery_charge,
        total_amount: response.data?.total_amount,
        invoice_url: response.data?.invoice_url || "",
      },
    };
  },
};

export default orderService;
